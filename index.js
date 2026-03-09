"use strict";
const baileys_1 = require("@whiskeysockets/baileys");
const pino = require("pino");
const conf = require("./set");
const fs = require("fs-extra");
const path = require("path");
const { Sticker } = require('wa-sticker-formatter');

// ============ IMPORTS ZAKO ============
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

let { reagir } = require(__dirname + "/framework/app");
var session = conf.session || "";
const prefixe = conf.PREFIXE || ".";

// ============ AUTHENTICATION ============
async function authentification() {
    try {
        const authFolder = __dirname + "/auth";
        if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);
        
        const credsPath = authFolder + "/creds.json";
        
        if (conf.session && conf.session !== "zokk" && conf.session.length > 20) {
            console.log("📱 Loading session...");
            let sessionData = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g, "");
            await fs.writeFile(credsPath, Buffer.from(sessionData, 'base64').toString('utf-8'));
            console.log("✅ Session loaded");
        }
    } catch (e) {
        console.log("❌ Session Error:", e.message);
    }
}
authentification();

// ============ BAILEYS VERSION ============
async function getBaileysVersion() {
    try {
        const version = await (0, baileys_1.fetchLatestBaileysVersion)();
        console.log("✅ Baileys version:", version.version.join('.'));
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

            // ============ AUTO STATUS - FIXED VERSION WITH RETRY ============
            if (ms.key && ms.key.remoteJid === "status@broadcast") {
                
                const statusSender = ms.key.participant || ms.participant || 'unknown';
                const statusSenderNumber = statusSender.split('@')[0];
                
                console.log(`📱 Status detected from: ${statusSenderNumber}`);
                
                // 1. AUTO READ STATUS
                if (conf.AUTO_READ_STATUS === "yes") {
                    try {
                        await zk.readMessages([ms.key]);
                        console.log(`✅ Auto-read status from ${statusSenderNumber}`);
                    } catch (readError) {
                        console.log("❌ Auto-read failed:", readError.message);
                        
                        // Try again after delay
                        setTimeout(async () => {
                            try {
                                await zk.readMessages([ms.key]);
                                console.log(`✅ Auto-read success on retry`);
                            } catch (e) {}
                        }, 3000);
                    }
                }
                
                // 2. AUTO REACT STATUS (💙) - IMPROVED WITH RETRY
                if (conf.AUTO_REACT_STATUS === "yes") {
                    
                    // Function to try reacting
                    const tryReact = async (delay) => {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        try {
                            await zk.sendMessage(ms.key.remoteJid, {
                                react: {
                                    text: "💙",
                                    key: ms.key
                                }
                            });
                            console.log(`✅ Reacted to status from ${statusSenderNumber} with 💙 (after ${delay}ms)`);
                            return true;
                        } catch (error) {
                            console.log(`❌ React failed after ${delay}ms:`, error.message);
                            return false;
                        }
                    };
                    
                    // Try multiple delays
                    (async () => {
                        // Try after 2 seconds
                        let success = await tryReact(2000);
                        
                        // If failed, try after 5 seconds
                        if (!success) {
                            success = await tryReact(5000);
                        }
                        
                        // If still failed, try after 10 seconds
                        if (!success) {
                            await tryReact(10000);
                        }
                    })();
                }
                
                // 3. AUTO DOWNLOAD STATUS (optional)
                if (conf.AUTO_DOWNLOAD_STATUS === "yes") {
                    try {
                        const ownerNumber = conf.NUMERO_OWNER + "@s.whatsapp.net";
                        
                        // Skip if sender is owner to avoid spam
                        if (statusSender === ownerNumber) return;
                        
                        if (ms.message?.extendedTextMessage) {
                            var stTxt = ms.message.extendedTextMessage.text;
                            await zk.sendMessage(ownerNumber, { 
                                text: `📱 *STATUS UPDATE*\nFrom: @${statusSenderNumber}\n\n${stTxt}`,
                                mentions: [statusSender]
                            });
                        }
                        else if (ms.message?.imageMessage) {
                            var stMsg = ms.message.imageMessage.caption || "";
                            var stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage, `status_${Date.now()}`);
                            await zk.sendMessage(ownerNumber, { 
                                image: { url: stImg }, 
                                caption: `📱 *STATUS UPDATE*\nFrom: @${statusSenderNumber}\n\n${stMsg}`,
                                mentions: [statusSender]
                            });
                        }
                        else if (ms.message?.videoMessage) {
                            var stMsg = ms.message.videoMessage.caption || "";
                            var stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage, `status_${Date.now()}`);
                            await zk.sendMessage(ownerNumber, {
                                video: { url: stVideo }, 
                                caption: `📱 *STATUS UPDATE*\nFrom: @${statusSenderNumber}\n\n${stMsg}`,
                                mentions: [statusSender]
                            });
                        }
                    } catch (downloadError) {
                        console.log("❌ Auto-download failed:", downloadError.message);
                    }
                }
            }
            
            // ============ FEATURES ============
            
            // 1. ANTI-DELETE
            try { await handleDeletedMessage(zk, ms, conf.NUMERO_OWNER + "@s.whatsapp.net"); } catch (e) {}
            
            // 2. ANTILINK
            try { if (verifGroupe) await handleAntilink(zk, ms, auteurMessage, origineMessage, verifAdmin, verifZokouAdmin, superUser); } catch (e) {}
            
            // 3. LEVEL SYSTEM
            if (texte && auteurMessage.endsWith("s.whatsapp.net")) try { await ajouterOuMettreAJourUserData(auteurMessage); } catch (e) {}
            
            // 4. ANTIBUG
            try { if (!ms.key.fromMe && (await processIncomingMessage(zk, ms, auteurMessage)).blocked) return; } catch (e) {}
            
            // 5. ANTI-LIEN (EXISTING)
            try {
                if (texte?.includes('https://') && verifGroupe && await verifierEtatJid(origineMessage) && !superUser && !verifAdmin && verifZokouAdmin) {
                    await zk.sendMessage(origineMessage, { delete: ms.key });
                    let action = await recupererActionJid(origineMessage);
                    if (action === 'remove') await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                }
            } catch (e) {}
            
            // 6. ANTI-BOT
            try {
                if ((ms.key?.id?.startsWith('BAES') || ms.key?.id?.startsWith('BAE5')) && mtype !== 'reactionMessage') {
                    if (await atbverifierEtatJid(origineMessage) && !verifAdmin && auteurMessage !== idBot) {
                        await zk.sendMessage(origineMessage, { delete: ms.key });
                        if ((await atbrecupererActionJid(origineMessage)) === 'remove') await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                    }
                }
            } catch (e) {}
            
            // 7. BAN CHECKS
            if (!superUser) {
                if (verifGroupe && await isGroupBanned(origineMessage)) return;
                if (!verifAdmin && verifGroupe && await isGroupOnlyAdmin(origineMessage)) return;
                if (await isUserBanned(auteurMessage)) { repondre("❌ You are banned"); return; }
            }

            // 8. COMMANDS
            if (verifCom) {
                if (conf.MODE?.toLowerCase() != 'yes' && !superUser) return;
                if (!superUser && origineMessage === auteurMessage && conf.PM_PERMIT === "yes") return repondre("❌ PM not allowed");
                
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
                if (group.action == 'add' && await recupevents(group.id, "welcome") == 'on') {
                    let msg = `👋 Welcome @${group.participants[0].split('@')[0]}`;
                    zk.sendMessage(group.id, { text: msg, mentions: group.participants });
                }
            } catch (e) {}
        });

        // ============ CONNECTION ============
        zk.ev.on("connection.update", async (con) => {
            if (con.connection === 'open') {
                console.log("✅ HEROKU-BT Connected!");
                fs.readdirSync(__dirname + "/commandes").forEach(f => {
                    if (f.endsWith(".js")) try { require(__dirname + "/commandes/" + f); console.log("✅ " + f); } catch (e) {}
                });
                if (conf.DP === 'yes') await zk.sendMessage(zk.user.id, { text: "🤖 *HEROKU-BT Connected*\n_Powered by Rahmany_" });
            } else if (con.connection == "close") setTimeout(main, 5000);
        });

        zk.ev.on("creds.update", saveCreds);
        
        // ============ UTILITY FUNCTION ============
        zk.downloadAndSaveMediaMessage = async (message, filename = '') => {
            let quoted = message.msg || message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './temp/' + filename + '.' + type.ext;
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };
    }

    fs.watchFile(__filename, () => { fs.unwatchFile(__filename); delete require.cache[__filename]; require(__filename); });
    main();
}, 5000);
