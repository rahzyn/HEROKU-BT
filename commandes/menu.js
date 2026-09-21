const { zokou } = require("../framework/zokou");
const conf = require("../set");
const fs = require("fs");
const path = require("path");

zokou({
    nomCom: "menu",
    categorie: "General",
    reaction: "📋",
    desc: "Show bot menu",
    fromMe: false
}, async (dest, zk, commandeOptions) => {
    const { ms, auteurMessage, nomAuteurMessage } = commandeOptions;

    // Read commands from framework
    const commandsPath = path.join(__dirname, "../framework/zokou.js");
    let totalCommands = 0;
    let categories = {};

    try {
        const commands = require("../framework/zokou").commandes || [];
        totalCommands = commands.length;
        
        commands.forEach(cmd => {
            const cat = cmd.categorie || "General";
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd.nomCom);
        });
    } catch (e) {
        console.log("Menu error:", e.message);
    }

    // Uptime
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);

    // Date
    const now = new Date();
    const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const time = now.toLocaleTimeString('en-GB');

    // Build categories list
    let catList = "";
    for (const [cat, cmds] of Object.entries(categories)) {
        catList += `│  📁 *${cat}* (${cmds.length})\n`;
    }

    const text = `╔═══════════════════════╗
║   📋 *${(conf.BOT_NAME || "HEROKU-BT").toUpperCase()} MENU*   
╚═══════════════════════╝

    🤖 *Bot is Online* ✅

╭───────────────────────╮
│  📊 *BOT INFO*
├───────────────────────┤
│
│  📛 *Name:* ${conf.BOT_NAME || "HEROKU-BT"}
│  📦 *Commands:* ${totalCommands}
│  ⚡ *Uptime:* ${d}d ${h}h ${m}m
│  📅 *Date:* ${date}
│  🕐 *Time:* ${time}
│
╰───────────────────────╯

╭───────────────────────╮
│  📂 *CATEGORIES*
├───────────────────────┤
│
${catList}│
╰───────────────────────╯

> *View channel*`;

    await zk.sendMessage(dest, {
        text: text,
        mentions: [auteurMessage],
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363353854480831@newsletter",
                newsletterName: conf.BOT_NAME || "HEROKU-BT",
                serverMessageId: 143
            },
            externalAdReply: {
                title: `📋 ${conf.BOT_NAME || "HEROKU-BT"} MENU`,
                body: `${totalCommands} commands available 🚀`,
                mediaType: 1,
                mediaUrl: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
                sourceUrl: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
                thumbnailUrl: "https://files.catbox.moe/zotx9t.jpg",
                showAdAttribution: false,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: ms });
});
