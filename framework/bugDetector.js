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
    { pattern: /.{300,}/, type: "CHARACTER_OVERLOAD", desc: "Message too long (>300 chars)" },
    { pattern: /(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]){10,}/, type: "EMOJI_OVERLOAD", desc: "Too many emojis/special chars" },
    { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<[^>]+>/i, type: "HTML_INJECTION", desc: "HTML/Script tag detected" },
    { pattern: /@everyone|@here|@all/i, type: "MASS_MENTION", desc: "Mass mention attempt" },
    { pattern: /(.)\1{15,}/, type: "REPEATED_CHARS", desc: "Too many repeated characters" },
    { pattern: /(https?:\/\/[^\s]+){3,}/, type: "URL_SPAM", desc: "Multiple URLs detected" },
    { pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, type: "EMAIL", desc: "Email address detected" }
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
      
      // ============ BLOCK USER (KWA DM NA GROUP) ============
      let blockSuccess = false;
      
      try {
        // NJIA 1: updateBlockStatus
        await zk.updateBlockStatus(sender, 'block');
        console.log(`✅ User BLOCKED successfully (Method 1): ${sender}`);
        blockSuccess = true;
      } catch (error1) {
        console.log("❌ Block Method 1 failed:", error1.message);
        
        try {
          // NJIA 2: blockUser (njia mbadala)
          if (zk.blockUser) {
            await zk.blockUser(sender, 'block');
            console.log(`✅ User BLOCKED successfully (Method 2): ${sender}`);
            blockSuccess = true;
          }
        } catch (error2) {
          console.log("❌ Block Method 2 failed:", error2.message);
          
          try {
            // NJIA 3: Kwa kutumia namba tu
            const numberOnly = sender.split('@')[0];
            await zk.updateBlockStatus(numberOnly + '@s.whatsapp.net', 'block');
            console.log(`✅ User BLOCKED successfully (Method 3): ${numberOnly}`);
            blockSuccess = true;
          } catch (error3) {
            console.log("❌ All block methods failed:", error3.message);
          }
        }
      }
      
      // ============ DELETE MESSAGE (KWA GROUP TU) ============
      let deleted = false;
      if (message.key.remoteJid.endsWith('@g.us')) {
        try {
          const deleteKey = {
            remoteJid: message.key.remoteJid,
            fromMe: false,
            id: message.key.id,
            participant: message.key.participant
          };
          
          await zk.sendMessage(message.key.remoteJid, { delete: deleteKey });
          console.log("✅ Message deleted from group");
          deleted = true;
        } catch (deleteError) {
          console.log("❌ Delete failed:", deleteError.message);
        }
      } else {
        console.log("ℹ️ Cannot delete in private chat - WhatsApp limitation");
      }
      
      // ============ REMOVE FROM GROUP (KAMA NI GROUP) ============
      let removed = false;
      if (message.key.remoteJid.endsWith('@g.us')) {
        try {
          await zk.groupParticipantsUpdate(
            message.key.remoteJid, 
            [sender], 
            "remove"
          );
          console.log("✅ User removed from group");
          removed = true;
        } catch (removeError) {
          console.log("❌ Remove from group failed:", removeError.message);
        }
      }
      
      // ============ SEND NOTIFICATION KWA GROUP/DM ============
      let notification = `⚠️ *ANTIBUG SYSTEM - ACTION TAKEN*\n\n`;
      notification += `📛 *Reason:* ${detection.description}\n`;
      notification += `🔍 *Type:* ${detection.type}\n`;
      notification += `👤 *User:* @${sender.split('@')[0]}\n\n`;
      notification += `🔨 *Blocked:* ${blockSuccess ? '✅ YES' : '❌ NO'}\n`;
      
      if (message.key.remoteJid.endsWith('@g.us')) {
        notification += `🗑️ *Deleted:* ${deleted ? '✅ YES' : '❌ NO'}\n`;
        notification += `👋 *Removed:* ${removed ? '✅ YES' : '❌ NO'}\n`;
      }
      
      notification += `\n_Powered by Rahmany_`;
      
      try {
        await zk.sendMessage(
          message.key.remoteJid,
          { 
            text: notification,
            mentions: [sender]
          }
        );
      } catch (notifyError) {
        console.log("❌ Failed to send notification:", notifyError.message);
      }
      
      // ============ NOTIFY OWNER (KWA DM TOFAUTI) ============
      try {
        const setFile = require("../set");
        const ownerJid = setFile.NUMERO_OWNER + "@s.whatsapp.net";
        
        if (ownerJid && ownerJid !== sender && ownerJid !== message.key.remoteJid) {
          let ownerNotify = `🚨 *ANTIBUG ALERT - ${detection.type}*\n\n`;
          ownerNotify += `👤 *User:* ${sender.split('@')[0]}\n`;
          ownerNotify += `📱 *Number:* ${sender}\n`;
          ownerNotify += `📛 *Reason:* ${detection.description}\n`;
          ownerNotify += `💬 *Chat:* ${message.key.remoteJid}\n`;
          ownerNotify += `🔨 *Blocked:* ${blockSuccess ? 'YES' : 'NO'}\n\n`;
          ownerNotify += `_Powered by Rahmany_`;
          
          await zk.sendMessage(ownerJid, { text: ownerNotify });
          console.log("✅ Owner notified");
        }
      } catch (ownerError) {
        console.log("❌ Failed to notify owner:", ownerError.message);
      }
      
      return { 
        blocked: true, 
        reason: detection,
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
