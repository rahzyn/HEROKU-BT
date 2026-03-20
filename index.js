"use strict";
const baileys_1 = require("@whiskeysockets/baileys");
const pino = require("pino");
const conf = require("./set");
const fs = require("fs-extra");

// ============ IMPORTS ============
const { verifierEtatJid, recupererActionJid } = require("./bdd/antilien");
const { atbverifierEtatJid, atbrecupererActionJid } = require("./bdd/antibot");
let evt = require(__dirname + "/framework/zokou");
const { isUserBanned } = require("./bdd/banUser");
const { isGroupBanned } = require("./bdd/banGroup");
const { isGroupOnlyAdmin } = require("./bdd/onlyAdmin");
const { getAllSudoNumbers } = require("./bdd/sudo");
const { ajouterOuMettreAJourUserData } = require("./bdd/level");
const { recupevents } = require('./bdd/welcome');

// ============ FEATURE IMPORTS ============
const { processIncomingMessage } = require("./framework/bugDetector");
const { handleDeletedMessage } = require("./commandes/antidelete");
const { handleAntilink } = require("./commandes/antilink");
const { handleAntistatus } = require("./commandes/antistatus");

let { reagir } = require(__dirname + "/framework/app");
const prefixe = conf.PREFIXE || ".";

// ============ RATE LIMITING - Reaction throttle ============
global.lastReactionTime = 0;

// ============ GROUP METADATA CACHE ============
const groupMetadataCache = {};
const GROUP_CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

async function getGroupMetadata(zk, groupId) {
    const now = Date.now();
    const cached = groupMetadataCache[groupId];
    if (cached && (now - cached.timestamp) < GROUP_CACHE_TTL) {
        return cached.data;
    }
    try {
        const metadata = await zk.groupMetadata(groupId);
        groupMetadataCache[groupId] = { data: metadata, timestamp: now };
        return metadata;
    } catch (e) {
        return cached ? cached.data : null;
    }
}

// ============ ANTI-MENTION SYSTEM ============
let antiMentionSettings = new Map(); // Store group settings { groupId: { enabled: boolean, warns: Map(senderId => count) } }
const MAX_WARNS = 2; // Warn twice before removal
const WARN_TIMEOUT = 30 * 60 * 1000; // 30 minutes timeout after removal

// Helper function to clean expired warns
function cleanExpiredWarns(settings) {
    const now = Date.now();
    for (const [userId, data] of settings.warns.entries()) {
        if (now - data.timestamp > WARN_TIMEOUT) {
            settings.warns.delete(userId);
        }
    }
    return settings;
}

// Helper function to check if user is admin
function isGroupAdmin(participants, userId) {
    const admin = participants.find(p => p.id === userId && (p.admin === 'admin' || p.admin === 'superadmin'));
    return !!admin;
}

// ============ AUTHENTICATION ============
async function authentification() {
    try {
        const authFolder = __dirname + "/auth";
        if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);

        const credsPath = authFolder + "/creds.json";

        if (conf.session && conf.session !== "zokk" && conf.session.length > 20) {
            console.log("Loading session...");
            let sessionData = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g, "");
            await fs.writeFile(credsPath, Buffer.from(sessionData, 'base64').toString('utf-8'));
            console.log("Session loaded successfully");
        }
    } catch (e) {
        console.log("Session Error:", e.message);
    }
}
authentification();

// ============ BAILEYS VERSION ============
async function getBaileysVersion() {
    try {
        const version = await (0, baileys_1.fetchLatestBaileysVersion)();
        console.log("Baileys version:", version.version.join('.'));
        return version;
    } catch {
        return { version: [2, 3000, 1014082914] };
    }
}

const store = (0, baileys_1.makeInMemoryStore)({ logger: pino().child({ level: "silent" }) });

// ============ TEMP FOLDER ============
if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

setTimeout(() => {
    async function main() {
        const { version } = await getBaileysVersion();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/auth");

        const zk = (0, baileys_1.default)({
            version,
            logger: pino({ level: "silent" }),
            browser: ['HEROKU-BT', "safari", "1.0.0"],
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, pino({ level: "silent" }))
            },
            getMessage: async (key) => store?.loadMessage(key.remoteJid, key.id)?.message
        });

        store.bind(zk.ev);

        // ============ MESSAGES ============
        zk.ev.on("messages.upsert", async (m) => {
            const ms = m.messages[0];
            if (!ms.message) return;

            const decodeJid = (jid) => jid?.replace(/:\d+@/, '@') || jid;
            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation :
                        mtype == "imageMessage" ? ms.message.imageMessage?.caption :
                        mtype == "videoMessage" ? ms.message.videoMessage?.caption :
                        mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : "";

            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            const verifGroupe = origineMessage?.endsWith("@g.us");

            var infosGroupe = verifGroupe ? await getGroupMetadata(zk, origineMessage) : null;
            var nomGroupe = infosGroupe ? infosGroupe.subject : "";
            var auteurMessage = verifGroupe ? (ms.key.participant || ms.participant) : origineMessage;
            if (ms.key.fromMe) auteurMessage = idBot;

            // ============ SUDO & ADMIN ============
            const sudo = await getAllSudoNumbers();
            const superUser = [idBot.split('@')[0], conf.NUMERO_OWNER]
                .map(s => s + "@s.whatsapp.net")
                .concat(sudo)
                .includes(auteurMessage);

            function groupeAdmin(membres) {
                return membres?.filter(v => v.admin).map(v => v.id) || [];
            }
            const mbre = infosGroupe ? infosGroupe.participants : [];
            let admins = groupeAdmin(mbre);
            const verifAdmin = admins.includes(auteurMessage);
            const verifZokouAdmin = admins.includes(idBot);

            function repondre(mes) {
                zk.sendMessage(origineMessage, { text: mes }, { quoted: ms });
            }

            // ============ COMMAND OPTIONS ============
            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : "";

            var commandeOptions = {
                superUser, verifGroupe, verifAdmin, verifZokouAdmin,
                infosGroupe, nomGroupe, auteurMessage, idBot,
                prefixe, arg, repondre, mtype, ms
            };

            // ============ AUTO STATUS ============
            if (ms.key && ms.key.remoteJid === "status@broadcast") {

                console.log("Status detected from:", ms.key.participant?.split('@')[0] || 'unknown');

                // 1. AUTO READ STATUS
                if (conf.AUTO_READ_STATUS === "yes") {
                    try {
                        await zk.readMessages([ms.key]);
                        console.log("Status read");
                    } catch (e) {
                        console.log("Auto-read failed:", e.message);
                    }
                }

                // 2. AUTO REACT STATUS
                if (conf.AUTO_REACT_STATUS === "yes") {
                    const now = Date.now();
                    if (now - (global.lastReactionTime || 0) < 5000) {
                        console.log("Throttling reaction to prevent overflow");
                    } else {
                        const botId = zk.user?.id ?
                            zk.user.id.split(":")[0] + "@s.whatsapp.net" : null;

                        if (!botId) {
                            console.log("Bot ID not available. Skipping reaction.");
                        } else {
                            try {
                                await zk.sendMessage(ms.key.remoteJid, {
                                    react: { key: ms.key, text: "💙" }
                                }, {
                                    statusJidList: [ms.key.participant, botId]
                                });
                                global.lastReactionTime = Date.now();
                                console.log("Reacted to status with 💙");
                                await new Promise(resolve => setTimeout(resolve, 2000));
                            } catch (error) {
                                console.log("React error:", error.message);
                                setTimeout(async () => {
                                    try {
                                        await zk.sendMessage(ms.key.remoteJid, {
                                            react: { key: ms.key, text: "💙" }
                                        }, {
                                            statusJidList: [ms.key.participant, botId]
                                        });
                                        global.lastReactionTime = Date.now();
                                        console.log("React success on retry");
                                    } catch (e) {
                                        console.log("React retry failed:", e.message);
                                    }
                                }, 3000);
                            }
                        }
                    }
                }

                // 3. AUTO DOWNLOAD STATUS
                if (conf.AUTO_DOWNLOAD_STATUS === "yes") {
                    try {
                        const ownerNumber = conf.NUMERO_OWNER + "@s.whatsapp.net";
                        const statusSender = ms.key.participant || ms.participant;

                        if (statusSender && statusSender !== ownerNumber) {
                            if (ms.message?.extendedTextMessage) {
                                var stTxt = ms.message.extendedTextMessage.text;
                                await zk.sendMessage(ownerNumber, {
                                    text: `📱 *STATUS UPDATE*\nFrom: @${statusSender.split('@')[0]}\n\n${stTxt}`,
                                    mentions: [statusSender]
                                });
                            } else if (ms.message?.imageMessage) {
                                var stMsg = ms.message.imageMessage.caption || "";
                                var stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage, `status_${Date.now()}`);
                                await zk.sendMessage(ownerNumber, {
                                    image: { url: stImg },
                                    caption: `📱 *STATUS UPDATE*\nFrom: @${statusSender.split('@')[0]}\n\n${stMsg}`,
                                    mentions: [statusSender]
                                });
                            } else if (ms.message?.videoMessage) {
                                var stMsg = ms.message.videoMessage.caption || "";
                                var stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage, `status_${Date.now()}`);
                                await zk.sendMessage(ownerNumber, {
                                    video: { url: stVideo },
                                    caption: `📱 *STATUS UPDATE*\nFrom: @${statusSender.split('@')[0]}\n\n${stMsg}`,
                                    mentions: [statusSender]
                                });
                            }
                        }
                    } catch (e) {
                        console.log("Auto-download failed:", e.message);
                    }
                }

                // ============ ANTI-MENTION FOR STATUS ============
                try {
                    const statusText = ms.message?.extendedTextMessage?.text || "";
                    const mentionedJids = ms.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    const statusSender = ms.key.participant;
                    const botNumber = idBot.split('@')[0];
                    const ownerNumber = conf.NUMERO_OWNER;

                    if (mentionedJids.includes(ownerNumber + "@s.whatsapp.net") || 
                        mentionedJids.includes(botNumber + "@s.whatsapp.net") ||
                        statusText.includes(ownerNumber) || 
                        statusText.includes(botNumber)) {
                        
                        try {
                            await zk.updateBlockStatus(statusSender, "block");
                            console.log(`🚫 Blocked ${statusSender} for mentioning owner/bot in status`);
                            
                            try {
                                await zk.chatModify({ 
                                    clear: { 
                                        messages: [{ 
                                            id: ms.key.id, 
                                            fromMe: false, 
                                            timestamp: Date.now() / 1000 
                                        }] 
                                    } 
                                }, jid);
                            } catch (e) {}
                            
                        } catch (err) {
                            console.error("Error handling status mention:", err);
                        }
                    }
                } catch (e) {
                    console.error("Error in status anti-mention:", e);
                }

                // Status handled — return early
                return;
            }

            // ============ FEATURES ============

            // 1. ANTI-DELETE
            try {
                await handleDeletedMessage(zk, ms, conf.NUMERO_OWNER + "@s.whatsapp.net");
            } catch (e) {}

            // 2. ANTILINK
            try {
                if (verifGroupe) await handleAntilink(zk, ms, auteurMessage, origineMessage, verifAdmin, verifZokouAdmin, superUser);
            } catch (e) {}

            // 3. ANTISTATUS
            try {
                if (verifGroupe) {
                    const statusBlocked = await handleAntistatus(zk, ms, auteurMessage, origineMessage, verifAdmin, verifZokouAdmin, superUser);
                    if (statusBlocked) return;
                }
            } catch (e) {}

            // 4. LEVEL SYSTEM
            if (texte && auteurMessage.endsWith("s.whatsapp.net")) {
                try { await ajouterOuMettreAJourUserData(auteurMessage); } catch (e) {}
            }

            // 5. ANTIBUG
            try {
                if (!ms.key.fromMe && (await processIncomingMessage(zk, ms, auteurMessage)).blocked) return;
            } catch (e) {}

            // 6. ANTI-LIEN
            try {
                if (
                    texte?.includes('https://') &&
                    verifGroupe &&
                    await verifierEtatJid(origineMessage) &&
                    !superUser &&
                    !verifAdmin &&
                    verifZokouAdmin
                ) {
                    await zk.sendMessage(origineMessage, { delete: ms.key });
                    let action = await recupererActionJid(origineMessage);
                    if (action === 'remove') {
                        await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                    }
                }
            } catch (e) {}

            // 7. ANTI-BOT
            try {
                if (
                    (ms.key?.id?.startsWith('BAES') || ms.key?.id?.startsWith('BAE5')) &&
                    mtype !== 'reactionMessage'
                ) {
                    if (await atbverifierEtatJid(origineMessage) && !verifAdmin && auteurMessage !== idBot) {
                        await zk.sendMessage(origineMessage, { delete: ms.key });
                        if ((await atbrecupererActionJid(origineMessage)) === 'remove') {
                            await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                        }
                    }
                }
            } catch (e) {}

            // 8. BAN CHECKS
            if (!superUser) {
                if (verifGroupe && await isGroupBanned(origineMessage)) return;
                if (!verifAdmin && verifGroupe && await isGroupOnlyAdmin(origineMessage)) return;
                if (await isUserBanned(auteurMessage)) {
                    repondre("You are banned from bot commands");
                    return;
                }
            }

            // ============ ANTI-MENTION FOR GROUPS ============
            try {
                if (verifGroupe) {
                    const settings = antiMentionSettings.get(origineMessage);
                    if (settings && settings.enabled) {
                        const metadata = infosGroupe;
                        if (metadata && metadata.participants) {
                            const contextInfo = ms.message?.extendedTextMessage?.contextInfo;
                            if (contextInfo && contextInfo.mentionedJid) {
                                const mentionedJids = contextInfo.mentionedJid;
                                const botNumber = idBot.split('@')[0];
                                const ownerNumber = conf.NUMERO_OWNER;
                                const isBotMentioned = mentionedJids.includes(idBot) || mentionedJids.includes(botNumber + "@s.whatsapp.net");
                                const isOwnerMentioned = mentionedJids.includes(ownerNumber + "@s.whatsapp.net");

                                if (isBotMentioned || isOwnerMentioned) {
                                    const isSenderAdmin = isGroupAdmin(metadata.participants, auteurMessage);
                                    
                                    if (isSenderAdmin) {
                                        await zk.sendMessage(origineMessage, { 
                                            text: `⚠️ Admin @${auteurMessage.split('@')[0]} mentioned the ${isBotMentioned ? 'bot' : 'owner'}. Be careful!`, 
                                            mentions: [auteurMessage] 
                                        });
                                        return;
                                    }

                                    await zk.sendMessage(origineMessage, { delete: ms.key });
                                    
                                    const updatedSettings = cleanExpiredWarns(settings);
                                    const userWarn = updatedSettings.warns.get(auteurMessage) || { count: 0, timestamp: Date.now() };
                                    userWarn.count += 1;
                                    userWarn.timestamp = Date.now();
                                    updatedSettings.warns.set(auteurMessage, userWarn);
                                    antiMentionSettings.set(origineMessage, updatedSettings);
                                    
                                    const warnMessage = `⚠️ *WARNING ${userWarn.count}/${MAX_WARNS}*\n@${auteurMessage.split('@')[0]}, you mentioned the ${isBotMentioned ? 'bot' : 'owner'}!`;
                                    
                                    if (userWarn.count >= MAX_WARNS) {
                                        if (verifZokouAdmin) {
                                            await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                                            await zk.sendMessage(origineMessage, { 
                                                text: `🚫 @${auteurMessage.split('@')[0]} has been removed for repeatedly mentioning the ${isBotMentioned ? 'bot' : 'owner'}.`, 
                                                mentions: [auteurMessage] 
                                            });
                                            
                                            updatedSettings.warns.delete(auteurMessage);
                                            antiMentionSettings.set(origineMessage, updatedSettings);
                                        } else {
                                            await zk.sendMessage(origineMessage, { 
                                                text: `⚠️ @${auteurMessage.split('@')[0]} would be removed but I'm not an admin!`, 
                                                mentions: [auteurMessage] 
                                            });
                                        }
                                    } else {
                                        const warningMsg = await zk.sendMessage(origineMessage, { 
                                            text: warnMessage, 
                                            mentions: [auteurMessage] 
                                        });
                                        
                                        setTimeout(async () => {
                                            try {
                                                if (warningMsg && warningMsg.key) {
                                                    await zk.sendMessage(origineMessage, { delete: warningMsg.key });
                                                }
                                            } catch (e) {}
                                        }, 10000);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Error in group anti-mention:", e);
            }

            // 9. COMMANDS
            if (verifCom) {
                if (conf.MODE?.toLowerCase() != 'yes' && !superUser) return;
                if (!superUser && origineMessage === auteurMessage && conf.PM_PERMIT === "yes") {
                    return repondre("PM not allowed for commands");
                }

                const cd = evt.cm.find(c => c.nomCom === com);
                if (cd) {
                    try {
                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        });

        // ============ GROUP PARTICIPANTS UPDATE ============
        zk.ev.on('group-participants.update', async (group) => {
            try {
                delete groupMetadataCache[group.id];

                const metadata = await getGroupMetadata(zk, group.id);
                const groupName = metadata?.subject || "Group";

                if (group.action == 'add' && await recupevents(group.id, "welcome") == 'on') {
                    let msg = `👋 Welcome @${group.participants[0].split('@')[0]} to ${groupName}`;
                    await zk.sendMessage(group.id, { text: msg, mentions: group.participants });
                } else if (group.action == 'remove' && await recupevents(group.id, "goodbye") == 'on') {
                    let msg = `👋 Goodbye @${group.participants[0].split('@')[0]}`;
                    await zk.sendMessage(group.id, { text: msg, mentions: group.participants });
                }
            } catch (e) {}
        });

        // ============ CONNECTION ============
        zk.ev.on("connection.update", async (con) => {
            if (con.connection === 'open') {
                console.log("HEROKU-BT Connected Successfully!");

                fs.readdirSync(__dirname + "/commandes").forEach(f => {
                    if (f.endsWith(".js")) {
                        try {
                            require(__dirname + "/commandes/" + f);
                            console.log("Loaded: " + f);
                        } catch (e) {
                            console.log("Failed to load: " + f, e.message);
                        }
                    }
                });

                if (conf.DP === 'yes') {
                    await zk.sendMessage(zk.user.id, {
                        text: "🤖 *HEROKU-BT Connected*\n_Powered by RAHMANI-XMD_"
                    });
                }

            } else if (con.connection == "close") {
                console.log("Connection closed, reconnecting...");
                setTimeout(main, 5000);
            }
        });

        zk.ev.on("creds.update", saveCreds);

        // ============ UTILITY: DOWNLOAD MEDIA ============
        zk.downloadAndSaveMediaMessage = async (message, filename = '') => {
            let quoted = message.msg || message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype
                ? message.mtype.replace(/Message/gi, '')
                : mime.split('/')[0];

            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const FileType = require('file-type');
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './temp/' + filename + '_' + Date.now() + '.' + type.ext;

            await fs.writeFile(trueFileName, buffer);
            return trueFileName;
        };
    }

    fs.watchFile(__filename, () => {
        fs.unwatchFile(__filename);
        delete require.cache[__filename];
        require(__filename);
    });

    main();
}, 5000);
