const { zokou } = require("../framework/zokou");
const conf = require("../set");
const fs = require("fs-extra");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

zokou({
    nomCom: "vv2",
    categorie: "General",
    reaction: "👁️👁️",
    desc: "Save view once media (sends to owner DM)",
    fromMe: true
}, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre, auteurMessage } = commandeOptions;

    if (!msgRepondu) {
        return repondre("❌ *Reply to a view once message!*");
    }

    try {
        // Unwrap the view-once wrapper if present
        let inner = msgRepondu;
        if (msgRepondu.viewOnceMessage?.message) {
            inner = msgRepondu.viewOnceMessage.message;
        } else if (msgRepondu.viewOnceMessageV2?.message) {
            inner = msgRepondu.viewOnceMessageV2.message;
        } else if (msgRepondu.viewOnceMessageV2Extension?.message) {
            inner = msgRepondu.viewOnceMessageV2Extension.message;
        }

        // Detect media type
        let type = '';
        let mediaMsg = null;

        if (inner.imageMessage) {
            type = 'image';
            mediaMsg = inner.imageMessage;
        } else if (inner.videoMessage) {
            type = 'video';
            mediaMsg = inner.videoMessage;
        } else if (inner.audioMessage) {
            type = 'audio';
            mediaMsg = inner.audioMessage;
        } else {
            return repondre("❌ *Not a view once media or unsupported type!*");
        }

        await repondre(`⏳ *Downloading ${type}...*`);

        // Download the media
        const stream = await downloadContentFromMessage(mediaMsg, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const tmpPath = `./tmp_vv_${Date.now()}`;
        await fs.writeFile(tmpPath, buffer);

        if (!fs.existsSync(tmpPath)) {
            return repondre("❌ *Download failed!*");
        }

        const stats = fs.statSync(tmpPath);
        const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

        // Sender info
        const ownerJid = conf.NUMERO_OWNER + "@s.whatsapp.net";
        const contextInfo = ms.message?.extendedTextMessage?.contextInfo;
        const senderJid = contextInfo?.participant || auteurMessage || "";
        const sender = senderJid ? senderJid.split('@')[0] : "Unknown";
        const caption = `👁️ *VIEW ONCE ${type.toUpperCase()}*\n👤 *From:* @${sender}\n💾 *Size:* ${fileSizeMB} MB`;

        // Send to owner
        if (type === 'image') {
            await zk.sendMessage(ownerJid, {
                image: buffer,
                caption,
                mentions: [senderJid]
            });
        } else if (type === 'video') {
            await zk.sendMessage(ownerJid, {
                video: buffer,
                caption,
                mimetype: mediaMsg.mimetype || 'video/mp4',
                mentions: [senderJid]
            });
        } else if (type === 'audio') {
            await zk.sendMessage(ownerJid, {
                audio: buffer,
                mimetype: mediaMsg.mimetype || 'audio/mpeg',
                ptt: false
            });
            await zk.sendMessage(ownerJid, {
                text: caption,
                mentions: [senderJid]
            });
        }

        // Clean up temporary file
        try { await fs.unlink(tmpPath); } catch (_) {}

        await repondre(`✅ *View once ${type} sent to owner DM!*\n💾 *Size:* ${fileSizeMB} MB`);

    } catch (error) {
        console.error("❌ VV Error:", error);
        await repondre(`❌ *Error:* ${error.message}`);
    }
});
