const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const path = require("path");

// Configuration file for anti-delete
const antideletePath = path.join(__dirname, "../bdd/antidelete.json");

// Ensure bdd folder exists
if (!fs.existsSync(path.join(__dirname, "../bdd"))) {
  fs.mkdirSync(path.join(__dirname, "../bdd"));
}

// Create antidelete.json if it doesn't exist
if (!fs.existsSync(antideletePath)) {
  fs.writeFileSync(antideletePath, JSON.stringify({ status: "off" }, null, 2));
}

// Function to read anti-delete status
function isAntiDeleteOn() {
  try {
    const data = fs.readFileSync(antideletePath);
    const config = JSON.parse(data);
    return config.status === "on";
  } catch {
    return false;
  }
}

// Main command to toggle anti-delete
zokou({
  nomCom: "antidelete",
  categorie: "General",
  reaction: "🔄",
  desc: "Enable or disable anti-delete feature (forward deleted messages to owner)",
  fromMe: true
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg } = commandeOptions;

  if (!arg[0] || !["on", "off"].includes(arg[0].toLowerCase())) {
    return repondre("*❗ Correct usage:* .antidelete on | .antidelete off\n\n_Powered by Rahmany_");
  }

  const status = arg[0].toLowerCase();
  const newConfig = { status };

  try {
    fs.writeFileSync(antideletePath, JSON.stringify(newConfig, null, 2));
    await repondre(
      status === "on"
        ? `✅ *ANTI-DELETE ENABLED*\n\nAll deleted messages (text, images, videos, stickers) will be forwarded to your DM.\n\n_Powered by Rahmany_`
        : `⚠️ *ANTI-DELETE DISABLED*\n\nDeleted messages will not be forwarded.\n\n_Powered by Rahmany_`
    );
  } catch (e) {
    await repondre("❌ Failed to update anti-delete configuration.");
    console.error("Anti-delete write error:", e);
  }
});

// Export the anti-delete handler for main.js
module.exports = {
  isAntiDeleteOn,
  
  // Function to handle deleted messages
  async handleDeletedMessage(zk, message, ownerJid) {
    try {
      if (!isAntiDeleteOn()) return;
      
      // Check if this is a deleted message (protocol message type 0)
      if (message.message?.protocolMessage && message.message.protocolMessage.type === 0) {
        
        // Skip if message is from bot itself
        if (message.key.fromMe) {
          console.log("ℹ️ Bot's own message deleted - ignoring");
          return;
        }
        
        console.log("🗑️ Deleted message detected!");
        
        // Get deleted message key
        const deletedKey = message.message.protocolMessage.key;
        const chatJid = deletedKey.remoteJid;
        const messageId = deletedKey.id;
        const isGroup = chatJid.endsWith('@g.us');
        
        // Get sender info
        let sender = deletedKey.participant || message.key.participant || chatJid;
        let senderNumber = sender.split('@')[0];
        
        // Get chat name
        let chatName = isGroup ? "Unknown Group" : "Private Chat";
        if (isGroup) {
          try {
            const groupMetadata = await zk.groupMetadata(chatJid);
            chatName = groupMetadata.subject || "Unknown Group";
          } catch (e) {
            console.log("Could not fetch group name:", e.message);
          }
        }
        
        // Try to get the deleted message from store
        let deletedMessage = null;
        let messageType = "unknown";
        let messageContent = "";
        let mediaBuffer = null;
        
        try {
          // Try to load from store.json
          const storePath = './store.json';
          if (fs.existsSync(storePath)) {
            const storeData = fs.readFileSync(storePath, 'utf8');
            const jsonData = JSON.parse(storeData);
            
            if (jsonData.messages && jsonData.messages[chatJid]) {
              const messages = jsonData.messages[chatJid];
              deletedMessage = messages.find(msg => msg.key.id === messageId);
            }
          }
        } catch (storeError) {
          console.log("Error reading store:", storeError.message);
        }
        
        // If found in store, extract content
        if (deletedMessage && deletedMessage.message) {
          const msg = deletedMessage.message;
          
          if (msg.conversation) {
            messageType = "text";
            messageContent = msg.conversation;
          } 
          else if (msg.extendedTextMessage?.text) {
            messageType = "text";
            messageContent = msg.extendedTextMessage.text;
          }
          else if (msg.imageMessage) {
            messageType = "image";
            messageContent = msg.imageMessage.caption || "";
            
            // Try to download image
            try {
              const stream = await zk.downloadContentFromMessage(msg.imageMessage, 'image');
              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }
              mediaBuffer = buffer;
            } catch (e) {
              console.log("Could not download image:", e.message);
            }
          }
          else if (msg.videoMessage) {
            messageType = "video";
            messageContent = msg.videoMessage.caption || "";
            
            // Try to download video
            try {
              const stream = await zk.downloadContentFromMessage(msg.videoMessage, 'video');
              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }
              mediaBuffer = buffer;
            } catch (e) {
              console.log("Could not download video:", e.message);
            }
          }
          else if (msg.stickerMessage) {
            messageType = "sticker";
            
            // Try to download sticker
            try {
              const stream = await zk.downloadContentFromMessage(msg.stickerMessage, 'sticker');
              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }
              mediaBuffer = buffer;
            } catch (e) {
              console.log("Could not download sticker:", e.message);
            }
          }
          else if (msg.audioMessage) {
            messageType = "audio";
          }
          else if (msg.documentMessage) {
            messageType = "document";
            messageContent = msg.documentMessage.fileName || "";
          }
        }
        
        // Prepare caption for owner
        let caption = `🗑️ *DELETED MESSAGE DETECTED*\n\n`;
        caption += `👤 *Sender:* ${senderNumber}\n`;
        caption += `💬 *Chat:* ${chatName} (${chatJid})\n`;
        caption += `📌 *Type:* ${messageType.toUpperCase()}\n`;
        caption += `🕐 *Time:* ${new Date().toLocaleString()}\n\n`;
        
        if (messageContent) {
          caption += `📝 *Content:*\n${messageContent}\n\n`;
        }
        
        caption += `_Powered by Rahmany_`;
        
        // Send to owner
        if (ownerJid) {
          if (mediaBuffer && (messageType === 'image' || messageType === 'video' || messageType === 'sticker')) {
            // Send with media
            let mediaMessage = {};
            
            if (messageType === 'image') {
              mediaMessage = { 
                image: mediaBuffer,
                caption: caption
              };
            } else if (messageType === 'video') {
              mediaMessage = { 
                video: mediaBuffer,
                caption: caption
              };
            } else if (messageType === 'sticker') {
              mediaMessage = { 
                sticker: mediaBuffer
              };
              // Send caption separately
              await zk.sendMessage(ownerJid, { text: caption });
            }
            
            if (Object.keys(mediaMessage).length > 0) {
              await zk.sendMessage(ownerJid, mediaMessage);
            }
          } else {
            // Send as text
            await zk.sendMessage(ownerJid, { text: caption });
          }
          
          console.log(`✅ Deleted ${messageType} forwarded to owner`);
        }
      }
    } catch (error) {
      console.error("Error in anti-delete handler:", error);
    }
  }
};
