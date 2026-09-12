const { zokou } = require("../framework/zokou");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");

zokou({
    nomCom: "ping",
    aliases: ["p", "speed"],
    categorie: "General",
    reaction: "⚡",
    desc: "Check bot response speed"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;

    // ── Time ─────────────────────────────────────
    const now = moment().tz("Africa/Dar_es_Salaam");
    const time = now.format("HH:mm:ss");
    const date = now.format("DD/MM/YYYY");

    // ── Measure latency (send + measure) ─────────
    const sentAt = Date.now();
    const sent = await zk.sendMessage(dest, { text: "█▓▒░ ▓▒░ PINGING... ░▒▓ ░▒▓█" }, { quoted: ms });
    const latency = Date.now() - sentAt;

    // ── Uptime ───────────────────────────────────
    const up = process.uptime();
    const uptime = `${Math.floor(up / 3600)}h ${Math.floor((up % 3600) / 60)}m ${Math.floor(up % 60)}s`;

    // ── System ───────────────────────────────────
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const platform = os.platform();
    const arch = os.arch();

    // ── Speed rating ─────────────────────────────
    let rating, status;
    if (latency < 200)      { rating = "◉◉◉◉◉"; status = "EXCELLENT"; }
    else if (latency < 500) { rating = "◉◉◉◉◎"; status = "GOOD"; }
    else if (latency < 1000){ rating = "◉◉◉◎◎"; status = "FAIR"; }
    else if (latency < 2000){ rating = "◉◉◎◎◎"; status = "SLOW"; }
    else                    { rating = "◉◎◎◎◎"; status = "POOR"; }

    // ── Bot ──────────────────────────────────────
    const mode = (s.MODE || "public").toLowerCase() === "public"
        ? "◉ ONLINE  ·  PUBLIC"
        : "◉ ONLINE  ·  PRIVATE";
    const botName = s.BOT_NAME || "HEROKU-BT";

    // ═══════════════════════════════════════════════
    //  ⚡ NEON DARK PING RESPONSE
    // ═══════════════════════════════════════════════
    const pingMsg = `█▓▒░ ⚡ PONG ⚡ ░▒▓█
▓▒░ SIGNAL ACQUIRED ░▒▓
▒░░░░░░░░░░░░░░░░░░░░░░░▒▒

┌──────────────────────────┐
│  ▸ STATUS   »  ${mode}
│  ▸ LATENCY  »  ${latency} ms
│  ▸ RATING   »  ${rating}
│  ▸ QUALITY  »  ${status}
│  ▸ TIME     »  ${time}
│  ▸ DATE     »  ${date}
│  ▸ UPTIME   »  ${uptime}
│  ▸ RAM      »  ${ram} MB
│  ▸ HOST     »  ${platform}/${arch}
└──────────────────────────┘

▓▒░ ▌ CONNECTION STABLE ▌ ░▒▓
▒░▓█ ${botName} · ONLINE █▓░▒
█▓▒░ ⚡ SYSTEM NOMINAL ⚡ ░▒▓█`;

    // ── Edit the "PINGING..." message with result ─
    try {
        await zk.sendMessage(dest, {
            text: pingMsg,
            edit: sent.key
        });
    } catch (e) {
        // Fallback: send new message if edit not supported
        await repondre(pingMsg);
    }
});
