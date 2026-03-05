const { zokou } = require(__dirname + "/../framework/zokou");
const os = require("os");
const { format } = require(__dirname + "/../framework/mesfonctions");
const s = require(__dirname + "/../set");

zokou({ 
    nomCom: "repo", 
    categorie: "General",
    reaction: "📦",
    alias: ["info", "botinfo", "channel"]
}, async (dest, zk, commandeOptions) => {
    
    let { ms, repondre, prefixe } = commandeOptions;
    
    // ===== URL ZAKO =====
    const channelUrl = "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X";
    const channelName = "Rahmani Md Updates";
    const channelId = "120363353854480831@newsletter";
    
    const githubUrl = "https://github.com/rahzyn/HEROKU-BT";
    const ownerUrl = "https://wa.me/255693629079";
    
    // ===== PICHA YAKO =====
    const pichaYako = "https://files.catbox.moe/zotx9t.jpg";
    // ======================
    
    // System info
    const mode = s.MODE?.toLowerCase() == "yes" ? "🌐 Public" : "🔒 Private";
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const usedMemory = format(os.totalmem() - os.freemem());
    const totalMemory = format(os.totalmem());
    
    // Message
    const repoMsg = `
╭━━━━ *HEROKU-BT* ━━━━╮
┃
┃  🤖 *Mode:* ${mode}
┃  💾 *RAM:* ${usedMemory}/${totalMemory}
┃  ⏰ *Uptime:* ${days}d ${hours}h ${minutes}m
┃  📌 *Prefix:* ${prefixe}
┃
┃  👑 *Dev:* Rahmany & Qart
┃  📢 *Channel:* ${channelName}
┃
╰━━━━━━━━━━━━━━━━╯

*👇 CLICK BUTTONS BELOW 👇*
    `;

    try {
        // Tuma picha yako na buttons
        await zk.sendMessage(dest, {
            image: { url: pichaYako },  // PICHA YAKO INAONEKANA HAPA
            caption: repoMsg,
            footer: "Powered by Rahmani Md",
            buttons: [
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
            ],
            headerType: 4,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelId,
                    newsletterName: channelName,
                    serverMessageId: -1
                }
            }
        }, { quoted: ms });

    } catch (e) {
        console.log("Error:", e);
        // Kama picha haifanyi kazi, tuma text tu
        await repondre(repoMsg + `\n\n📢 ${channelUrl}\n📁 ${githubUrl}\n💬 ${ownerUrl}`);
    }
});
