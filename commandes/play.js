const { zokou } = require("../framework/zokou");
const conf = require("../set");
const axios = require("axios");

// ═══════════════════════════════════════════════
//   ⚙️ API CONFIG (Updated)
// ═══════════════════════════════════════════════
const SEARCH_API = "https://apis.davidcyril.name.ng/search/youtube";
const MP3_API = "https://apis.davidcyril.name.ng/download/ytmp3";
const MP4_API = "https://apis.davidcyril.name.ng/download/ytmp4";

// ═══════════════════════════════════════════════
//   🎧 .play — Download Audio
// ═══════════════════════════════════════════════
zokou({
    nomCom: "play",
    categorie: "Downloader",
    reaction: "🎧",
    desc: "Download audio from YouTube",
    fromMe: false
}, async (dest, zk, commandeOptions) => {
    const { ms, arg, auteurMessage } = commandeOptions;
    const query = (arg || []).join(" ").trim();

    if (!query) {
        return zk.sendMessage(dest, {
            text: `🎧 *${conf.BOT_NAME || "HEROKU-BT"} PLAY*

┌─────────────────────
│  📖 *Usage:*
│  ▸ .play <jina la wimbo>
│  ▸ .play <youtube link>
│
│  💡 *Mfano:*
│  ▸ .play Faded Alan Walker
│
└─────────────────────

> *View channel*`,
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
                    title: `🎧 ${conf.BOT_NAME || "HEROKU-BT"} AUDIO`,
                    body: "Download any song 🎵",
                    mediaType: 1,
                    mediaUrl: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
                    sourceUrl: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
                    thumbnailUrl: "https://files.catbox.moe/zotx9t.jpg",
                    showAdAttribution: false,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: ms });
    }

    // React
    await zk.sendMessage(dest, { react: { text: "🎧", key: ms.key } }).catch(() => {});

    try {
        // Search YouTube if not URL
        let videoUrl = query;
        if (!query.startsWith("http")) {
            const s = await axios.get(`${SEARCH_API}?q=${encodeURIComponent(query)}`, { timeout: 30000 });
            const hit = s.data?.result?.[0] || s.data?.[0];
            if (!hit) throw new Error("Wimbo haujapatikana");
            videoUrl = hit.url || hit.link;
        }

        // Download MP3
        const r = await axios.get(`${MP3_API}?url=${encodeURIComponent(videoUrl)}`, { timeout: 90000 });
        const d = r.data;
        const audioUrl = d?.result?.download_url || d?.download_url || d?.result?.url || d?.url;
        const title = d?.result?.title || d?.title || query;
        const cover = d?.result?.thumbnail || d?.thumbnail || "https://files.catbox.moe/zotx9t.jpg";

        if (!audioUrl) throw new Error("Audio haipatikani");

        await zk.sendMessage(dest, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title.replace(/[^\w\s.-]/g, "").slice(0, 50)}.mp3`,
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: `🎧 ${title}`,
                    body: conf.BOT_NAME || "HEROKU-BT",
                    mediaType: 1,
                    previewType: 0,
                    thumbnailUrl: cover,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: ms });

        await zk.sendMessage(dest, { react: { text: "✅", key: ms.key } }).catch(() => {});

    } catch (e) {
        const err = e?.response?.data?.error || e.message;
        await zk.sendMessage(dest, { react: { text: "❌", key: ms.key } }).catch(() => {});
        await zk.sendMessage(dest, {
            text: `❌ *IMESHINDWA*

┌─────────────────────
│  ⚠️ *Error:*
│  ${err}
│
└─────────────────────

> *View channel*`,
            mentions: [auteurMessage]
        }, { quoted: ms });
    }
});

// ═══════════════════════════════════════════════
//   🎬 .movie — Download Video
// ═══════════════════════════════════════════════
zokou({
    nomCom: "movie",
    categorie: "Downloader",
    reaction: "🎬",
    desc: "Download video from YouTube",
    fromMe: false
}, async (dest, zk, commandeOptions) => {
    const { ms, arg, auteurMessage } = commandeOptions;
    const query = (arg || []).join(" ").trim();

    if (!query) {
        return zk.sendMessage(dest, {
            text: `🎬 *${conf.BOT_NAME || "HEROKU-BT"} MOVIE*

┌─────────────────────
│  📖 *Usage:*
│  ▸ .movie <jina la video>
│  ▸ .movie <youtube link>
│
│  💡 *Mfano:*
│  ▸ .movie Believer Imagine Dragons
│
└─────────────────────

> *View channel*`,
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
                    title: `🎬 ${conf.BOT_NAME || "HEROKU-BT"} VIDEO`,
                    body: "Download any video 🎥",
                    mediaType: 1,
                    mediaUrl: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
                    sourceUrl: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
                    thumbnailUrl: "https://files.catbox.moe/zotx9t.jpg",
                    showAdAttribution: false,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: ms });
    }

    await zk.sendMessage(dest, { react: { text: "🎬", key: ms.key } }).catch(() => {});

    try {
        let videoUrl = query;
        if (!query.startsWith("http")) {
            const s = await axios.get(`${SEARCH_API}?q=${encodeURIComponent(query)}`, { timeout: 30000 });
            const hit = s.data?.result?.[0] || s.data?.[0];
            if (!hit) throw new Error("Video haijapatikana");
            videoUrl = hit.url || hit.link;
        }

        const r = await axios.get(`${MP4_API}?url=${encodeURIComponent(videoUrl)}`, { timeout: 90000 });
        const d = r.data;
        const videoLink = d?.result?.download_url || d?.download_url || d?.result?.url || d?.url;
        const title = d?.result?.title || d?.title || query;
        const cover = d?.result?.thumbnail || d?.thumbnail || "https://files.catbox.moe/zotx9t.jpg";

        if (!videoLink) throw new Error("Video haipatikani");

        await zk.sendMessage(dest, {
            video: { url: videoLink },
            mimetype: "video/mp4",
            fileName: `${title.replace(/[^\w\s.-]/g, "").slice(0, 50)}.mp4`,
            caption: `🎬 *${title}*\n\n⚡ ${conf.BOT_NAME || "HEROKU-BT"}`,
            contextInfo: {
                externalAdReply: {
                    title: `🎬 ${title}`,
                    body: conf.BOT_NAME || "HEROKU-BT",
                    mediaType: 1,
                    previewType: 0,
                    thumbnailUrl: cover,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: ms });

        await zk.sendMessage(dest, { react: { text: "✅", key: ms.key } }).catch(() => {});

    } catch (e) {
        const err = e?.response?.data?.error || e.message;
        await zk.sendMessage(dest, { react: { text: "❌", key: ms.key } }).catch(() => {});
        await zk.sendMessage(dest, {
            text: `❌ *IMESHINDWA*

┌─────────────────────
│  ⚠️ *Error:*
│  ${err}
│
└─────────────────────

> *View channel*`,
            mentions: [auteurMessage]
        }, { quoted: ms });
    }
});

// ═══════════════════════════════════════════════
//   📋 .dl — Downloader Menu
// ═══════════════════════════════════════════════
zokou({
    nomCom: "dl",
    categorie: "Downloader",
    reaction: "📋",
    desc: "Downloader help menu",
    fromMe: false
}, async (dest, zk, commandeOptions) => {
    const { ms, auteurMessage } = commandeOptions;

    const text = `📋 *${conf.BOT_NAME || "HEROKU-BT"} DOWNLOADER*

┌─────────────────────
│  🎧 *AUDIO*
│  ▸ .play <jina>
│
│  🎬 *VIDEO*
│  ▸ .movie <jina>
│
│  💡 *Mifano:*
│  ▸ .play Faded Alan Walker
│  ▸ .movie Believer Imagine Dragons
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
                title: `📋 ${conf.BOT_NAME || "HEROKU-BT"} DOWNLOADER`,
                body: "Download audio & video 🚀",
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
