const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// ============================================
// REPO COMMAND - BOT INFORMATION
// ============================================

zokou({ 
    nomCom: "repo", 
    categorie: "General",
    reaction: "⚙️" 
}, async (dest, zk, commandeOptions) => {
    
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
    let { cm } = require(__dirname + "/../framework//zokou");
    
    var coms = {};
    var mode = "public";
    
    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }

    // Group commands by category
    cm.map(async (com, index) => {
        if (!coms[com.categorie])
            coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    // Time settings
    moment.tz.setDefault('Etc/GMT');
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');
    
    // Uptime calculation
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (3600 * 24));
    const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    
    // System info
    const totalCommands = Object.values(coms).flat().length;
    const categories = Object.keys(coms).length;
    const platform = os.platform();
    const arch = os.arch();
    const cpuCores = os.cpus().length;
    const nodeVersion = process.version;
    
    // Bot status emojis
    const statusEmoji = mode === "public" ? "🌐" : "🔒";
    
    // CHANNEL INFO - IMPORTANT PART
    const channelId = "120363353854480831@newsletter";
    const channelLink = "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X";
    
    // Enhanced information message with better formatting
    let infoMsg = `
╭──────────────────────╮
│    🤖 *BOT REPOSITORY*    │
╰──────────────────────╯

*📦 BASIC INFO*
┌─────────────────────
│ 📛 *Bot Name* : HEROKU-BT
│ 🏷️ *Version* : v2.0.0
│ 👤 *Mode* : ${statusEmoji} ${mode.toUpperCase()}
│ 📊 *Status* : 🟢 Online
│ 📟 *Prefix* : ${prefixe}
│ 📍 *Platform* : ${platform} (${arch})
│ 📅 *Date* : ${date}
│ ⏰ *Time* : ${temps} GMT
└─────────────────────

*📊 SYSTEM STATISTICS*
┌─────────────────────
│ 💾 *RAM Usage* : ${format(os.totalmem() - os.freemem())} / ${format(os.totalmem())}
│ 🔧 *CPU Cores* : ${cpuCores}
│ 📈 *Uptime* : ${days}d ${hours}h ${minutes}m ${seconds}s
│ 🟢 *Node Version* : ${nodeVersion}
└─────────────────────

*🤖 COMMANDS OVERVIEW*
┌─────────────────────
│ 📋 *Total Cmds* : ${totalCommands}
│ 📂 *Categories* : ${categories}
│ ⚡ *Active* : Yes
└─────────────────────

*👥 DEVELOPER TEAM*
┌─────────────────────
│ 👨‍💻 *Lead Dev* : *Rahmany*
│ 👨‍💻 *Co-Dev* : *Qart*
│ 📱 *Contact* : wa.me/255693629079
└─────────────────────

*📢 OFFICIAL CHANNEL* ⭐
┌─────────────────────
│ 📌 *Name* : RAHMANI MD Updates
│ 👥 *Members* : Join us!
│ 🔔 *Updates* : Latest news & features
│ 📎 *Link* : ${channelLink}
└─────────────────────

*🔗 USEFUL LINKS*
┌─────────────────────
│ 📁 *GitHub* : github.com/rahzyn/HEROKU-BT
│ 💬 *Support* : wa.me/255693629079
└─────────────────────
    `;
    
    // Menu message with better styling
    let menuMsg = `
╭──────────────────────╮
│    ✨ *COMMANDS MENU*    │
╰──────────────────────╯

${Object.keys(coms).map(cat => {
    const cmdCount = coms[cat].length;
    return `*📌 ${cat.toUpperCase()}* (${cmdCount})\n┌─────────────────────\n│ ${coms[cat].slice(0, 6).map(cmd => `▸ ${cmd}`).join('\n│ ')}${cmdCount > 6 ? '\n│ ▸ and ' + (cmdCount-6) + ' more...' : ''}\n└─────────────────────`;
}).join('\n\n')}

╭─────────────────────╮
│   🚀 *POWERED BY*    │
│   *HEROKU-BT ENGINE*  │
╰─────────────────────╯
*Je suis *Beltahmd* - développeur Beltah Tech*

_💫 Join our channel for updates!_
    `;

    // Handle media response
    var lien = mybotpic();

    try {
        // Create channel button
        const channelButton = {
            text: "📢 JOIN OFFICIAL CHANNEL",
            url: channelLink
        };
        
        // Support button
        const supportButton = {
            text: "💬 CONTACT OWNER",
            url: "https://wa.me/255693629079"
        };
        
        // GitHub button
        const githubButton = {
            text: "📁 GET REPO",
            url: "https://github.com/rahzyn/HEROKU-BT"
        };

        if (lien && typeof lien === 'string') {
            if (lien.match(/\.(mp4|gif)$/i)) {
                await zk.sendMessage(dest, { 
                    video: { url: lien }, 
                    caption: infoMsg + menuMsg,
                    gifPlayback: true,
                    contextInfo: {
                        externalAdReply: {
                            title: "🤖 HEROKU-BT REPOSITORY",
                            body: "Join our channel for updates! ⭐",
                            mediaType: 1,
                            thumbnail: await getThumbnail(),
                            sourceUrl: channelLink,
                            showAdAttribution: true
                        },
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: channelId,
                            newsletterName: "BeltahTech Updates",
                            serverMessageId: -1
                        }
                    },
                    buttons: [
                        channelButton,
                        supportButton,
                        githubButton
                    ],
                    viewOnce: true
                }, { quoted: ms });
            }
            else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
                await zk.sendMessage(dest, { 
                    image: { url: lien }, 
                    caption: infoMsg + menuMsg,
                    contextInfo: {
                        externalAdReply: {
                            title: "🤖 HEROKU-BT REPOSITORY",
                            body: "Join our channel for updates! ⭐",
                            mediaType: 1,
                            thumbnail: await getThumbnail(),
                            sourceUrl: channelLink,
                            showAdAttribution: true
                        },
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: channelId,
                            newsletterName: "BeltahTech Updates",
                            serverMessageId: -1
                        }
                    },
                    buttons: [
                        channelButton,
                        supportButton,
                        githubButton
                    ],
                    viewOnce: true
                }, { quoted: ms });
            }
            else {
                // Send with buttons even for text
                await zk.sendMessage(dest, { 
                    text: infoMsg + menuMsg,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: channelId,
                            newsletterName: "BeltahTech Updates",
                            serverMessageId: -1
                        }
                    },
                    buttons: [
                        channelButton,
                        supportButton,
                        githubButton
                    ],
                    viewOnce: true
                }, { quoted: ms });
            }
        } else {
            // Send with buttons for text
            await zk.sendMessage(dest, { 
                text: infoMsg + menuMsg,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: channelId,
                        newsletterName: "BeltahTech Updates",
                        serverMessageId: -1
                    }
                },
                buttons: [
                    channelButton,
                    supportButton,
                    githubButton
                ],
                viewOnce: true
            }, { quoted: ms });
        }
    } catch (e) {
        console.log("❌ Menu error: " + e);
        
        // Fallback with channel mention
        const fallbackMsg = infoMsg + menuMsg + `

╔══════════════════╗
║   📢 *JOIN OUR CHANNEL*   ║
╠══════════════════╣
║ 👆 Click the button below  ║
║    to get updates!         ║
╚══════════════════╝`;

        await zk.sendMessage(dest, { 
            text: fallbackMsg,
            buttons: [
                {
                    text: "📢 JOIN CHANNEL",
                    url: channelLink
                }
            ]
        }, { quoted: ms });
    }
});

// Helper function for thumbnail
async function getThumbnail() {
    try {
        // You can add a default thumbnail URL or image buffer here
        // Example: return "https://i.imgur.com/your-image.jpg";
        return null;
    } catch (e) {
        return null;
    }
}
