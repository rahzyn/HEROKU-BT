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
var __importStar = (this && this.__importStar) || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function(mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

// ============ CORE IMPORTS ============
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
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const cron = require('node-cron');

// ============ BDD IMPORTS ============
const { verifierEtatJid, recupererActionJid } = require("./bdd/antilien");
const { atbverifierEtatJid, atbrecupererActionJid } = require("./bdd/antibot");
let evt = require(__dirname + "/framework/zokou");
const { isUserBanned, addUserToBanList, removeUserFromBanList } = require("./bdd/banUser");
const { addGroupToBanList, isGroupBanned, removeGroupFromBanList } = require("./bdd/banGroup");
const { isGroupOnlyAdmin, addGroupToOnlyAdminList, removeGroupFromOnlyAdminList } = require("./bdd/onlyAdmin");
const { getAllSudoNumbers } = require("./bdd/sudo");
const { ajouterOuMettreAJourUserData } = require("./bdd/level");
const { recupevents } = require('./bdd/welcome');
const { getCron } = require('./bdd/cron');

// ============ FEATURE IMPORTS ============
const { processIncomingMessage } = require("./framework/bugDetector");
const { isAntiDeleteOn, handleDeletedMessage } = require("./commandes/antidelete");
const { isAntilinkOn, handleAntilink } = require("./commandes/antilink");

let { reagir } = require(__dirname + "/framework/app");
var session = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g, "");
const prefixe = conf.PREFIXE;
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// ============ AUTHENTICATION (IMPROVED) ============
async function authentification() {
    try {
        const authFolder = __dirname + "/auth";
        
        // Create auth folder if not exists
        if (!fs.existsSync(authFolder)) {
            fs.mkdirSync(authFolder);
        }
        
        const credsPath = authFolder + "/creds.json";
        
        // Check if session is provided in set.js
        if (conf.session && conf.session !== "zokk" && conf.session.length > 20) {
            console.log("📱 Loading session from set.js...");
            try {
                // Handle base64 session
                let sessionData = conf.session;
                if (sessionData.includes("Zokou-MD-WHATSAPP-BOT;;;=>")) {
                    sessionData = sessionData.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g, "");
                }
                
                // Decode base64 session
                const sessionBuffer = Buffer.from(sessionData, 'base64');
                await fs.writeFile(credsPath, sessionBuffer.toString('utf-8'));
                console.log("✅ Session loaded successfully");
            } catch (e) {
                console.log("❌ Failed to load session:", e.message);
                console.log("📱 QR code will be generated instead");
            }
        } else if (fs.existsSync(credsPath)) {
            console.log("✅ Using existing session from auth folder");
        } else {
            console.log("📱 No session found, QR code will be generated on first run");
        }
    } catch (e) {
        console.log("❌ Authentication Error:", e.message);
    }
}
authentification();

// ============ BAILEYS VERSION (STABLE - FIXED) ============
async function getBaileysVersion() {
    try {
        console.log("🔄 Fetching Baileys version...");
        // Use official Baileys version fetching
        const version = await (0, baileys_1.fetchLatestBaileysVersion)();
        console.log("✅ Using Baileys version:", version.version.join('.'));
        return version;
    } catch (error) {
        console.log("⚠️ Failed to fetch latest version, using stable fallback");
        // Stable version that works for everyone
        return { 
            version: [2, 3000, 1014082914], 
            isLatest: true 
        };
    }
}

const store = (0, baileys_1.makeInMemoryStore)({
    logger: pino().child({ level: "silent", stream: "store" }),
});

// ============ TEMP FOLDER ============
if (!fs.existsSync('./temp')) {
    fs.mkdirSync('./temp');
    console.log("✅ Temp folder created");
}

// ============ MAIN BOT ============
setTimeout(() => {
    async function main() {
        const { version } = await getBaileysVersion();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/auth");

        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['HEROKU-BT', "safari", "1.0.0"],
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
                    return msg?.message || undefined;
                }
                return { conversation: 'An Error Occurred, Repeat Command!' };
            }
        };

        const zk = (0, baileys_1.default)(sockOptions);
        store.bind(zk.ev);

        // ============ MESSAGE HANDLER ============
        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message) return;

            // ============ JID DECODER ============
            const decodeJid = (jid) => {
                if (!jid) return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                }
                return jid;
            };

            // ============ MESSAGE INFO ============
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
            if (ms.key.fromMe) auteurMessage = idBot;

            var membreGroupe = verifGroupe ? ms.key.participant : '';
            const nomAuteurMessage = ms.pushName;

            // ============ SUDO & OWNER ============
            const dj = conf.NUMERO_OWNER || '255693629079';
            const sudo = await getAllSudoNumbers();
            const superUserNumbers = [servBot, dj, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers.concat(sudo);
            const superUser = allAllowedNumbers.includes(auteurMessage);
            var dev = [dj].map((t) => t.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(auteurMessage);

            // ============ RESPOND FUNCTION ============
            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }

            // ============ CONSOLE LOGS ============
            console.log("\n🤖 HEROKU-BT is ONLINE");
            console.log("=========== Message ===========");
            if (verifGroupe) console.log("👥 Group: " + nomGroupe);
            console.log("👤 From: " + "[" + nomAuteurMessage + " : " + auteurMessage.split("@s.whatsapp.net")[0] + "]");
            console.log("📌 Type: " + mtype);
            console.log("💬 Content: " + (texte || "Media"));
            console.log("===============================");

            // ============ GROUP ADMIN ============
            function groupeAdmin(membreGroupe) {
                let admin = [];
                for (let m of membreGroupe) {
                    if (m.admin == null) continue;
                    admin.push(m.id);
                }
                return admin;
            }

            // ============ PRESENCE ============
            var etat = conf.ETAT;
            if (etat == 1) await zk.sendPresenceUpdate("available", origineMessage);
            else if (etat == 2) await zk.sendPresenceUpdate("composing", origineMessage);
            else if (etat == 3) await zk.sendPresenceUpdate("recording", origineMessage);
            else await zk.sendPresenceUpdate("unavailable", origineMessage);

            const mbre = verifGroupe ? await infosGroupe.participants : '';
            let admins = verifGroupe ? groupeAdmin(mbre) : '';
            const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
            var verifZokouAdmin = verifGroupe ? admins.includes(idBot) : false;

            // ============ COMMAND PARSING ============
            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;

            // ============ RANDOM BOT PIC ============
            const lien = conf.URL ? conf.URL.split(',') : [''];
            function mybotpic() {
                const indiceAleatoire = Math.floor(Math.random() * lien.length);
                return lien[indiceAleatoire] || '';
            }

            var commandeOptions = {
                superUser, dev,
                verifGroupe, mbre, membreGroupe,
                verifAdmin, infosGroupe, nomGroupe,
                auteurMessage, nomAuteurMessage, idBot,
                verifZokouAdmin, prefixe, arg,
                repondre, mtype, groupeAdmin,
                msgRepondu, auteurMsgRepondu, ms,
                mybotpic
            };

            // ============ FEATURE 1: ANTI-DELETE ============
            try {
                const ownerJid = conf.NUMERO_OWNER + "@s.whatsapp.net";
                await handleDeletedMessage(zk, ms, ownerJid);
            } catch (antideleteError) {
                console.log("❌ Anti-delete error:", antideleteError.message);
            }

            // ============ FEATURE 2: ANTILINK (IMPROVED WITH WARN SYSTEM) ============
            try {
                if (verifGroupe) {
                    const linkDeleted = await handleAntilink(
                        zk, 
                        ms, 
                        auteurMessage, 
                        origineMessage, 
                        verifAdmin,
                        verifZokouAdmin,
                        superUser
                    );
                    if (linkDeleted) {
                        console.log("✅ Link handled by antilink");
                    }
                }
            } catch (antilinkError) {
                console.log("❌ Antilink error:", antilinkError.message);
            }

            // ============ FEATURE 3: AUTO STATUS ============
            if (ms.key && ms.key.remoteJid === "status@broadcast") {
                // Auto Read
                if (conf.AUTO_READ_STATUS === "yes") {
                    try {
                        await zk.readMessages([ms.key]);
                        console.log(`✅ Auto-read status from ${ms.key.participant?.split('@')[0] || 'unknown'}`);
                    } catch (readError) {
                        console.log("❌ Auto-read failed:", readError.message);
                    }
                }

                // Auto React
                if (conf.AUTO_REACT_STATUS === "yes") {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await zk.sendMessage(ms.key.remoteJid, {
                            react: { text: "❤️", key: ms.key }
                        });
                        console.log(`✅ Liked status from ${ms.key.participant?.split('@')[0] || 'unknown'}`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    } catch (reactError) {
                        console.log("❌ Auto-like failed:", reactError.message);
                    }
                }

                // Auto Download
                if (conf.AUTO_DOWNLOAD_STATUS === "yes") {
                    try {
                        const ownerNumber = conf.NUMERO_OWNER + "@s.whatsapp.net";
                        const senderName = ms.key.participant?.split('@')[0] || 'unknown';

                        if (ms.message.extendedTextMessage) {
                            var stTxt = ms.message.extendedTextMessage.text;
                            await zk.sendMessage(ownerNumber, {
                                text: `📱 *STATUS UPDATE*\nFrom: @${senderName}\n\n${stTxt}`,
                                mentions: [ms.key.participant]
                            });
                        } else if (ms.message.imageMessage) {
                            var stMsg = ms.message.imageMessage.caption || "";
                            var stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage);
                            await zk.sendMessage(ownerNumber, {
                                image: { url: stImg },
                                caption: `📱 *STATUS UPDATE*\nFrom: @${senderName}\n\n${stMsg}`,
                                mentions: [ms.key.participant]
                            });
                        } else if (ms.message.videoMessage) {
                            var stMsg = ms.message.videoMessage.caption || "";
                            var stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage);
                            await zk.sendMessage(ownerNumber, {
                                video: { url: stVideo },
                                caption: `📱 *STATUS UPDATE*\nFrom: @${senderName}\n\n${stMsg}`,
                                mentions: [ms.key.participant]
                            });
                        }
                    } catch (downloadError) {
                        console.log("❌ Auto-download failed:", downloadError.message);
                    }
                }
            }

            // ============ FEATURE 4: LEVEL SYSTEM ============
            if (texte && auteurMessage.endsWith("s.whatsapp.net")) {
                try {
                    await ajouterOuMettreAJourUserData(auteurMessage);
                } catch (e) {
                    console.error(e);
                }
            }

            // ============ FEATURE 5: MENTION REPLY ============
            try {
                if (ms.message[mtype]?.contextInfo?.mentionedJid &&
                    (ms.message[mtype].contextInfo.mentionedJid.includes(idBot) ||
                        ms.message[mtype].contextInfo.mentionedJid.includes(conf.NUMERO_OWNER + '@s.whatsapp.net'))) {

                    if (superUser) return;

                    let mbd = require('./bdd/mention');
                    let alldata = await mbd.recupererToutesLesValeurs();
                    let data = alldata[0];

                    if (data?.status === 'non') return;

                    let msg;
                    if (data.type.toLowerCase() === 'image') {
                        msg = { image: { url: data.url }, caption: data.message };
                    } else if (data.type.toLowerCase() === 'video') {
                        msg = { video: { url: data.url }, caption: data.message };
                    } else if (data.type.toLowerCase() === 'sticker') {
                        let stickerMess = new Sticker(data.url, {
                            pack: conf.NOM_OWNER,
                            type: StickerTypes.FULL,
                            quality: 70,
                        });
                        const stickerBuffer2 = await stickerMess.toBuffer();
                        msg = { sticker: stickerBuffer2 };
                    } else if (data.type.toLowerCase() === 'audio') {
                        msg = { audio: { url: data.url }, mimetype: 'audio/mp4' };
                    }

                    if (msg) zk.sendMessage(origineMessage, msg, { quoted: ms });
                }
            } catch (error) { }

            // ============ FEATURE 6: ANTIBUG ============
            try {
                if (!ms.key.fromMe) {
                    const antibugResult = await processIncomingMessage(zk, ms, auteurMessage);
                    if (antibugResult.blocked) {
                        console.log(`✅ Antibug blocked: ${antibugResult.reason?.type || 'unknown'}`);
                        return;
                    }
                }
            } catch (antibugError) {
                console.log("❌ Antibug error:", antibugError.message);
            }

            // ============ FEATURE 7: ANTI-LIEN (EXISTING) ============
            try {
                const yes = await verifierEtatJid(origineMessage);
                if (texte && texte.includes('https://') && verifGroupe && yes) {
                    console.log("🔗 Lien detecté (legacy)");
                    var verifZokAdmin = verifGroupe ? admins.includes(idBot) : false;

                    if (superUser || verifAdmin || !verifZokAdmin) return;

                    const key = {
                        remoteJid: origineMessage,
                        fromMe: false,
                        id: ms.key.id,
                        participant: auteurMessage
                    };

                    var action = await recupererActionJid(origineMessage);

                    if (action === 'remove') {
                        await zk.sendMessage(origineMessage, { delete: key });
                        await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                        await zk.sendMessage(origineMessage, {
                            text: `🔨 @${auteurMessage.split("@")[0]} removed for sending link.`,
                            mentions: [auteurMessage]
                        });
                    } else if (action === 'delete') {
                        await zk.sendMessage(origineMessage, { delete: key });
                    } else if (action === 'warn') {
                        await zk.sendMessage(origineMessage, { delete: key });
                        await zk.sendMessage(origineMessage, {
                            text: `⚠️ @${auteurMessage.split("@")[0]} Links are not allowed!`,
                            mentions: [auteurMessage]
                        });
                    }
                }
            } catch (e) {
                console.log("Anti-lien error:", e);
            }

            // ============ FEATURE 8: ANTI-BOT ============
            try {
                const botMsg = ms.key?.id?.startsWith('BAES') && ms.key?.id?.length === 16;
                const baileysMsg = ms.key?.id?.startsWith('BAE5') && ms.key?.id?.length === 16;

                if ((botMsg || baileysMsg) && mtype !== 'reactionMessage') {
                    const antibotactiver = await atbverifierEtatJid(origineMessage);
                    if (!antibotactiver || verifAdmin || auteurMessage === idBot) return;

                    const key = {
                        remoteJid: origineMessage,
                        fromMe: false,
                        id: ms.key.id,
                        participant: auteurMessage
                    };

                    var action = await atbrecupererActionJid(origineMessage);

                    if (action === 'remove') {
                        await zk.sendMessage(origineMessage, { delete: key });
                        await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                    } else if (action === 'delete') {
                        await zk.sendMessage(origineMessage, { delete: key });
                    }
                }
            } catch (er) {
                console.log('Anti-bot error:', er);
            }

            // ============ FEATURE 9: BAN CHECKS ============
            if (!superUser && verifGroupe) {
                let req = await isGroupBanned(origineMessage);
                if (req) return;
            }

            if (!verifAdmin && verifGroupe) {
                let req = await isGroupOnlyAdmin(origineMessage);
                if (req) return;
            }

            if (!superUser) {
                let req = await isUserBanned(auteurMessage);
                if (req) {
                    repondre("❌ You are banned from bot commands");
                    return;
                }
            }

            // ============ FEATURE 10: COMMAND EXECUTION ============
            if (verifCom) {
                if ((conf.MODE).toLowerCase() != 'yes' && !superUser) return;

                if (!superUser && origineMessage === auteurMessage && conf.PM_PERMIT === "yes") {
                    repondre("❌ You don't have access to commands here");
                    return;
                }

                const cd = evt.cm.find((zokou) => zokou.nomCom === com);
                if (cd) {
                    try {
                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    } catch (e) {
                        console.log("❌ Command error:", e);
                        zk.sendMessage(origineMessage, { text: "❌ " + e }, { quoted: ms });
                    }
                }
            }
        });

        // ============ GROUP PARTICIPANTS UPDATE ============
        zk.ev.on('group-participants.update', async (group) => {
            console.log(group);

            let ppgroup;
            try {
                ppgroup = await zk.profilePictureUrl(group.id, 'image');
            } catch {
                ppgroup = '';
            }

            try {
                const metadata = await zk.groupMetadata(group.id);

                if (group.action == 'add' && (await recupevents(group.id, "welcome") == 'on')) {
                    let msg = `*𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐓𝐇𝐄 𝐆𝐑𝐎𝐔𝐏*\n\n`;
                    let membres = group.participants;
                    for (let membre of membres) {
                        msg += `👋 @${membre.split("@")[0]}\n`;
                    }
                    zk.sendMessage(group.id, { image: { url: ppgroup }, caption: msg, mentions: membres });
                } else if (group.action == 'remove' && (await recupevents(group.id, "goodbye") == 'on')) {
                    let msg = `👋 *Goodbye*\n\n`;
                    let membres = group.participants;
                    for (let membre of membres) {
                        msg += `@${membre.split("@")[0]}\n`;
                    }
                    zk.sendMessage(group.id, { text: msg, mentions: membres });
                }
            } catch (e) {
                console.error(e);
            }
        });

        // ============ CRON SETUP ============
        async function activateCrons() {
            let crons = await getCron();
            if (crons.length > 0) {
                for (let i = 0; i < crons.length; i++) {
                    if (crons[i].mute_at != null) {
                        let set = crons[i].mute_at.split(':');
                        cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                            await zk.groupSettingUpdate(crons[i].group_id, 'announcement');
                            zk.sendMessage(crons[i].group_id, { text: "🔒 Group closed" });
                        }, { timezone: "Africa/Dar_es_Salaam" });
                    }

                    if (crons[i].unmute_at != null) {
                        let set = crons[i].unmute_at.split(':');
                        cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                            await zk.groupSettingUpdate(crons[i].group_id, 'not_announcement');
                            zk.sendMessage(crons[i].group_id, { text: "🔓 Group opened" });
                        }, { timezone: "Africa/Dar_es_Salaam" });
                    }
                }
            }
        }

        // ============ CONTACTS ============
        zk.ev.on("contacts.upsert", async (contacts) => {
            const insertContact = (newContact) => {
                for (const contact of newContact) {
                    if (store.contacts[contact.id]) {
                        Object.assign(store.contacts[contact.id], contact);
                    } else {
                        store.contacts[contact.id] = contact;
                    }
                }
            };
            insertContact(contacts);
        });

        // ============ CONNECTION ============
        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "connecting") {
                console.log("🔄 HEROKU-BT is connecting...");
            } else if (connection === 'open') {
                console.log("✅ HEROKU-BT Connected to WhatsApp!");
                console.log("\n📦 Loading Commands...\n");

                fs.readdirSync(__dirname + "/commandes").forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == ".js") {
                        try {
                            require(__dirname + "/commandes/" + fichier);
                            console.log("✅ " + fichier + " Loaded");
                        } catch (e) {
                            console.log("❌ " + fichier + " Failed: " + e.message);
                        }
                    }
                });

                await activateCrons();

                if ((conf.DP)?.toLowerCase() === 'yes') {
                    let cmsg = `🤖 *HEROKU-BT*\n\n`;
                    cmsg += `📱 *Status:* Connected\n`;
                    cmsg += `🔰 *Prefix:* ${prefixe}\n`;
                    cmsg += `👥 *Mode:* ${(conf.MODE || 'public').toUpperCase()}\n\n`;
                    cmsg += `_Powered by Rahmany_`;
                    await zk.sendMessage(zk.user.id, { text: cmsg });
                }
            } else if (connection == "close") {
                let raisonDeconnexion = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
                console.log("⚠️ Disconnected, reconnecting in 5 seconds...");
                setTimeout(main, 5000);
            }
        });

        // ============ CREDS UPDATE ============
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
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './temp/' + filename + '.' + type.ext;
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
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
