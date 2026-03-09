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
      
      // SIMPLE NOTIFICATION - TUMA TEXT KWANZA
      let notification = `🗑️ *DELETED MESSAGE*\n\n`;
      notification += `👤 *Sender:* ${senderNumber}\n`;
      notification += `💬 *Chat:* ${chatName}\n`;
      notification += `🕐 *Time:* ${new Date().toLocaleString()}\n`;
      notification += `\n_Powered by Rahmany_`;
      
      await zk.sendMessage(ownerJid, { text: notification });
      console.log("✅ Notification sent to owner");
      
      // TRY TO GET THE DELETED MESSAGE FROM STORE
      try {
        const storePath = './store.json';
        if (!fs.existsSync(storePath)) return;
        
        const storeData = fs.readFileSync(storePath, 'utf8');
        const jsonData = JSON.parse(storeData);
        
        if (!jsonData.messages || !jsonData.messages[chatJid]) return;
        
        // Find the deleted message
        const deletedMessage = jsonData.messages[chatJid].find(msg => msg.key.id === messageId);
        
        if (!deletedMessage || !deletedMessage.message) return;
        
        const msg = deletedMessage.message;
        
        // Check message type and forward
        if (msg.conversation) {
          // TEXT MESSAGE
          await zk.sendMessage(ownerJid, { 
            text: `📝 *Deleted Text:*\n\n${msg.conversation}` 
          });
          console.log("✅ Deleted text forwarded");
        }
        else if (msg.extendedTextMessage?.text) {
          await zk.sendMessage(ownerJid, { 
            text: `📝 *Deleted Text:*\n\n${msg.extendedTextMessage.text}` 
          });
          console.log("✅ Deleted text forwarded");
        }
        else if (msg.imageMessage) {
          // IMAGE
          try {
            const stream = await zk.downloadContentFromMessage(msg.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk]);
            }
            
            await zk.sendMessage(ownerJid, {
              image: buffer,
              caption: `🖼️ *Deleted Image*\nCaption: ${msg.imageMessage.caption || ''}`
            });
            console.log("✅ Deleted image forwarded");
          } catch (e) {
            console.log("Failed to download image:", e.message);
          }
        }
        else if (msg.videoMessage) {
          // VIDEO
          try {
            const stream = await zk.downloadContentFromMessage(msg.videoMessage, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk]);
            }
            
            await zk.sendMessage(ownerJid, {
              video: buffer,
              caption: `🎥 *Deleted Video*\nCaption: ${msg.videoMessage.caption || ''}`
            });
            console.log("✅ Deleted video forwarded");
          } catch (e) {
            console.log("Failed to download video:", e.message);
          }
        }
        else if (msg.stickerMessage) {
          // STICKER
          try {
            const stream = await zk.downloadContentFromMessage(msg.stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk]);
            }
            
            await zk.sendMessage(ownerJid, {
              sticker: buffer
            });
            console.log("✅ Deleted sticker forwarded");
          } catch (e) {
            console.log("Failed to download sticker:", e.message);
          }
        }
        else if (msg.audioMessage) {
          // AUDIO
          try {
            const stream = await zk.downloadContentFromMessage(msg.audioMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk]);
            }
            
            await zk.sendMessage(ownerJid, {
              audio: buffer,
              mimetype: 'audio/mp4'
            });
            console.log("✅ Deleted audio forwarded");
          } catch (e) {
            console.log("Failed to download audio:", e.message);
          }
        }
        
      } catch (storeError) {
        console.log("Error accessing store:", storeError.message);
      }
      
    } catch (error) {
      console.error("Anti-delete error:", error);
    }
  }
};
