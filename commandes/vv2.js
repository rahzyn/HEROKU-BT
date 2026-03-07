const { zokou } = require("../framework/zokou");
const { getContentType } = require("@whiskeysockets/baileys");
const fs = require('fs');

zokou({ 
  nomCom: "vv1", 
  aliases: ["viewonce", "keep", "view"], 
  categorie: "General", 
  reaction: "💚" 
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu, repondre, auteurMessage } = commandeOptions;

  if (!msgRepondu) {
    return repondre("*❌ Mention or reply to a view-once message*");
  }

  try {
    // Check for view once message
    let viewOnceMsg = null;
    let mediaType = null;
    let mediaData = null;

    // Handle different view once message structures
    if (msgRepondu.viewOnceMessageV2) {
      viewOnceMsg = msgRepondu.viewOnceMessageV2.message;
    } else if (msgRepondu.viewOnceMessage) {
      viewOnceMsg = msgRepondu.viewOnceMessage.message;
    } else if (msgRepondu.viewOnceMessageV2Extension) {
      viewOnceMsg = msgRepondu.viewOnceMessageV2Extension.message;
    }

    if (!viewOnceMsg) {
      return repondre("*❌ This is not a view-once message*");
    }

    // Check for image message
    if (viewOnceMsg.imageMessage) {
      mediaType = 'image';
      mediaData = viewOnceMsg.imageMessage;
    }
    // Check for video message
    else if (viewOnceMsg.videoMessage) {
      mediaType = 'video';
      mediaData = viewOnceMsg.videoMessage;
    }
    // Check for audio message
    else if (viewOnceMsg.audioMessage) {
      mediaType = 'audio';
      mediaData = viewOnceMsg.audioMessage;
    }
    // Check for document
    else if (viewOnceMsg.documentMessage) {
      mediaType = 'document';
      mediaData = viewOnceMsg.documentMessage;
    }
    else {
      return repondre("*❌ Unsupported media type in view-once message*");
    }

    // Download the media
    await repondre("*⏳ Processing view-once message... Sending to your DM*");

    // Download media
    const mediaPath = await zk.downloadAndSaveMediaMessage(mediaData);
    
    // Get caption if available
    const caption = mediaData.caption || '';

    // Send to user's DM (private chat)
    const userDM = auteurMessage; // The user who sent the command

    // Send the media based on type to user's DM
    if (mediaType === 'image') {
      await zk.sendMessage(userDM, {
        image: { url: mediaPath },
        caption: `*📸 View-Once Image Saved*\n\n${caption}`
      });
    } 
    else if (mediaType === 'video') {
      await zk.sendMessage(userDM, {
        video: { url: mediaPath },
        caption: `*🎥 View-Once Video Saved*\n\n${caption}`
      });
    }
    else if (mediaType === 'audio') {
      await zk.sendMessage(userDM, {
        audio: { url: mediaPath },
        mimetype: 'audio/mp4',
        ptt: false // Change to true for voice note
      });
    }
    else if (mediaType === 'document') {
      await zk.sendMessage(userDM, {
        document: { url: mediaPath },
        fileName: mediaData.fileName || 'document',
        mimetype: mediaData.mimetype || 'application/octet-stream',
        caption: `*📄 View-Once Document Saved*\n\n${caption}`
      });
    }

    // Clean up downloaded file
    if (fs.existsSync(mediaPath)) {
      fs.unlinkSync(mediaPath);
    }

    // Confirm in the group/channel that it was sent to DM
    await repondre("*✅ View-once message has been sent to your DM! Check your private messages with the bot*");

  } catch (error) {
    console.error("Error processing view-once message:", error);
    await repondre("*❌ Error processing view-once message*\n" + error.message);
  }
});
