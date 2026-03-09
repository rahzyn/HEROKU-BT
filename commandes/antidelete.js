const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const path = require("path");

// Configuration file
const antideletePath = path.join(__dirname, "../bdd/antidelete.json");

// Ensure bdd folder exists
if (!fs.existsSync(path.join(__dirname, "../bdd"))) {
  fs.mkdirSync(path.join(__dirname, "../bdd"));
}

// Create config if not exists
if (!fs.existsSync(antideletePath)) {
  fs.writeFileSync(antideletePath, JSON.stringify({ status: "off" }, null, 2));
}

// Check if anti-delete is on
function isAntiDeleteOn() {
  try {
    const data = fs.readFileSync(antideletePath);
    const config = JSON.parse(data);
    return config.status === "on";
  } catch {
    return false;
  }
}

// Main command
zokou({
  nomCom: "antidelete",
  categorie: "General",
  reaction: "🔄",
  desc: "Enable or disable anti-delete",
  fromMe: true
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg } = commandeOptions;

  if (!arg[0] || !["on", "off"].includes(arg[0].toLowerCase())) {
    return repondre("*❗ Usage:* .antidelete on | .antidelete off\n\n_Powered by Rahmany_");
  }

  const status = arg[0].toLowerCase();
  
  try {
    fs.writeFileSync(antideletePath, JSON.stringify({ status }, null, 2));
    await repondre(
      status === "on"
        ? "✅ *ANTI-DELETE ENABLED*\n\nAll deleted messages will be forwarded to your DM.\n\n_Powered by Rahmany_"
        : "⚠️ *ANTI-DELETE DISABLED*\n\n_Powered by Rahmany_"
    );
  } catch (e) {
    await repondre("❌ Failed to update configuration.");
  }
});

// Function to download media
async function downloadMedia(zk, message, type) {
  try {
    const stream = await zk.downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  } catch (error) {
    console.log(`Error downloading ${type}:`, error.message);
    return null;
  }
}

// Main handler
module.exports = {
  isAntiDeleteOn,
  
  async handleDeletedMessage(zk, message, ownerJid) {
    try {
      // Check if anti-delete is on
      if (!isAntiDeleteOn()) return;
      
      // Check if this is a deleted message
      if (!message.message?.protocolMessage || message.message.protocolMessage.type !== 0) {
        return;
      }
      
      // Skip bot's own messages
      if (message.key.fromMe) return;
      
      console.log("🗑️ DELETED MESSAGE DETECTED!");
      console.log("Message ID:", message.message.protocolMessage.key.id);
      
      // Get deleted message info
      const deletedKey = message.message.protocolMessage.key;
      const chatJid = deletedKey.remoteJid;
      const messageId = deletedKey.id;
      const isGroup = chatJid.endsWith('@g.us');
      
      // Get sender
      let sender = deletedKey.participant || message.key.participant || chatJid;
      let senderNumber = sender.split('@')[0];
      
      // Get chat name
      let chatName = isGroup ? "Unknown Group" : "Private Chat";
      if (isGroup) {
        try {
          const groupMetadata = await zk.groupMetadata(chatJid);
          chatName = groupMetadata.subject || "Unknown Group";
        } catch (e) {}
      }
      
      // ============= TRY TO GET DELETED MESSAGE FROM STORE =============
      let deletedMessage = null;
      let messageContent = null;
      let messageType = "unknown";
      let mediaBuffer = null;
      
      try {
        // Read store.json
        const storePath = './store.json';
        if (fs.existsSync(storePath)) {
          console.log("Reading store.json...");
          const storeData = fs.readFileSync(storePath, 'utf8');
          const jsonData = JSON.parse(storeData);
          
          // Try different paths to find messages
          if (jsonData.messages && jsonData.messages[chatJid]) {
            console.log(`Found messages for chat: ${chatJid}`);
            
            // Find message by ID
            deletedMessage = jsonData.messages[chatJid].find(msg => msg.key.id === messageId);
            
            if (deletedMessage) {
              console.log("✅ Deleted message found in store!");
              
              const msg = deletedMessage.message;
              
              // Determine message type and extract content
              if (msg.conversation) {
                messageType = "text";
                messageContent = msg.conversation;
                console.log("Type: Text");
              }
              else if (msg.extendedTextMessage?.text) {
                messageType = "text";
                messageContent = msg.extendedTextMessage.text;
                console.log("Type: Extended Text");
              }
              else if (msg.imageMessage) {
                messageType = "image";
                messageContent = msg.imageMessage.caption || "";
                console.log("Type: Image");
                mediaBuffer = await downloadMedia(zk, msg.imageMessage, 'image');
              }
              else if (msg.videoMessage) {
                messageType = "video";
                messageContent = msg.videoMessage.caption || "";
                console.log("Type: Video");
                mediaBuffer = await downloadMedia(zk, msg.videoMessage, 'video');
              }
              else if (msg.stickerMessage) {
                messageType = "sticker";
                console.log("Type: Sticker");
                mediaBuffer = await downloadMedia(zk, msg.stickerMessage, 'sticker');
              }
              else if (msg.audioMessage) {
                messageType = "audio";
                console.log("Type: Audio");
                mediaBuffer = await downloadMedia(zk, msg.audioMessage, 'audio');
              }
              else {
                console.log("Unknown message type:", Object.keys(msg));
              }
            } else {
              console.log("❌ Message ID not found in store!");
            }
          } else {
            console.log("❌ No messages found for this chat in store!");
          }
        } else {
          console.log("❌ store.json not found!");
        }
      } catch (storeError) {
        console.log("Error accessing store:", storeError.message);
      }
      
      // ============= SEND TO OWNER =============
      
      // First, send notification (always)
      let notification = `🗑️ *DELETED MESSAGE*\n\n`;
      notification += `👤 *Sender:* ${senderNumber}\n`;
      notification += `💬 *Chat:* ${chatName}\n`;
      notification += `🕐 *Time:* ${new Date().toLocaleString()}\n`;
      notification += `📌 *Type:* ${messageType.toUpperCase()}\n`;
      notification += `\n_Powered by Rahmany_`;
      
      await zk.sendMessage(ownerJid, { text: notification });
      console.log("✅ Notification sent to owner");
      
      // Then send the actual content if available
      if (mediaBuffer) {
        // Send media
        if (messageType === 'image') {
          await zk.sendMessage(ownerJid, {
            image: mediaBuffer,
            caption: messageContent || "Deleted image"
          });
          console.log("✅ Image sent to owner");
        }
        else if (messageType === 'video') {
          await zk.sendMessage(ownerJid, {
            video: mediaBuffer,
            caption: messageContent || "Deleted video"
          });
          console.log("✅ Video sent to owner");
        }
        else if (messageType === 'sticker') {
          await zk.sendMessage(ownerJid, {
            sticker: mediaBuffer
          });
          console.log("✅ Sticker sent to owner");
        }
        else if (messageType === 'audio') {
          await zk.sendMessage(ownerJid, {
            audio: mediaBuffer,
            mimetype: 'audio/mp4'
          });
          console.log("✅ Audio sent to owner");
        }
      }
      else if (messageContent) {
        // Send text content
        await zk.sendMessage(ownerJid, {
          text: `📝 *Deleted Text:*\n\n${messageContent}`
        });
        console.log("✅ Text sent to owner");
      }
      else {
        // No content found
        await zk.sendMessage(ownerJid, {
          text: "❌ Could not retrieve deleted message content."
        });
        console.log("❌ No content retrieved");
      }
      
    } catch (error) {
      console.error("Anti-delete error:", error);
    }
  }
};
