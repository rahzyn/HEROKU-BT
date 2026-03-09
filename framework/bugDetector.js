const fs = require("fs");
const path = require("path");

const antibugPath = path.join(__dirname, "../bdd/antibug.json");

// Kusoma status ya antibug
function isAntibugOn() {
  try {
    if (fs.existsSync(antibugPath)) {
      const data = fs.readFileSync(antibugPath);
      const config = JSON.parse(data);
      return config.status === "on";
    }
  } catch (error) {
    console.error("Error reading antibug config:", error);
  }
  return false;
}

// Detect bugs kwenye message
function detectBug(message) {
  if (!message || typeof message !== 'string') return { isBug: false };
  
  const bugPatterns = [
    { pattern: /.{500,}/, type: "CHARACTER_OVERLOAD", desc: "Message too long (>500 chars)" },
    { pattern: /(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]){15,}/, type: "EMOJI_OVERLOAD", desc: "Too many emojis/special chars" },
    { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<[^>]+>/i, type: "HTML_INJECTION", desc: "HTML/Script tag detected" },
    { pattern: /@everyone|@here|@all/i, type: "MASS_MENTION", desc: "Mass mention attempt" },
    { pattern: /(.)\1{20,}/, type: "REPEATED_CHARS", desc: "Too many repeated characters" },
    { pattern: /(https?:\/\/[^\s]+){3,}/, type: "URL_SPAM", desc: "Multiple URLs detected" }
  ];
  
  for (let bug of bugPatterns) {
    if (bug.pattern.test(message)) {
      return {
        isBug: true,
        type: bug.type,
        description: bug.desc
      };
    }
  }
  
  return { isBug: false };
}

// Process incoming message
async function processIncomingMessage(zk, message, sender) {
  try {
    if (!isAntibugOn()) {
      return { blocked: false };
    }
    
    const messageText = message.message?.conversation || 
                        message.message?.extendedTextMessage?.text ||
                        message.message?.imageMessage?.caption ||
                        "";
    
    if (!messageText) return { blocked: false };
    
    const detection = detectBug(messageText);
    
    if (detection.isBug) {
      console.log(`🚨 BUG DETECTED: ${detection.type} from ${sender}`);
      
      // TRY TO DELETE MESSAGE (kama inawezekana)
      let deleted = false;
      try {
        // Kwanza jaribu kufuta kwenye group
        if (message.key.remoteJid.endsWith('@g.us')) {
          const deleteKey = {
            remoteJid: message.key.remoteJid,
            fromMe: false,
            id: message.key.id,
            participant: message.key.participant
          };
          
          await zk.sendMessage(message.key.remoteJid, { 
            delete: deleteKey 
          });
          console.log("✅ Message deleted successfully");
          deleted = true;
        } else {
          console.log("ℹ️ Cannot delete in private chat - WhatsApp limitation");
        }
      } catch (deleteError) {
        console.log("❌ Delete failed:", deleteError.message);
      }
      
      // 🔥 BLOCK THE USER - HII NDIYO MUHIMU ZAIDI!
      let blockSuccess = false;
      try {
        // Jaribu kublock kwa kutumia jid kamili
        await zk.updateBlockStatus(sender, 'block');
        console.log(`✅ User ${sender} blocked successfully`);
        blockSuccess = true;
      } catch (blockError) {
        console.log("❌ Block failed:", blockError.message);
        
        // Jaribu njia nyingine ya kublock
        try {
          // Tumia namba tu bila @s.whatsapp.net
          const numberOnly = sender.split('@')[0];
          await zk.updateBlockStatus(numberOnly + '@s.whatsapp.net', 'block');
          console.log(`✅ User ${numberOnly} blocked successfully (second attempt)`);
          blockSuccess = true;
        } catch (blockError2) {
          console.log("❌ Block failed again:", blockError2.message);
        }
      }
      
      // REMOVE FROM GROUP (kama ni group)
      let removeSuccess = false;
      if (message.key.remoteJid.endsWith('@g.us')) {
        try {
          await zk.groupParticipantsUpdate(
            message.key.remoteJid, 
            [sender], 
            "remove"
          );
          console.log(`✅ User removed from group`);
          removeSuccess = true;
        } catch (removeError) {
          console.log("❌ Remove from group failed:", removeError.message);
        }
      }
      
      // SEND NOTIFICATION
      let notification = `⚠️ *ANTIBUG SYSTEM - ACTION TAKEN*\n\n`;
      notification += `📛 *Reason:* ${detection.description}\n`;
      notification += `🔍 *Type:* ${detection.type}\n`;
      notification += `👤 *User:* @${sender.split('@')[0]}\n\n`;
      
      if (deleted) {
        notification += `✅ *Message deleted*\n`;
      } else {
        notification += `❌ *Could not delete* (WhatsApp limitation in private chat)\n`;
      }
      
      notification += `🔨 *User blocked* ${blockSuccess ? '✅' : '❌'}\n`;
      
      if (message.key.remoteJid.endsWith('@g.us')) {
        notification += `👋 *Removed from group* ${removeSuccess ? '✅' : '(bot needs admin)'}\n`;
      }
      
      // Send notification to the group/chat where bug occurred
      await zk.sendMessage(
        message.key.remoteJid,
        { 
          text: notification,
          mentions: [sender]
        }
      );
      
      // NOTIFY OWNER
      const ownerJid = require("../set").NUMERO_OWNER + "@s.whatsapp.net";
      if (ownerJid && ownerJid !== sender) {
        let ownerNotify = `🚨 *ANTIBUG ALERT - USER BLOCKED*\n\n`;
        ownerNotify += `📛 *Reason:* ${detection.description}\n`;
        ownerNotify += `🔍 *Type:* ${detection.type}\n`;
        ownerNotify += `👤 *User:* ${sender.split('@')[0]}\n`;
        ownerNotify += `📱 *Number:* ${sender}\n`;
        ownerNotify += `💬 *Chat:* ${message.key.remoteJid}\n\n`;
        ownerNotify += `✅ Block status: ${blockSuccess ? 'SUCCESS' : 'FAILED'}`;
        
        await zk.sendMessage(ownerJid, { text: ownerNotify });
      }
      
      return { 
        blocked: true, 
        reason: detection,
        deleted: deleted,
        userBlocked: blockSuccess 
      };
    }
    
    return { blocked: false };
    
  } catch (error) {
    console.error("Error in message handler:", error);
    return { blocked: false };
  }
}

module.exports = { processIncomingMessage };
