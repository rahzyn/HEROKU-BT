const { zokou } = require("../framework/zokou");
const conf = require("../set");

zokou({
    nomCom: "jid",
    categorie: "General",
    reaction: "🆔",
    desc: "Get JID of group, channel or user",
    fromMe: false
}, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre, auteurMessage } = commandeOptions;

    let jid = auteurMessage;
    let type = "👤 USER";

    if (msgRepondu) {
        jid = msgRepondu.key?.participant || msgRepondu.sender || auteurMessage;
    } else if (dest.endsWith("@g.us")) {
        jid = dest;
        type = "👥 GROUP";
    } else if (dest.endsWith("@newsletter")) {
        jid = dest;
        type = "📢 CHANNEL";
    }

    const text = `🆔 *${conf.BOT_NAME || "HEROKU-BT"} JID*

┌─────────────────────
│  🏷️ *Type:* ${type}
│
│  🆔 *JID:*
│  \`${jid}\`
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
                title: `🆔 ${conf.BOT_NAME || "HEROKU-BT"} JID FINDER`,
                body: "Get any JID easily",
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
