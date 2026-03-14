const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const { Catbox } = require('node-catbox');

const catbox = new Catbox();

async function uploadToCatbox(filePath) {
    if (!fs.existsSync(filePath)) throw new Error("File not found");
    const url = await catbox.uploadFile({ path: filePath });
    return url;
}

zokou({ 
    nomCom: "url", 
    categorie: "General", 
    reaction: "🔗", 
    desc: "Upload media to Catbox" 
}, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre, ms } = commandeOptions;

    if (!msgRepondu) {
        return repondre("❌ *Reply to an image, video, or audio!*");
    }

    try {
        // Determine media type
        const mediaType = 
            msgRepondu.imageMessage ? 'image' :
            msgRepondu.videoMessage ? 'video' :
            msgRepondu.audioMessage ? 'audio' :
            msgRepondu.stickerMessage ? 'sticker' : null;

        if (!mediaType) {
            return repondre("❌ *Unsupported media type!*");
        }

        // Get media message
        const mediaMsg = 
            msgRepondu.imageMessage ||
            msgRepondu.videoMessage ||
            msgRepondu.audioMessage ||
            msgRepondu.stickerMessage;

        // Download media
        await repondre(`⏳ *Downloading ${mediaType}...*`);
        const mediaPath = await zk.downloadAndSaveMediaMessage(mediaMsg);

        // Upload to Catbox
        await repondre(`⏳ *Uploading to catbox...*`);
        const url = await uploadToCatbox(mediaPath);

        // Clean up
        fs.unlinkSync(mediaPath);

        // Send response
        const response = `╭━━━ *『 HEROKU-BT URL 』* ━━━╮
┃
┃ 📁 *Type:* ${mediaType.toUpperCase()}
┃ 🔗 *URL:* ${url}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
_Powered by RAHMANI MD_`;

        await repondre(response);

    } catch (error) {
        console.error("❌ Error:", error);
        await repondre(`❌ *Error:* ${error.message}`);
    }
});
