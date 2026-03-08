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
    { pattern: /.{1000,}/, type: "CHARACTER_OVERLOAD", desc: "Message too long (>1000 chars)" },
    { pattern: /(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]){20,}/, type: "EMOJI_OVERLOAD", desc: "Too many emojis/special chars" },
    { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<[^>]+>/i, type: "HTML_INJECTION", desc: "HTML/Script tag detected" },
    { pattern: /@everyone|@here|@all/i, type: "MASS_MENTION", desc: "Mass mention attempt" },
    { pattern: /(.)\1{20,}/, type: "REPEATED_CHARS", desc: "Too many repeated characters" },
    { pattern: /(https?:\/\/[^\s]+){5,}/, type: "URL_SPAM", desc: "Multiple URLs detected" },
    { pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, type: "PHONE_NUMBER", desc: "Phone number detected" },
    { pattern: /[\u0300-\u036f\u0483-\u0489\u1dc0-\u1dff\u20d0-\u20ff\u2de0-\u2dff\ua66c-\ua66f]/gu, type: "ZALGO_TEXT", desc: "Glitchy/Zalgo text detected" },
    { pattern: /\x00|\x01|\x02|\x03|\x04|\x05|\x06|\x07|\x08|\x0e|\x0f|\x10|\x11|\x12|\x13|\x14|\x15|\x16|\x17|\x18|\x19|\x1a|\x1b|\x1c|\x1d|\x1e|\x1f/, type: "BINARY_CHARS", desc: "Binary/control characters detected" },
    { pattern: /\{.*:.*\}|\[.*\]/, type: "JSON_INJECTION", desc: "JSON structure detected" }
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
      
      // Delete message
      try {
        const key = {
          remoteJid: message.key.remoteJid,
          fromMe: false,
          id: message.key.id
        };
        await zk.sendMessage(message.key.remoteJid, { delete: key });
      } catch (deleteError) {
        console.log("Could not delete message:", deleteError);
      }
      
      // Send warning
      await zk.sendMessage(
        message.key.remoteJid,
        { 
          text: `⚠️ *ANTIBUG SYSTEM*\nMessage imeblockwa!\n\n*Reason:* ${detection.description}\n*Type:* ${detection.type}` 
        },
        { quoted: message }
      );
      
      return { blocked: true, reason: detection };
    }
    
    return { blocked: false };
    
  } catch (error) {
    console.error("Error in message handler:", error);
    return { blocked: false };
  }
}

module.exports = { processIncomingMessage };
