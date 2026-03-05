const { zokou } = require(__dirname + "/../framework/zokou");
const os = require("os");
const { format } = require(__dirname + "/../framework/mesfonctions");
const s = require(__dirname + "/../set");
const moment = require('moment-timezone');

zokou({
    nomCom: "repo",
    categorie: "General",
    reaction: "📦",
    alias: ["info", "botinfo", "channel", "pair", "session", "menu"]
}, async (dest, zk, commandeOptions) => {
    
    let { ms, repondre, prefixe, mybotpic } = commandeOptions;
    
    // ===== SYSTEM INFO =====
    const mode = s.MODE?.toLowerCase() === "yes" ? "🔓 Public" : "🔒 Private";
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const usedMemory = format(os.totalmem() - os.freemem());
    const totalMemory = format(os.totalmem());
    
    // ===== TIME =====
    moment.tz.setDefault("Africa/Dar_es_Salaam");
    const time = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");
    
    // ===== YOUR LINKS =====
    const channelUrl = "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X";
    const channelName = "BeltahTech Updates";
    const channelId = "120363353854480831@newsletter";
    
    const githubUrl = "https://github.com/rahzyn/HEROKU-BT";
    const pairUrl = "https://heroku-pair.onrender.com/";
    const ownerUrl = "https://wa.me/255693629079";
    const groupUrl = "https://chat.whatsapp.com/DTnrZzULVtP5r0E9rhoFOj";
    
    // ===== BOT PICTURE =====
    const botPic = mybotpic() || "https://files.catbox.moe/zotx9t.jpg";
    
    // ===== BEAUTIFUL MESSAGE =====
    const repoMessage = `
╔══════════════════════╗
    🤖 *HEROKU-BT BOT*    
╚══════════════════════╝

*📊 SYSTEM STATUS*
┌────────────────────
│ ⏰ *Time:* ${time}
│ 📅 *Date:* ${date}
│ 📌 *Prefix:* ${prefixe}
│ 🚀 *Mode:* ${mode}
│ 💾 *RAM:* ${usedMemory}/${totalMemory}
│ ⏱️ *Uptime:* ${days}d ${hours}h ${minutes}m
└────────────────────

*🔗 QUICK LINKS*
┌────────────────────
│ 📢 *Channel:* ${channelName}
│ 📁 *Repo:* HEROKU-BT
│ 👑 *Owner:* Rahmany & Qart
└────────────────────

*✨ AVAILABLE RESOURCES*
╭────────────────────
│ 📦 *PAIR CODE:* 
│ ${pairUrl}
│
│ 📢 *JOIN CHANNEL:* 
│ ${channelUrl}
│
│ 👥 *SUPPORT GROUP:* 
│ ${groupUrl}
│
│ 📁 *SOURCE CODE:* 
│ ${githubUrl}
│
│ 💬 *CONTACT OWNER:* 
│ ${ownerUrl}
╰────────────────────

*🔥 BOT COMMANDS*
╭────────────────────
│ ▸ ${prefixe}repo - Bot info
│ ▸ ${prefixe}menu - All commands
│ ▸ ${prefixe}pair - Get session
│ ▸ ${prefixe}alive - Check bot
│ ▸ ${prefixe}ping - Speed test
╰────────────────────

*🌟 STAY CONNECTED*
» Star the repo ⭐
» Join channel 🔔
» Share with friends 🤝

*📱 Powered by BeltahTech*
    `;

    try {
        // Check if bot picture is video
        if (botPic.match(/\.(mp4|gif)$/i)) {
            await zk.sendMessage(dest, {
                video: { url: botPic },
                caption: repoMessage,
                gifPlayback: true,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: channelId,
                        newsletterName: channelName,
                        serverMessageId: -1
                    },
                    externalAdReply: {
                        title: "🤖 HEROKU-BT BOT",
                        body: "Click buttons below",
                        thumbnailUrl: "https://files.catbox.moe/zotx9t.jpg",
                        sourceUrl: githubUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                },
                buttons: [
                    {
                        urlButton: {
                            displayText: "🔑 GET PAIR CODE",
                            url: pairUrl
                        }
                    },
                    {
                        urlButton: {
                            displayText: "📢 JOIN CHANNEL",
                            url: channelUrl
                        }
                    },
                    {
                        urlButton: {
                            displayText: "📁 GET REPO",
                            url: githubUrl
                        }
                    },
                    {
                        urlButton: {
                            displayText: "💬 OWNER",
                            url: ownerUrl
                        }
                    }
                ]
            }, { quoted: ms });
        }
        // Check if bot picture is image
        else if (botPic.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(dest, {
                image: { url: botPic },
                caption: repoMessage,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: channelId,
                        newsletterName: channelName,
                        serverMessageId: -1
                    },
                    externalAdReply: {
                        title: "🤖 HEROKU-BT BOT",
                        body: "Click buttons below",
                        thumbnailUrl: botPic,
                        sourceUrl: githubUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                },
                buttons: [
                    {
                        urlButton: {
                            displayText: "🔑 GET PAIR CODE",
                            url: pairUrl
                        }
                    },
                    {
                        urlButton: {
                            displayText: "📢 JOIN CHANNEL",
                            url: channelUrl
                        }
                    },
                    {
                        urlButton: {
                            displayText: "📁 GET REPO",
                            url: githubUrl
                        }
                    },
                    {
                        urlButton: {
                            displayText: "💬 OWNER",
                            url: ownerUrl
                        }
                    }
                ]
            }, { quoted: ms });
        }
        // If no picture or invalid format, send text only
        else {
            await repondre(repoMessage);
        }
        
    } catch (error) {
        console.log("Repo command error:", error);
        // Fallback message if buttons fail
        await repondre(`*HEROKU-BT BOT INFO*

*🔗 LINKS:*
📦 Pair: ${pairUrl}
📢 Channel: ${channelUrl}
📁 Repo: ${githubUrl}
💬 Owner: ${ownerUrl}

*Send ${prefixe}menu for commands*`);
    }
});
