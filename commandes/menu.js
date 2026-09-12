const { zokou } = require("../framework/zokou");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");

zokou({
    nomCom: "menu",
    aliases: ["help", "h"],
    categorie: "General",
    reaction: "🌌",
    desc: "Show all available commands"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, mybotpic, nomAuteurMessage } = commandeOptions;
    const { cm } = require("../framework/zokou");

    // ── Time ─────────────────────────────────────
    const now = moment().tz("Africa/Dar_es_Salaam");
    const time = now.format("HH:mm:ss");
    const date = now.format("DD/MM/YYYY");
    const day  = now.format("dddd").toUpperCase();

    // ── Uptime ───────────────────────────────────
    const up = process.uptime();
    const uptime = `${Math.floor(up / 3600)}h ${Math.floor((up % 3600) / 60)}m ${Math.floor(up % 60)}s`;

    // ── System ───────────────────────────────────
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const platform = os.platform();
    const arch = os.arch();

    // ── Bot ──────────────────────────────────────
    const mode = (s.MODE || "public").toLowerCase() === "public"
        ? "◉ ONLINE  ·  PUBLIC"
        : "◉ ONLINE  ·  PRIVATE";
    const prefix  = prefixe || ".";
    const botName = s.BOT_NAME || "HEROKU-BT";

    // ── Group commands ───────────────────────────
    const cats = {};
    cm.forEach(c => {
        const cat = (c.categorie || "General").trim();
        (cats[cat] = cats[cat] || []).push(c.nomCom);
    });

    const order = ["General", "Owner", "Group", "Download", "AI", "Tools", "Fun", "Search"];
    const sorted = Object.keys(cats).sort((a, b) => {
        const ai = order.indexOf(a), bi = order.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.localeCompare(b);
    });

    // ═══════════════════════════════════════════════
    //  🌌 NEON DARK MENU
    // ═══════════════════════════════════════════════
    let menu = `█▓▒░ ⚡ ${botName} ⚡ ░▒▓█
▓▒░ SYSTEM INITIALIZED ░▒▓
▒░░░░░░░░░░░░░░░░░░░░░░░▒▒

┌──────────────────────────┐
│  ▸ USER   »  ${nomAuteurMessage || "User"}
│  ▸ TIME   »  ${time}
│  ▸ DATE   »  ${date}
│  ▸ DAY    »  ${day}
│  ▸ UPTIME »  ${uptime}
│  ▸ RAM    »  ${ram} MB
│  ▸ HOST   »  ${platform}/${arch}
│  ▸ MODE   »  ${mode}
│  ▸ PREFIX »  [ ${prefix} ]
│  ▸ CMDS   »  ${cm.length}
└──────────────────────────┘

▓▒░ ▌ ACCESSING DATABASE ▌ ░▒▓
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`;

    // ── Add categories ───────────────────────────
    sorted.forEach((cat) => {
        const list = cats[cat].sort();
        menu += `\n\n█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█`;
        menu += `\n█  ⚡ ${cat.toUpperCase().padEnd(15)} [${list.length}]  █`;
        menu += `\n█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█`;
        list.forEach((cmd) => {
            menu += `\n  ▓ ${prefix}${cmd}`;
        });
    });

    // ── Footer ───────────────────────────────────
    menu += `

█▓▒░ END OF DATABASE ░▒▓█

┌──────────────────────────┐
│  📝 USAGE                
│  ▸ Type   »  ${prefix}command
│  ▸ Example »  ${prefix}ping
└──────────────────────────┘

░▒▓█ 📢 CHANNEL █▓▒░
  ▸ https://whatsapp.com/channel/0029VatokI45EjxufALmY32X

▒░▓█ SYSTEM STATUS: ONLINE █▓░▒
█▓▒░ ${botName} · ${cm.length} CMDS · ${date} ░▒▓█`;

    // ── Send ─────────────────────────────────────
    const img = mybotpic ? mybotpic() : "https://files.catbox.moe/zotx9t.jpg";

    try {
        if (img && /\.(jpe?g|png)$/i.test(img)) {
            await zk.sendMessage(dest, {
                image: { url: img },
                caption: menu
            }, { quoted: ms });
        } else {
            await repondre(menu);
        }
    } catch (e) {
        console.error("Menu image error:", e.message);
        await repondre(menu);
    }
});
