// RAHMANI-MD © Compact Menu
const conf = require("../set");
const moment = require("moment-timezone");

module.exports = {
    nomCom: "menu",
    categorie: "General",
    reaction: "📋",
    
    fonction: async (origineMessage, zk, commandeOptions) => {
        const { ms, prefixe, repondre, verifGroupe, nomGroupe, 
                nomAuteurMessage, superUser, verifAdmin, idBot } = commandeOptions;

        const time = moment().tz("Africa/Nairobi").format("HH:mm");
        const uptime = process.uptime();
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);

        const commands = require("../framework/zokou").cm || [];
        const cats = {};
        commands.filter(c => c.nomCom && c.categorie).forEach(c => {
            const k = c.categorie.toUpperCase();
            cats[k] = cats[k] || [];
            if (!cats[k].includes(c.nomCom)) cats[k].push(c.nomCom);
        });

        const emojiMap = {
            GENERAL: "⚙️", ADMIN: "🛡️", OWNER: "👑", GROUP: "👥",
            DOWNLOAD: "📥", MEDIA: "🎬", FUN: "🎮", TOOLS: "🔧",
            AI: "🤖", SEARCH: "🔍", STICKER: "🎨", AUDIO: "🎵",
            IMAGE: "🖼️", TEXT: "📝", RELIGION: "🕌", CONVERTER: "🔄"
        };

        let list = "";
        Object.keys(cats).sort().forEach(cat => {
            const e = emojiMap[cat] || "📌";
            list += `\n${e} *${cat}*\n`;
            list += cats[cat].sort().map(c => `   ▸ ${prefixe}${c}`).join("\n") + "\n";
        });

        const role = superUser ? "👑 Owner" : verifAdmin ? "🛡️ Admin" : "👤 User";
        const mode = (conf.MODE || "").toLowerCase() === "yes" ? "🌍 Public" : "🔒 Private";

        const menu = `
┌─────────────────────────┐
│  🤖 *HEROKU-BT* 🤖     │
│    _Premium Bot_        │
└─────────────────────────┘

👤 *${nomAuteurMessage}* • ${role}
${verifGroupe ? `👥 *${nomGroupe}*` : "💬 Private Chat"}

┌─── *SYSTEM INFO* ───┐
│ ⚡ Mode    : ${mode}
│ 📦 Commands: ${commands.filter(c=>c.nomCom).length}
│ ⏱️  Uptime  : ${h}h ${m}m
│ 🕐 Time    : ${time}
│ 🔑 Prefix  : ${prefixe}
└─────────────────────┘

╭─── *COMMANDS* ───╮
${list}
╰──────────────────╯

💫 *Powered by RAHMANI-MD*
📢 Join: wa.me/channel
`;

        try {
            await zk.sendMessage(origineMessage, {
                image: { url: conf.MENU_IMAGE || "./media/menu.jpg" },
                caption: menu
            }, { quoted: ms });
        } catch {
            repondre(menu);
        }
    }
};
