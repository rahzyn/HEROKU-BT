const { zokou } = require("../framework/zokou");
const { getContentType } = require("@whiskeysockets/baileys");
const fs = require('fs-extra');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

zokou({ nomCom: "vv", aliases: ["send", "keep", "dm"], categorie: "General" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, auteurMessage, ms } = commandeOptions;

  if (!msgRepondu) {
    return repondre("*❌ Please reply to or mention a message you want to save*");
  }

  try {
    // Send processing message
    await repondre("*⏳ Processing media... Sending to your DM*");

    let msg;
    let mediaPath = null;

    // Check for different message types and handle accordingly
    if (msgRepondu.imageMessage) {
      mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
      msg = { 
        image: { url: mediaPath }, 
        caption: msgRepondu.imageMessage.caption || "📸 *Image saved from view-once*" 
      };
    } 
    else if (msgRepondu.videoMessage) {
      mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
      msg = { 
        video: { url: mediaPath }, 
        caption: msgRepondu.videoMessage.caption || "🎥 *Video saved from view-once*" 
      };
    } 
    else if (msgRepondu.audioMessage) {
      mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      msg = { 
        audio: { url: mediaPath }, 
        mimetype: 'audio/mp4',
        ptt: msgRepondu.audioMessage.ptt || false // Voice note if it was voice note
      };
    } 
    else if (msgRepondu.stickerMessage) {
      mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.stickerMessage);
      const stickerMess = new Sticker(mediaPath, {
        pack: '𝐊𝐈𝐍𝐆𝐒-𝐌𝐃',
        author: 'Bot',
        type: StickerTypes.CROPPED,
        categories: ["🤩", "🎉"],
        id: "12345",
        quality: 70,
        background: "transparent",
      });
      const stickerBuffer2 = await stickerMess.toBuffer();
      msg = { sticker: stickerBuffer2 };
    } 
    else if (msgRepondu.documentMessage) {
      mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.documentMessage);
      msg = { 
        document: { url: mediaPath },
        fileName: msgRepondu.documentMessage.fileName || 'document',
        mimetype: msgRepondu.documentMessage.mimetype || 'application/octet-stream',
        caption: "📄 *Document saved*"
      };
    }
    else {
      // Text message
      msg = { text: msgRepondu.conversation || msgRepondu.extendedTextMessage?.text || "Message saved" };
    }

    // Send to user's DM (private chat)
    const userDM = auteurMessage; // The user who sent the command
    
    if (msg) {
      await zk.sendMessage(userDM, msg);
      
      // Clean up downloaded file if it exists
      if (mediaPath && fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
      
      // Confirm in the group/channel that it was sent to DM
      await repondre("*✅ Media has been sent to your DM! Check your private messages*");
    }

  } catch (error) {
    console.error("Error processing the message:", error);
    await repondre('*❌ An error occurred while processing your request:*\n' + error.message);
    
    // Clean up if file exists even after error
    if (mediaPath && fs.existsSync(mediaPath)) {
      fs.unlinkSync(mediaPath);
    }
  }
});
