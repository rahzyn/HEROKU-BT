const { zokou } = require(__dirname + "/../framework/zokou");
const os = require("os");
const { format } = require(__dirname + "/../framework/mesfonctions");
const s = require(__dirname + "/../set");
const config = require(__dirname + "/../config"); // Ikiwa una config file

zokou({ 
    nomCom: "repo", 
    categorie: "General",
    reaction: "📦",
    alias: ["info", "botinfo", "channel"] // Alias za command
}, async (dest, zk, commandeOptions) => {
    
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic, etat } = commandeOptions;
    
    // Channel yako - CTA URL
    const channelUrl = "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X";
    const channelName = "Rahmani Md Updates";
    const githubUrl = "https://github.com/rahzyn/HEROKU-BT";
    const ownerUrl = "https://wa.me/255693629079";
    const ownerName = "Rahmany";
    
    // System info
    const mode = s.MODE?.toLowerCase() == "yes" ? "🌐 Public" : "🔒 Private";
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const usedMemory = format(os.totalmem() - os.freemem());
    const totalMemory = format(os.totalmem());
    const platform = os.platform();
    const version = "v2.0.0";
    
    // Message kamili
    const repoMsg = `
╭━━━━ *HEROKU-BT* ━━━━╮
┃
┃  🤖 *Bot Name:* HEROKU-BT
┃  🏷️ *Version:* ${version}
┃  👤 *Mode:* ${mode}
┃  📟 *Prefix:* ${prefixe}
┃  📍 *Platform:* ${platform}
┃
┃  💾 *RAM:* ${usedMemory}/${totalMemory}
┃  ⏰ *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
┃
┃  👨‍💻 *Developer Team*
┃  ┃ 👑 *Lead:* Rahmany
┃  ┃ 👨‍🔧 *Co-Dev:* Qart
┃
┃  📢 *Channel:* ${channelName}
┃
╰━━━━━━━━━━━━━━━━╯

*✨ CLICK BUTTONS BELOW ✨*
    `;

    try {
        // Pata bot profile picture
        let pic;
        try {
            pic = await mybotpic();
        } catch {
            pic = null;
        }

        // Prepare buttons
        const buttons = [
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
                    displayText: "💬 CONTACT OWNER",
                    url: ownerUrl
                }
            }
        ];

        // Send with image if available
        if (pic && typeof pic === 'string' && pic.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(dest, {
                image: { url: pic },
                caption: repoMsg,
                footer: "Powered by Rahmany",
                buttons: buttons,
                headerType: 4, // Header ya image
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363353854480831@newsletter",
                        newsletterName: channelName,
                        serverMessageId: -1
                    },
                    externalAdReply: {
                        title: "HEROKU-BT BOT",
                        body: "Join our channel for updates!",
                        thumbnail: pic,
                        sourceUrl: channelUrl,
                        mediaType: 1
                    }
                }
            }, { quoted: ms });
        } else {
            // Send with text only
            await zk.sendMessage(dest, {
                text: repoMsg,
                footer: "Powered by Rahmany",
                buttons: buttons,
                headerType: 1,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363353854480831@newsletter",
                        newsletterName: channelName,
                        serverMessageId: -1
                    },
                    externalAdReply: {
                        title: "HEROKU-BT BOT",
                        body: "Join our channel for updates!",
                        sourceUrl: channelUrl,
                        mediaType: 1
                    }
                }
            }, { quoted: ms });
        }

    } catch (e) {
        console.log("Repo command error:", e);
        
        // Simple fallback
        await repondre(`*HEROKU-BT INFO*
        
Mode: ${mode}
RAM: ${usedMemory}/${totalMemory}
Uptime: ${hours}h ${minutes}m
Prefix: ${prefixe}

📢 Channel: ${channelUrl}
📁 Repo: ${githubUrl}
💬 Owner: ${ownerUrl}`);
    }
});

// Button response handler (kama bot inahitaji)
zokou({ 
    nomCom: "cta_click", 
    categorie: "General",
    isButton: true
}, async (dest, zk, commandeOptions) => {
    // Hii inahitajika kwa baadhi ya versions za framework
    return;
});
