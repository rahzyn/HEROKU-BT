const { zokou } = require("../framework/zokou");
const conf = require("../set");
const os = require("os");
const { performance } = require("perf_hooks");

zokou({
    nomCom: "ping",
    categorie: "General",
    reaction: "⚡",
    desc: "Check bot speed with beautiful card",
    fromMe: false
}, async (dest, zk, commandeOptions) => {
    const { ms, auteurMessage, nomAuteurMessage } = commandeOptions;

    const start = performance.now();
    const sent = await zk.sendMessage(dest, { text: "🔵 *Pinging...*" }, { quoted: ms });
    const ping = Math.round(performance.now() - start);

    // Uptime
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);

    // Date & Time
    const now = new Date();
    const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const time = now.toLocaleTimeString('en-GB');

    // Speed indicator
    let emoji = "🟢", status = "Excellent";
    if (ping > 200) { emoji = "🟡"; status = "Good"; }
    if (ping > 500) { emoji = "🟠"; status = "Average"; }
    if (ping > 1000) { emoji = "🔴"; status = "Slow"; }

    // Memory
    const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    try { await zk.sendMessage(dest, { delete: sent.key }); } catch (e) {}

    const text = `⚡ *${conf.BOT_NAME || "HEROKU-BT"} SYSTEM*
*STATUS*
Bot is running smoothly 🚀

┌─────────────────────
│  📡 *${conf.BOT_NAME || "HEROKU-BT"} PING*
│
│  ⏱️ Response: *${ping}ms*
│  📅 Date: *${date}*
│  🕐 Time: *${time}*
│  ⚡ Uptime: *${d}h ${h}m*
│
└─────────────────────

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
                title: `⚡ ${conf.BOT_NAME || "HEROKU-BT"} SYSTEM STATUS`,
                body: "Bot is running smoothly 🚀",
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
