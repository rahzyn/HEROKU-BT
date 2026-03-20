"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const logger_1 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
const logger = logger_1.default.child({});
logger.level = 'silent';
const pino = require("pino");
const boom_1 = require("@hapi/boom");
const conf = require("./set");
const axios = require("axios");
let fs = require("fs-extra");
let path = require("path");
const FileType = require('file-type');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { verifierEtatJid , recupererActionJid } = require("./bdd/antilien");
const { atbverifierEtatJid , atbrecupererActionJid } = require("./bdd/antibot");
let evt = require(__dirname + "/framework/zokou");
const {isUserBanned , addUserToBanList , removeUserFromBanList} = require("./bdd/banUser");
const  {addGroupToBanList,isGroupBanned,removeGroupFromBanList} = require("./bdd/banGroup");
const {isGroupOnlyAdmin,addGroupToOnlyAdminList,removeGroupFromOnlyAdminList} =require("./bdd/onlyAdmin");
const { getWarnCountByJID, ajouterUtilisateurAvecWarnCount, resetWarnCountByJID } = require("./bdd/warn");
// ============ ANTI-STATUS IMPORTS ============
const { 
  verifierStatusEtatJid, 
  recupererStatusActionJid 
} = require("./bdd/antistatus");
let { reagir } = require(__dirname + "/framework/app");
var session = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g,"");
const prefixe = conf.PREFIXE;
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)

// Global variables
global.lastReactionTime = 0;
global.deletedMessages = {}; // Store deleted messages per chat
global.antitag = global.antitag || {}; // Anti-tag settings

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/auth/creds.json")) {
            console.log("Connecting...");
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
        }
        else if (fs.existsSync(__dirname + "/auth/creds.json") && session != "zokk") {
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
        }
    }
    catch (e) {
        console.log("Session Invalid " + e);
        return;
    }
}
authentification();

const store = (0, baileys_1.makeInMemoryStore)({
    logger: pino().child({ level: "silent", stream: "store" }),
});

setTimeout(() => {
    async function main() {
        const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/auth");
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['Rahmani xmd', "safari", "1.0.0"],
            printQRInTerminal: true,
            fireInitQueries: false,
            shouldSyncHistoryMessage: true,
            downloadHistory: true,
            syncFullHistory: true,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            keepAliveIntervalMs: 30_000,
            auth: {
                creds: state.creds,
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                    return msg.message || undefined;
                }
                return {
                    conversation: 'An Error Occurred, Repeat Command!'
                };
            }
        };
        
        const zk = (0, baileys_1.default)(sockOptions);
        store.bind(zk.ev);
        
        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message) return;
            
            const decodeJid = (jid) => {
                if (!jid) return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                }
                else return jid;
            };
            
            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation : 
                       mtype == "imageMessage" ? ms.message.imageMessage?.caption : 
                       mtype == "videoMessage" ? ms.message.videoMessage?.caption : 
                       mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : 
                       mtype == "buttonsResponseMessage" ? ms?.message?.buttonsResponseMessage?.selectedButtonId : 
                       mtype == "listResponseMessage" ? ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId : 
                       mtype == "messageContextInfo" ? (ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text) : "";
            
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            var servBot = idBot.split('@')[0];
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            var nomGroupe = verifGroupe ? infosGroupe.subject : "";
            var msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
            var auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
            var mr = ms.Message?.extendedTextMessage?.contextInfo?.mentionedJid;
            var utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
            var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
            if (ms.key.fromMe) {
                auteurMessage = idBot;
            }
            
            var membreGroupe = verifGroupe ? ms.key.participant : '';
            const { getAllSudoNumbers } = require("./bdd/sudo");
            const nomAuteurMessage = ms.pushName;
            const dj = '255622286792';
            const dj2 = '255622286792';
            const dj3 = "255622286792";
            const luffy = '255622286792';
            const sudo = await getAllSudoNumbers();
            const superUserNumbers = [servBot, dj, dj2, dj3, luffy, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers.concat(sudo);
            const superUser = allAllowedNumbers.includes(auteurMessage);
            
            var dev = [dj, dj2,dj3,luffy].map((t) => t.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(auteurMessage);
            
            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }
            
            console.log("\n=========== Message Received ===========");
            if (verifGroupe) {
                console.log("Group : " + nomGroupe);
            }
            console.log("From : " + nomAuteurMessage + " (" + auteurMessage.split("@")[0] + ")");
            console.log("Type : " + mtype);
            console.log("Content : " + (texte || "Media"));
            
            function groupeAdmin(membreGroupe) {
                let admin = [];
                for (let m of membreGroupe) {
                    if (m.admin == null) continue;
                    admin.push(m.id);
                }
                return admin;
            }

            var etat = conf.ETAT;
            if(etat==1) { await zk.sendPresenceUpdate("available",origineMessage); }
            else if(etat==2) { await zk.sendPresenceUpdate("composing",origineMessage); }
            else if(etat==3) { await zk.sendPresenceUpdate("recording",origineMessage); }
            else { await zk.sendPresenceUpdate("unavailable",origineMessage); }

            const mbre = verifGroupe ? infosGroupe.participants : '';
            let admins = verifGroupe ? groupeAdmin(mbre) : [];
            const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
            var verifZokouAdmin = verifGroupe ? admins.includes(idBot) : false;
            
            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;
           
            const lien = conf.URL.split(',');  

            function mybotpic() {
                const indiceAleatoire = Math.floor(Math.random() * lien.length);
                const lienAleatoire = lien[indiceAleatoire];
                return lienAleatoire;
            }
            
            var commandeOptions = {
                superUser, dev,
                verifGroupe,
                mbre,
                membreGroupe,
                verifAdmin,
                infosGroupe,
                nomGroupe,
                auteurMessage,
                nomAuteurMessage,
                idBot,
                verifZokouAdmin,
                prefixe,
                arg,
                repondre,
                mtype,
                groupeAdmin,
                msgRepondu,
                auteurMsgRepondu,
                ms,
                mybotpic
            };

            // ********** STORE MESSAGES FOR ANTI-DELETE **********
            try {
                const chatId = ms.key.remoteJid;
                if (!global.deletedMessages[chatId]) {
                    global.deletedMessages[chatId] = [];
                }
                global.deletedMessages[chatId].push({
                    key: ms.key,
                    message: ms.message,
                    messageTimestamp: ms.messageTimestamp || Date.now() / 1000,
                    pushName: ms.pushName
                });
                if (global.deletedMessages[chatId].length > 50) {
                    global.deletedMessages[chatId] = global.deletedMessages[chatId].slice(-50);
                }
            } catch (e) { console.log("Store error:", e.message); }

            // ********** ANTI-TAG (Admins are not deleted) **********
            if (verifGroupe && global.antitag[origineMessage] && global.antitag[origineMessage].enabled === true) {
                try {
                    if (!ms.key.fromMe) {
                        const sender = auteurMessage;
                        const senderClean = decodeJid(sender);
                        const cleanAdmins = admins.map(admin => decodeJid(admin));
                        const isSenderAdmin = cleanAdmins.includes(senderClean);
                        
                        if (!isSenderAdmin) {
                            let hasTag = false;
                            if (ms.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) hasTag = true;
                            if (ms.message?.extendedTextMessage?.contextInfo?.quotedMessage) hasTag = true;
                            if (texte && texte.includes('@')) hasTag = true;
                            
                            if (hasTag) {
                                console.log(`🚫 Anti-tag: Deleting message from ${senderClean} (non-admin)`);
                                await zk.sendMessage(origineMessage, {
                                    delete: {
                                        remoteJid: origineMessage,
                                        fromMe: false,
                                        id: ms.key.id,
                                        participant: sender
                                    }
                                });
                                await zk.sendMessage(origineMessage, {
                                    text: `@${senderClean.split('@')[0]} 🚫 *Don't tag members!*`,
                                    mentions: [senderClean]
                                });
                            }
                        } else {
                            console.log(`✅ Admin tagged - message kept: ${senderClean}`);
                        }
                    }
                } catch (e) { console.error("Anti-tag error:", e); }
            }

            // ********** ANTI-DELETE MESSAGE (Send to owner) **********
            if (ms.message?.protocolMessage && ms.message.protocolMessage.type === 0) {
                const antiDeleteEnabled = conf.ANTI_DELETE_MESSAGE === "yes" || conf.ADM === "yes";
                if (antiDeleteEnabled && !ms.key.fromMe && !ms.message.protocolMessage.key.fromMe) {
                    console.log("🗑️ Deleted message detected!");
                    const deletedKey = ms.message.protocolMessage.key;
                    const chatId = deletedKey.remoteJid;
                    const msgId = deletedKey.id;
                    const deletedMsg = global.deletedMessages[chatId]?.find(m => m.key.id === msgId);
                    
                    if (deletedMsg) {
                        try {
                            const participant = deletedMsg.key.participant || deletedMsg.key.remoteJid;
                            const senderNumber = participant.split('@')[0];
                            const ownerJid = conf.NUMERO_OWNER + "@s.whatsapp.net";
                            let chatName = chatId;
                            if (chatId.endsWith('@g.us')) {
                                try {
                                    const meta = await zk.groupMetadata(chatId);
                                    chatName = meta.subject || chatId;
                                } catch { }
                            }
                            const msgType = Object.keys(deletedMsg.message)[0] || 'unknown';
                            
                            await zk.sendMessage(ownerJid, {
                                text: `╭━━━ *『 ANTI-DELETE 』* ━━━╮\n┃\n┃ 👤 *Sender:* @${senderNumber}\n┃ 💬 *Chat:* ${chatName}\n┃ 📝 *Type:* ${msgType.replace('Message','')}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
                                mentions: [participant]
                            });
                            
                            if (deletedMsg.message.conversation) {
                                await zk.sendMessage(ownerJid, { text: `📝 *Deleted Text:*\n\n${deletedMsg.message.conversation}` });
                            } else if (deletedMsg.message.extendedTextMessage?.text) {
                                await zk.sendMessage(ownerJid, { text: `📝 *Deleted Text:*\n\n${deletedMsg.message.extendedTextMessage.text}` });
                            } else if (deletedMsg.message.imageMessage) {
                                const img = await zk.downloadAndSaveMediaMessage(deletedMsg.message.imageMessage);
                                await zk.sendMessage(ownerJid, { image: { url: img }, caption: `🖼️ *Deleted Image*` });
                            } else if (deletedMsg.message.videoMessage) {
                                const vid = await zk.downloadAndSaveMediaMessage(deletedMsg.message.videoMessage);
                                await zk.sendMessage(ownerJid, { video: { url: vid }, caption: `🎥 *Deleted Video*` });
                            } else if (deletedMsg.message.audioMessage) {
                                const aud = await zk.downloadAndSaveMediaMessage(deletedMsg.message.audioMessage);
                                await zk.sendMessage(ownerJid, { audio: { url: aud }, mimetype: 'audio/mp4' });
                            }
                            console.log("✅ Deleted message sent to owner.");
                        } catch (err) { console.error("Error sending deleted message:", err); }
                    } else {
                        console.log("❌ Deleted message not found in store.");
                    }
                }
            }

            // ********** ANTI-LINK WITH 3-STRIKE RULE **********
            if (verifGroupe && texte && texte.includes('https://')) {
                try {
                    const antiLinkEnabled = await verifierEtatJid(origineMessage);
                    if (antiLinkEnabled && !superUser && !verifAdmin && verifZokouAdmin) {
                        console.log("🔗 Anti-link activated - link detected");
                        
                        const action = await recupererActionJid(origineMessage) || 'warn';
                        const key = {
                            remoteJid: origineMessage,
                            fromMe: false,
                            id: ms.key.id,
                            participant: auteurMessage
                        };
                        
                        // Send warning sticker
                        const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
                        const sticker = new Sticker(gifLink, {
                            pack: 'Anti-Link',
                            author: conf.OWNER_NAME,
                            type: StickerTypes.FULL,
                            quality: 50
                        });
                        await sticker.toFile("st1.webp");
                        
                        if (action === 'remove') {
                            // Remove immediately
                            let txt = `🔗 Link detected, @${auteurMessage.split("@")[0]} has been removed from group.`;
                            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
                            await (0, baileys_1.delay)(800);
                            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                            await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                            await zk.sendMessage(origineMessage, { delete: key });
                        }
                        else if (action === 'delete') {
                            // Delete only
                            let txt = `🔗 Link detected, @${auteurMessage.split("@")[0]} your message has been deleted.`;
                            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
                            await (0, baileys_1.delay)(800);
                            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                            await zk.sendMessage(origineMessage, { delete: key });
                        }
                        else {
                            // Default: 3-strike rule (warn)
                            const warnCount = await getWarnCountByJID(auteurMessage) || 0;
                            const warnLimit = 3; // Maximum 3 warnings
                            
                            if (warnCount >= warnLimit) {
                                // Already at limit, remove
                                let txt = `🔗 Link detected! @${auteurMessage.split("@")[0]} has been removed for sending links 3 times.`;
                                await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
                                await (0, baileys_1.delay)(800);
                                await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                                await resetWarnCountByJID(auteurMessage); // Reset after removal
                            } else {
                                // Add warning
                                await ajouterUtilisateurAvecWarnCount(auteurMessage);
                                const newCount = warnCount + 1;
                                const remaining = warnLimit - newCount;
                                
                                let txt = `🔗 *LINK DETECTED!* ⚠️\n\n` +
                                         `@${auteurMessage.split("@")[0]} you have received warning **${newCount}/${warnLimit}**\n\n` +
                                         `📌 *Remaining warnings:* ${remaining}\n\n` +
                                         `_You will be removed after ${remaining} more link(s)._`;
                                
                                await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
                                await (0, baileys_1.delay)(800);
                                await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                            }
                            await zk.sendMessage(origineMessage, { delete: key });
                        }
                        await fs.unlink("st1.webp").catch(()=>{});
                    }
                } catch (e) { 
                    console.log("Anti-link error:", e); 
                }
            }

            // ********** ANTI-STATUS MENTION (NEW) **********
            if (verifGroupe && ms.message && !ms.key.fromMe) {
                try {
                    // Check if anti-status is enabled for this group
                    const antiStatusEnabled = await verifierStatusEtatJid(origineMessage);
                    if (!antiStatusEnabled) return;
                    
                    // Get the action for this group
                    const action = await recupererStatusActionJid(origineMessage) || 'delete';
                    
                    // Check for status mention patterns
                    let isStatusMention = false;
                    
                    // Check if quoting a status
                    const contextInfo = ms.message?.extendedTextMessage?.contextInfo || 
                                       ms.message?.imageMessage?.contextInfo || 
                                       ms.message?.videoMessage?.contextInfo;
                    
                    if (contextInfo?.quotedMessage && contextInfo?.participant && contextInfo.participant.includes('status@broadcast')) {
                        isStatusMention = true;
                        console.log("📱 Status quote detected");
                    }
                    
                    // Check for status mention in text
                    if (texte && (texte.includes('status@broadcast') || 
                        (texte.includes('status') && texte.includes('@')))) {
                        isStatusMention = true;
                        console.log("📱 Status text mention detected");
                    }
                    
                    if (isStatusMention) {
                        console.log("📵 Anti-status: Status mention detected!");
                        
                        const sender = auteurMessage;
                        
                        // Check if sender is admin (don't punish admins)
                        const groupMetadata = await zk.groupMetadata(origineMessage);
                        const groupAdmins = groupMetadata.participants
                            .filter(v => v.admin !== null)
                            .map(v => v.id);
                        
                        const isSenderAdmin = groupAdmins.includes(sender);
                        
                        if (isSenderAdmin) {
                            console.log("Admin sent status mention - ignoring");
                            return;
                        }
                        
                        const key = {
                            remoteJid: origineMessage,
                            fromMe: false,
                            id: ms.key.id,
                            participant: sender
                        };
                        
                        // Delete the message first
                        await zk.sendMessage(origineMessage, { delete: key });
                        
                        if (action === 'remove') {
                            // Remove immediately
                            await zk.sendMessage(origineMessage, {
                                text: `📵 @${sender.split('@')[0]} has been removed for sending status mentions.`,
                                mentions: [sender]
                            });
                            await zk.groupParticipantsUpdate(origineMessage, [sender], "remove");
                        }
                        else if (action === 'warn') {
                            // Warn with 3-strike rule
                            const warnCount = await getWarnCountByJID(sender) || 0;
                            const warnLimit = conf.WARN_COUNT || 3;
                            
                            if (warnCount >= warnLimit) {
                                // Remove if at limit
                                await zk.sendMessage(origineMessage, {
                                    text: `📵 @${sender.split('@')[0]} has been removed for sending status mentions (3 strikes).`,
                                    mentions: [sender]
                                });
                                await zk.groupParticipantsUpdate(origineMessage, [sender], "remove");
                                await resetWarnCountByJID(sender);
                            } else {
                                // Add warning
                                await ajouterUtilisateurAvecWarnCount(sender);
                                const remaining = warnLimit - (warnCount + 1);
                                
                                await zk.sendMessage(origineMessage, {
                                    text: `📵 *STATUS MENTION DETECTED!* ⚠️\n\n@${sender.split('@')[0]} warning ${warnCount+1}/${warnLimit}\nRemaining: ${remaining}`,
                                    mentions: [sender]
                                });
                            }
                        }
                        else {
                            // Default: delete only
                            await zk.sendMessage(origineMessage, {
                                text: `📵 @${sender.split('@')[0]} status mentions are not allowed!`,
                                mentions: [sender]
                            });
                        }
                    }
                } catch (error) {
                    console.error("Anti-status error:", error);
                }
            }

            // ********** AUTO STATUS **********
            if (ms.key && ms.key.remoteJid === "status@broadcast") {
                if (conf.AUTO_READ_STATUS === "yes") {
                    try { await zk.readMessages([ms.key]); } catch (e) { console.log("Auto-read error:", e.message); }
                }
                if (conf.AUTO_REACT_STATUS === "yes") {
                    const now = Date.now();
                    if (now - (global.lastReactionTime || 0) > 5000) {
                        const botId = zk.user?.id?.split(":")[0] + "@s.whatsapp.net";
                        if (botId) {
                            try {
                                await zk.sendMessage(ms.key.remoteJid, {
                                    react: { key: ms.key, text: "🌍" }
                                }, { statusJidList: [ms.key.participant, botId] });
                                global.lastReactionTime = now;
                            } catch (error) { console.log("React error:", error.message); }
                        }
                    }
                }
                if (conf.AUTO_DOWNLOAD_STATUS === "yes") {
                    try {
                        if (ms.message.extendedTextMessage) {
                            await zk.sendMessage(idBot, { text: ms.message.extendedTextMessage.text }, { quoted: ms });
                        } else if (ms.message.imageMessage) {
                            const img = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage);
                            await zk.sendMessage(idBot, { image: { url: img }, caption: ms.message.imageMessage.caption }, { quoted: ms });
                        } else if (ms.message.videoMessage) {
                            const vid = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage);
                            await zk.sendMessage(idBot, { video: { url: vid }, caption: ms.message.videoMessage.caption }, { quoted: ms });
                        }
                    } catch (e) { console.log("Auto-download error:", e.message); }
                }
            }

            // ********** ANTI-BOT (from your original code) **********
            try {
                const botMsg = ms.key?.id?.startsWith('BAES') && ms.key?.id?.length === 16;
                const baileysMsg = ms.key?.id?.startsWith('BAE5') && ms.key?.id?.length === 16;
                if ((botMsg || baileysMsg) && mtype !== 'reactionMessage') {
                    const antibotactiver = await atbverifierEtatJid(origineMessage);
                    if (antibotactiver && !verifAdmin && auteurMessage !== idBot) {
                        const action = await atbrecupererActionJid(origineMessage) || 'delete';
                        const key = {
                            remoteJid: origineMessage,
                            fromMe: false,
                            id: ms.key.id,
                            participant: auteurMessage
                        };
                        const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
                        const sticker = new Sticker(gifLink, {
                            pack: 'Anti-Bot',
                            author: conf.OWNER_NAME,
                            type: StickerTypes.FULL,
                            quality: 50
                        });
                        await sticker.toFile("st1.webp");
                        
                        if (action === 'remove') {
                            let txt = `🤖 Bot detected, @${auteurMessage.split("@")[0]} has been removed.`;
                            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
                            await (0, baileys_1.delay)(800);
                            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                            await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                        } else {
                            let txt = `🤖 Bot detected, message deleted.`;
                            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
                            await (0, baileys_1.delay)(800);
                            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                            await zk.sendMessage(origineMessage, { delete: key });
                        }
                        await fs.unlink("st1.webp").catch(()=>{});
                    }
                }
            } catch (er) { console.log("Anti-bot error:", er); }

            // ********** EXECUTE COMMANDS **********
            if (verifCom) {
                const cd = evt.cm.find((cmd) => cmd.nomCom === com);
                if (cd) {
                    try {
                        if ((conf.MODE).toLocaleLowerCase() != 'yes' && !superUser) return;
                        if (!superUser && origineMessage === auteurMessage && conf.PM_PERMIT === "yes") {
                            repondre("You don't have access to commands here");
                            return;
                        }
                        if (!superUser && verifGroupe && (await isGroupBanned(origineMessage))) return;
                        if (!verifAdmin && verifGroupe && (await isGroupOnlyAdmin(origineMessage))) return;
                        if (!superUser && (await isUserBanned(auteurMessage))) {
                            repondre("You are banned from bot commands");
                            return;
                        }
                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    } catch (e) {
                        console.log("Command error:", e);
                        zk.sendMessage(origineMessage, { text: "😡 " + e }, { quoted: ms });
                    }
                }
            }
        });
        
        // ============ GROUP PARTICIPANTS EVENTS ============
        const { recupevents } = require('./bdd/welcome');
        zk.ev.on('group-participants.update', async (group) => {
            console.log("Group event:", group);
            let ppgroup;
            try { ppgroup = await zk.profilePictureUrl(group.id, 'image'); } catch { ppgroup = ''; }
            try {
                const metadata = await zk.groupMetadata(group.id);
                if (group.action == 'add' && (await recupevents(group.id, "welcome") == 'on')) {
                    let msg = `*WELCOME TO THE GROUP* 🎉\n`;
                    for (let membre of group.participants) {
                        msg += `@${membre.split("@")[0]}\n`;
                    }
                    zk.sendMessage(group.id, { image: { url: ppgroup || 'https://files.catbox.moe/zotx9t.jpg' }, caption: msg, mentions: group.participants });
                } else if (group.action == 'remove' && (await recupevents(group.id, "goodbye") == 'on')) {
                    let msg = `👋 Goodbye!\n`;
                    for (let membre of group.participants) {
                        msg += `@${membre.split("@")[0]}\n`;
                    }
                    zk.sendMessage(group.id, { text: msg, mentions: group.participants });
                }
                // Anti-promote / anti-demote (optional)
            } catch (e) { console.error("Group event error:", e); }
        });

        // ============ CRONS ============
        async function activateCrons() {
            const cron = require('node-cron');
            const { getCron } = require('./bdd/cron');
            let crons = await getCron();
            for (let c of crons) {
                if (c.mute_at) {
                    let [hour, minute] = c.mute_at.split(':');
                    cron.schedule(`${minute} ${hour} * * *`, async () => {
                        await zk.groupSettingUpdate(c.group_id, 'announcement');
                        zk.sendMessage(c.group_id, { text: "🔒 Group closed (auto-mute)." });
                    }, { timezone: "Africa/Dar_es_Salaam" });
                }
                if (c.unmute_at) {
                    let [hour, minute] = c.unmute_at.split(':');
                    cron.schedule(`${minute} ${hour} * * *`, async () => {
                        await zk.groupSettingUpdate(c.group_id, 'not_announcement');
                        zk.sendMessage(c.group_id, { text: "🔓 Group opened (auto-unmute)." });
                    }, { timezone: "Africa/Dar_es_Salaam" });
                }
            }
        }

        // ============ CONNECTION EVENTS ============
        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "Heroku is connecting") console.log("🔄 Connecting...");
            else if (connection === 'open') {
                console.log("✅ HEROKU BT is Connected to WhatsApp!");
                console.log("Loading commands...");
                fs.readdirSync(__dirname + "/commandes").forEach((fichier) => {
                    if (path.extname(fichier) === ".js") {
                        try {
                            require(__dirname + "/commandes/" + fichier);
                            console.log(`✓ ${fichier} loaded`);
                        } catch (e) { console.log(`✗ ${fichier} error:`, e); }
                    }
                });
                activateCrons();
                if (conf.DP?.toLowerCase() === 'yes') {
                    let mode = conf.MODE?.toLowerCase() === 'yes' ? 'public' : 'private';
                    let msg = `╭─────────────━┈⊷\n│🌏 HEROKU-BT CONNECTED\n│💫 Prefix: [ ${prefixe} ]\n│⭕ Mode: ${mode}\n╰─────────────━┈⊷`;
                    await zk.sendMessage(zk.user.id, { text: msg });
                }
            } else if (connection == "close") {
                let code = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
                if (code === baileys_1.DisconnectReason.loggedOut) {
                    console.log("Session expired, please scan QR again.");
                } else {
                    console.log("Connection closed, reconnecting...");
                    main();
                }
            }
        });
        
        zk.ev.on("creds.update", saveCreds);
        
        // ============ UTILITY FUNCTIONS ============
        zk.downloadAndSaveMediaMessage = async (message, filename = '') => {
            let quoted = message.msg || message;
            let mime = (message.msg || message).mimetype || '';
            let type = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, type);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            let fileType = await FileType.fromBuffer(buffer);
            let trueFileName = filename || 'file_' + Date.now() + '.' + fileType.ext;
            await fs.writeFile(trueFileName, buffer);
            return trueFileName;
        };
        
        zk.awaitForMessage = async (options) => {
            return new Promise((resolve, reject) => {
                if (!options.sender || !options.chatJid) reject(new Error('Sender and chatJid required'));
                const timeout = options.timeout || 30000;
                const filter = options.filter || (() => true);
                let listener = (data) => {
                    if (data.type === 'notify') {
                        for (let msg of data.messages) {
                            const sender = msg.key.fromMe ? zk.user.id.split(':')[0]+'@s.whatsapp.net' : (msg.key.participant || msg.key.remoteJid);
                            if (sender === options.sender && msg.key.remoteJid === options.chatJid && filter(msg)) {
                                zk.ev.off('messages.upsert', listener);
                                resolve(msg);
                            }
                        }
                    }
                };
                zk.ev.on('messages.upsert', listener);
                setTimeout(() => {
                    zk.ev.off('messages.upsert', listener);
                    reject(new Error('Timeout'));
                }, timeout);
            });
        };
        
        return zk;
    }
    
    let fichier = require.resolve(__filename);
    fs.watchFile(fichier, () => {
        fs.unwatchFile(fichier);
        console.log(`🔄 Updating ${__filename}`);
        delete require.cache[fichier];
        require(fichier);
    });
    main();
}, 5000);
