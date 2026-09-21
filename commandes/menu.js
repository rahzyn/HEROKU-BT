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
    const { ms, auteurMessage } = commandeOptions;

    const commandsDir = path.join(__dirname, "../commands");
    let categories = {};
    let totalCommands = 0;

    try {
        const files = fs.readdirSync(commandsDir);
        for (const file of files) {
            if (!file.endsWith(".js")) continue;
            try {
                const content = fs.readFileSync(path.join(commandsDir, file), "utf8");
                const nomMatch = content.match(/nomCom:\s*["']([^"']+)["']/);
                const catMatch = content.match(/categorie:\s*["']([^"']+)["']/);
                if (nomMatch) {
                    const category = catMatch ? catMatch[1] : "General";
                    if (!categories[category]) categories[category] = [];
                    categories[category].push(nomMatch[1]);
                    totalCommands++;
                }
            } catch (e) {}
        }
    } catch (e) {}

    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);

    const now = new Date();
    const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const time = now.toLocaleTimeString('en-GB');

    let menuText = `╭━━━〔 *${(conf.BOT_NAME || "HEROKU-BT").toUpperCase()}* 〕━━━╮
┃
┃  ⚡ *Status*   : Online ✅
┃  📦 *Commands* : ${totalCommands}
┃  ⏱️ *Uptime*   : ${d}d ${h}h ${m}m
┃  📅 *Date*     : ${date}
┃  🕐 *Time*     : ${time}
┃
╰━━━━━━━━━━━━━━━╯

`;

    for (const [cat, cmds] of Object.entries(categories)) {
        menuText += `╭─❰ *${cat.toUpperCase()}* ❱\n`;
        cmds.forEach(cmd => {
            menuText += `┃ ▸ ${conf.PREFIXE || "."}${cmd}\n`;
        });
        menuText += `╰────────────\n\n`;
    }

    menuText += `> *View channel*`;

    await zk.sendMessage(dest, {
        text: menuText,
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
