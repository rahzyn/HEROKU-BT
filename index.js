"use strict";
const baileys_1 = require("@whiskeysockets/baileys");
const pino = require("pino");
const conf = require("./set");
const fs = require("fs-extra");
const path = require("path");
const { Sticker } = require('wa-sticker-formatter');

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
const { handleAntilink } = require("./commandes/antilink");

let { reagir } = require(__dirname + "/framework/app");
var session = conf.session || "";
const prefixe = conf.PREFIXE || ".";

// Global variable for reaction rate limiting
global.lastReactionTime = 0;

// ============ ENSURE BDD FOLDER EXISTS ============
if (!fs.existsSync('./bdd')) {
    fs.mkdirSync('./bdd');
    console.log("✅ bdd folder created");
}

// ============ MESSAGE STORE FOR ANTI-DELETE ============
// Initialize message store in memory
if (!global.msgStore) global.msgStore = {};

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
            auth: { creds: state.creds, keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, pino({ level: "silent" })) },
            getMessage: async (key) => store?.loadMessage(key.remoteJid, key.id)?.message
        });

        store.bind(zk.ev);

        // ============ MAIN MESSAGE HANDLER WITH ANTI-DELETE ============
        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message) return;

            // ============ SIMPLE ANTI-DELETE ============
            try {
                const chatId = ms.key.remoteJid;
                
                // Store message in memory
                if (!global.msgStore[chatId]) {
                    global.msgStore[chatId] = [];
                }
                
                // Store message with important data
                global.msgStore[chatId].push({
                    key: ms.key,
                    message: ms.message,
                    messageTimestamp: ms.messageTimestamp || Date.now() / 1000,
                    pushName: ms.pushName
                });
                
                // Keep only last 30 messages per chat
                if (global.msgStore[chatId].length > 30) {
                    global.msgStore[chatId] = global.msgStore[chatId].slice(-30);
                }
                
                // Check for deleted messages using ANTIDELETE1
                if (conf.ANTIDELETE1 === "yes") {
                    if (ms.message?.protocolMessage && ms.message.protocolMessage.type === 0) {
                        
                        console.log("🗑️ DELETED MESSAGE DETECTED!");
                        
                        const deletedKey = ms.message.protocolMessage.key;
                        const messageId = deletedKey.id;
                        
                        // Find the deleted message in store
                        const deletedMessage = global.msgStore[chatId]?.find(
                            msg => msg.key.id === messageId
                        );
                        
                        if (deletedMessage) {
                            console.log("✅ Deleted message found in store!");
                            
                            try {
                                const participant = deletedMessage.key.participant || deletedMessage.key.remoteJid;
                                const senderNumber = participant.split('@')[0];
                                const ownerJid = conf.NUMERO_OWNER + "@s.whatsapp.net";
                                
                                // Get chat name if group
                                let chatName = chatId;
                                if (chatId.endsWith('@g.us')) {
                                    try {
                                        const groupMeta = await zk.groupMetadata(chatId);
                                        chatName = groupMeta.subject || chatId;
                                    } catch (e) {}
                                }
                                
                                // Extract content based on message type
                                let content = "";
                                let messageType = "TEXT";
                                
                                if (deletedMessage.message.conversation) {
                                    content = deletedMessage.message.conversation;
                                } else if (deletedMessage.message.extendedTextMessage?.text) {
                                    content = deletedMessage.message.extendedTextMessage.text;
                                } else if (deletedMessage.message.imageMessage) {
                                    messageType = "IMAGE";
                                    content = deletedMessage.message.imageMessage.caption || "";
                                } else if (deletedMessage.message.videoMessage) {
                                    messageType = "VIDEO";
                                    content = deletedMessage.message.videoMessage.caption || "";
                                } else if (deletedMessage.message.audioMessage) {
                                    messageType = "AUDIO";
                                } else if (deletedMessage.message.stickerMessage) {
                                    messageType = "STICKER";
                                } else {
                                    messageType = "UNKNOWN";
                                    content = "[Media Message]";
                                }
                                
                                // Send notification to owner
                                let messageText = `🗑️ *DELETED ${messageType}*\n`;
                                messageText += `👤 *From:* ${senderNumber}\n`;
                                messageText += `💬 *Chat:* ${chatName}\n`;
                                if (content) {
                                    messageText += `📝 *Content:* ${content}\n`;
                                }
                                
                                await zk.sendMessage(ownerJid, { text: messageText });
                                console.log(`✅ Deleted ${messageType} sent to owner`);
                                
                            } catch (sendError) {
                                console.error("Error sending deleted message:", sendError);
                            }
                        } else {
                            console.log("❌ Deleted message not found in store");
                        }
                    }
                }
            } catch (storeError) {
                console.log("Message store error:", storeError.message);
            }
            // ============ END ANTI-DELETE ============

            const decodeJid = (jid) => jid?.replace(/:\d+@/, '@') || jid;
            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation :
                       mtype == "imageMessage" ? ms.message.imageMessage?.caption :
                       mtype == "videoMessage" ? ms.message.videoMessage?.caption :
                       mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : "";
            
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            var nomGroupe = verifGroupe ? infosGroupe.subject : "";
            var auteurMessage = verifGroupe ? (ms.key.participant || ms.participant) : origineMessage;
            if (ms.key.fromMe) auteurMessage = idBot;

            // ============ SUDO & ADMIN ============
            const sudo = await getAllSudoNumbers();
            const superUser = [idBot.split('@')[0], conf.NUMERO_OWNER].map(s => s + "@s.whatsapp.net").concat(sudo).includes(auteurMessage);
            
            function groupeAdmin(m) { return m?.filter(v => v.admin).map(v => v.id) || []; }
            const mbre = verifGroupe ? infosGroupe.participants : [];
            let admins = groupeAdmin(mbre);
            const verifAdmin = admins.includes(auteurMessage);
            const verifZokouAdmin = admins.includes(idBot);

            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }

            // ============ COMMAND OPTIONS ============
            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : "";
            
            var commandeOptions = { superUser, verifGroupe, verifAdmin, verifZokouAdmin, infosGroupe, nomGroupe, auteurMessage, idBot, prefixe, arg, repondre, mtype, ms };

            // ============ AUTO STATUS ============
            if (ms.key && ms.key.remoteJid === "status@broadcast") {
                
                console.log("Status detected from:", ms.key.participant?.split('@')[0] || 'unknown');
                
                // 1. AUTO READ STATUS
                if (conf.AUTO_READ_STATUS === "yes") {
                    try {
                        await zk.readMessages([ms.key]);
                        console.log("Status read");
                    } catch (readError) {
                        console.log("Auto-read failed:", readError.message);
                    }
                }
                
                // 2. AUTO REACT STATUS
                if (conf.AUTO_REACT_STATUS === "yes") {
                    
                    const now = Date.now();
                    if (now - (global.lastReactionTime || 0) < 5000) {
                        console.log("Throttling reaction");
                    } else {
                        
                        const botId = zk.user && zk.user.id ? 
                            zk.user.id.split(":")[0] + "@s.whatsapp.net" : 
                            null;
                            
                        if (!botId) {
                            console.log("Bot ID not available");
                        } else {
                            
                            try {
                                await zk.sendMessage(ms.key.remoteJid, {
                                    react: {
                                        key: ms.key,
                                        text: "💙",
                                    }
                                }, {
                                    statusJidList: [ms.key.participant, botId],
                                });
                                
                                global.lastReactionTime = Date.now();
                                console.log(`Reacted to status with 💙`);
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                
                            } catch (error) {
                                console.log("React error:", error.message);
                            }
                        }
                    }
                }
                
                // 3. AUTO DOWNLOAD STATUS
                if (conf.AUTO_DOWNLOAD_STATUS === "yes") {
                    try {
                        const ownerNumber = conf.NUMERO_OWNER + "@s.whatsapp.net";
                        const statusSender = ms.key.participant || ms.participant;
                        
                        if (statusSender === ownerNumber) return;
                        
                        if (ms.message?.extendedTextMessage) {
                            var stTxt = ms.message.extendedTextMessage.text;
                            await zk.sendMessage(ownerNumber, { 
                                text: `📱 *STATUS UPDATE*\nFrom: @${statusSender.split('@')[0]}\n\n${stTxt}`,
                                mentions: [statusSender]
                            });
                        }
                        else if (ms.message?.imageMessage) {
                            var stMsg = ms.message.imageMessage.caption || "";
                            var stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage, `status_${Date.now()}`);
                            await zk.sendMessage(ownerNumber, { 
                                image: { url: stImg }, 
                                caption: `📱 *STATUS UPDATE*\nFrom: @${statusSender.split('@')[0]}\n\n${stMsg}`,
                                mentions: [statusSender]
                            });
                        }
                        else if (ms.message?.videoMessage) {
                            var stMsg = ms.message.videoMessage.caption || "";
                            var stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage, `status_${Date.now()}`);
                            await zk.sendMessage(ownerNumber, {
                                video: { url: stVideo }, 
                                caption: `📱 *STATUS UPDATE*\nFrom: @${statusSender.split('@')[0]}\n\n${stMsg}`,
                                mentions: [statusSender]
                            });
                        }
                    } catch (downloadError) {
                        console.log("Auto-download failed:", downloadError.message);
                    }
                }
            }
            
            // ============ FEATURES ============
            
            // 1. ANTILINK
            try { if (verifGroupe) await handleAntilink(zk, ms, auteurMessage, origineMessage, verifAdmin, verifZokouAdmin, superUser); } catch (e) {}
            
            // 2. LEVEL SYSTEM
            if (texte && auteurMessage.endsWith("s.whatsapp.net")) try { await ajouterOuMettreAJourUserData(auteurMessage); } catch (e) {}
            
            // 3. ANTIBUG
            try { if (!ms.key.fromMe && (await processIncomingMessage(zk, ms, auteurMessage)).blocked) return; } catch (e) {}
            
            // 4. ANTI-LIEN
            try {
                if (texte?.includes('https://') && verifGroupe && await verifierEtatJid(origineMessage) && !superUser && !verifAdmin && verifZokouAdmin) {
                    await zk.sendMessage(origineMessage, { delete: ms.key });
                    let action = await recupererActionJid(origineMessage);
                    if (action === 'remove') await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                }
            } catch (e) {}
            
            // 5. ANTI-BOT
            try {
                if ((ms.key?.id?.startsWith('BAES') || ms.key?.id?.startsWith('BAE5')) && mtype !== 'reactionMessage') {
                    if (await atbverifierEtatJid(origineMessage) && !verifAdmin && auteurMessage !== idBot) {
                        await zk.sendMessage(origineMessage, { delete: ms.key });
                        if ((await atbrecupererActionJid(origineMessage)) === 'remove') await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                    }
                }
            } catch (e) {}
            
            // 6. BAN CHECKS
            if (!superUser) {
                if (verifGroupe && await isGroupBanned(origineMessage)) return;
                if (!verifAdmin && verifGroupe && await isGroupOnlyAdmin(origineMessage)) return;
                if (await isUserBanned(auteurMessage)) { repondre("You are banned from bot commands"); return; }
            }

            // 7. COMMANDS
            if (verifCom) {
                if (conf.MODE?.toLowerCase() != 'yes' && !superUser) return;
                if (!superUser && origineMessage === auteurMessage && conf.PM_PERMIT === "yes") return repondre("PM not allowed for commands");
                
                const cd = evt.cm.find(c => c.nomCom === com);
                if (cd) {
                    try {
                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    } catch (e) { console.log(e); }
                }
            }
        });

        // ============ GROUP PARTICIPANTS UPDATE ============
        zk.ev.on('group-participants.update', async (group) => {
            try {
                const metadata = await zk.groupMetadata(group.id);
                const groupName = metadata.subject || "Group";
                
                if (group.action == 'add' && await recupevents(group.id, "welcome") == 'on') {
                    let msg = `👋 Welcome @${group.participants[0].split('@')[0]} to ${groupName}`;
                    await zk.sendMessage(group.id, { text: msg, mentions: group.participants });
                }
                else if (group.action == 'remove' && await recupevents(group.id, "goodbye") == 'on') {
                    let msg = `👋 Goodbye @${group.participants[0].split('@')[0]}`;
                    await zk.sendMessage(group.id, { text: msg, mentions: group.participants });
                }
            } catch (e) {}
        });

        // ============ CONNECTION ============
        zk.ev.on("connection.update", async (con) => {
            if (con.connection === 'open') {
                console.log("HEROKU-BT Connected Successfully!");
                
                // Load commands
                fs.readdirSync(__dirname + "/commandes").forEach(f => {
                    if (f.endsWith(".js")) {
                        try { 
                            require(__dirname + "/commandes/" + f); 
                            console.log("Loaded: " + f); 
                        } catch (e) {}
                    }
                });
                
                if (conf.DP === 'yes') {
                    await zk.sendMessage(zk.user.id, { 
                        text: "🤖 *HEROKU-BT Connected*\n_Powered by BMB-TECH_" 
                    });
                }
            } else if (con.connection == "close") {
                console.log("Connection closed, reconnecting...");
                setTimeout(main, 5000);
            }
        });

        zk.ev.on("creds.update", saveCreds);
        
        // ============ UTILITY FUNCTIONS ============
        zk.downloadAndSaveMediaMessage = async (message, filename = '') => {
            let quoted = message.msg || message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            const FileType = require('file-type');
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './temp/' + filename + '_' + Date.now() + '.' + type.ext;
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };
    }

    // Watch for file changes
    fs.watchFile(__filename, () => { 
        fs.unwatchFile(__filename); 
        delete require.cache[__filename]; 
        require(__filename); 
    });
    
    main();
}, 5000);
