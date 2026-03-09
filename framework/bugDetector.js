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
    { pattern: /(https?:\/\/[^\s]+){3,}/, type: "URL_SPAM", desc: "Multiple URLs detected" },
    { pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, type: "PHONE_NUMBER", desc: "Phone number detected" }
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
      
      // 🔥 TRY TO DELETE MESSAGE (kwanza kabisa)
      try {
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
      } catch (deleteError) {
        console.log("❌ Delete failed:", deleteError.message);
      }
      
      // 🔥 CHECK IF IT'S A GROUP
      const isGroup = message.key.remoteJid.endsWith('@g.us');
      
      // 🔥 BLOCK THE USER (hii inafanya kazi kwa DM na Group)
      let blockSuccess = false;
      try {
        // Block the user
        await zk.updateBlockStatus(sender, 'block');
        console.log(`✅ User ${sender} blocked successfully`);
        blockSuccess = true;
      } catch (blockError) {
        console.log("❌ Block failed:", blockError.message);
      }
      
      // 🔥 REMOVE FROM GROUP (kama ni group na bot iko admin)
      let removeSuccess = false;
      if (isGroup && blockSuccess) {
        try {
          await zk.groupParticipantsUpdate(
            message.key.remoteJid, 
            [sender], 
            "remove"
          );
          console.log(`✅ User removed from group`);
          removeSuccess = true;
        } catch (removeError) {
          console.log("❌ Remove from group failed (bot might not be admin):", removeError.message);
        }
      }
      
      // 🔥 SEND NOTIFICATION (kwa group au DM)
      let notification = `⚠️ *ANTIBUG SYSTEM - ACTION TAKEN*\n\n`;
      notification += `📛 *Reason:* ${detection.description}\n`;
      notification += `🔍 *Type:* ${detection.type}\n`;
      notification += `👤 *User:* @${sender.split('@')[0]}\n\n`;
      notification += `✅ *Message deleted*\n`;
      notification += `🔨 *User blocked* ${blockSuccess ? '✅' : '❌'}\n`;
      
      if (isGroup) {
        notification += `👋 *Removed from group* ${removeSuccess ? '✅' : '(bot needs admin)'}\n`;
      }
      
      notification += `\n_This is automatic protection - user cannot message bot again_`;
      
      // Send notification to the group/chat where bug occurred
      await zk.sendMessage(
        message.key.remoteJid,
        { 
          text: notification,
          mentions: [sender]
        }
      );
      
      // 🔥 ALSO NOTIFY OWNER (kwa DM)
      const ownerJid = conf.NUMERO_OWNER + "@s.whatsapp.net";
      if (ownerJid && ownerJid !== sender) {
        let ownerNotify = `🚨 *ANTIBUG ALERT - USER BLOCKED*\n\n`;
        ownerNotify += `📛 *Reason:* ${detection.description}\n`;
        ownerNotify += `🔍 *Type:* ${detection.type}\n`;
        ownerNotify += `👤 *User:* ${sender.split('@')[0]}\n`;
        ownerNotify += `📱 *Number:* ${sender}\n`;
        ownerNotify += `💬 *Chat:* ${message.key.remoteJid}\n\n`;
        ownerNotify += `✅ User has been blocked automatically.`;
        
        await zk.sendMessage(ownerJid, { text: ownerNotify });
      }
      
      return { 
        blocked: true, 
        reason: detection,
        deleted: true,
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
