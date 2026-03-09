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
      
      // TRY TO DELETE MESSAGE
      let deleted = false;
      try {
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
        }
      } catch (deleteError) {
        console.log("❌ Delete failed:", deleteError.message);
      }
      
      // 🔥 BLOCK THE USER - NJIA 3 TOFAUTI!
      let blockSuccess = false;
      let blockErrorMsg = "";
      
      // NJIA 1: Kwa kutumia jid kamili
      try {
        await zk.updateBlockStatus(sender, 'block');
        console.log(`✅ User ${sender} blocked successfully (Method 1)`);
        blockSuccess = true;
      } catch (error1) {
        console.log("❌ Block method 1 failed:", error1.message);
        blockErrorMsg = error1.message;
        
        // NJIA 2: Kwa kutumia namba tu
        try {
          const numberOnly = sender.split('@')[0];
          await zk.updateBlockStatus(numberOnly + '@s.whatsapp.net', 'block');
          console.log(`✅ User ${numberOnly} blocked successfully (Method 2)`);
          blockSuccess = true;
        } catch (error2) {
          console.log("❌ Block method 2 failed:", error2.message);
          
          // NJIA 3: Kwa kutumia baileys blocking function tofauti
          try {
            // Njia mbadala - tumia socket blocking
            if (zk.blockUser) {
              await zk.blockUser(sender, "block");
              console.log(`✅ User blocked successfully (Method 3)`);
              blockSuccess = true;
            } else if (zk.block) {
              await zk.block(sender);
              console.log(`✅ User blocked successfully (Method 4)`);
              blockSuccess = true;
            }
          } catch (error3) {
            console.log("❌ All block methods failed:", error3.message);
          }
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
      let notification = `⚠️ *ANTIBUG SYSTEM*\n\n`;
      notification += `📛 *Reason:* ${detection.description}\n`;
      notification += `🔍 *Type:* ${detection.type}\n`;
      notification += `👤 *User:* @${sender.split('@')[0]}\n\n`;
      
      if (deleted) notification += `✅ Message deleted\n`;
      if (blockSuccess) notification += `✅ User blocked\n`;
      if (!blockSuccess) notification += `❌ Block failed: ${blockErrorMsg}\n`;
      if (removeSuccess) notification += `✅ Removed from group\n`;
      
      await zk.sendMessage(
        message.key.remoteJid,
        { 
          text: notification,
          mentions: [sender]
        }
      );
      
      // NOTIFY OWNER (kwa DM)
      try {
        const setFile = require("../set");
        const ownerJid = setFile.NUMERO_OWNER + "@s.whatsapp.net";
        
        if (ownerJid && ownerJid !== sender && ownerJid !== message.key.remoteJid) {
          let ownerNotify = `🚨 *ANTIBUG ALERT*\n\n`;
          ownerNotify += `👤 *User:* ${sender.split('@')[0]}\n`;
          ownerNotify += `📱 *Number:* ${sender}\n`;
          ownerNotify += `📛 *Reason:* ${detection.type}\n`;
          ownerNotify += `💬 *Chat:* ${message.key.remoteJid}\n\n`;
          ownerNotify += `✅ Blocked: ${blockSuccess ? 'YES' : 'NO'}`;
          
          await zk.sendMessage(ownerJid, { text: ownerNotify });
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
