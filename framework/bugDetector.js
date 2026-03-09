const fs = require("fs-extra");
const path = require("path");

const antibugPath = path.join(__dirname, "../bdd/antibug.json");

// Ensure bdd folder exists
if (!fs.existsSync(path.join(__dirname, "../bdd"))) {
    fs.mkdirSync(path.join(__dirname, "../bdd"));
}

// Create antibug.json if not exists
if (!fs.existsSync(antibugPath)) {
    fs.writeFileSync(antibugPath, JSON.stringify({ status: "off" }, null, 2));
}

// Function to read antibug status
function isAntibugOn() {
    try {
        const data = fs.readFileSync(antibugPath);
        const config = JSON.parse(data);
        return config.status === "on";
    } catch {
        return false;
    }
}

// Detect bugs in message
function detectBug(message) {
    if (!message || typeof message !== 'string') return { isBug: false };
    
    const bugPatterns = [
        // Character overload (messages > 300 chars)
        { pattern: /.{300,}/, type: "CHARACTER_OVERLOAD", desc: "Message too long (>300 chars)" },
        
        // Too many emojis
        { pattern: /(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]){10,}/, type: "EMOJI_OVERLOAD", desc: "Too many emojis/special chars" },
        
        // HTML/Script injection
        { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<[^>]+>/i, type: "HTML_INJECTION", desc: "HTML/Script tag detected" },
        
        // Mass mentions
        { pattern: /@everyone|@here|@all/i, type: "MASS_MENTION", desc: "Mass mention attempt" },
        
        // Repeated characters
        { pattern: /(.)\1{15,}/, type: "REPEATED_CHARS", desc: "Too many repeated characters" },
        
        // Multiple URLs
        { pattern: /(https?:\/\/[^\s]+){3,}/, type: "URL_SPAM", desc: "Multiple URLs detected" },
        
        // Phone numbers
        { pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, type: "PHONE_NUMBER", desc: "Phone number detected" },
        
        // Binary/control characters
        { pattern: /\x00|\x01|\x02|\x03|\x04|\x05|\x06|\x07|\x08|\x0e|\x0f|\x10|\x11|\x12|\x13|\x14|\x15|\x16|\x17|\x18|\x19|\x1a|\x1b|\x1c|\x1d|\x1e|\x1f/, type: "BINARY_CHARS", desc: "Binary/control characters detected" }
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

// Main function to process incoming messages
async function processIncomingMessage(zk, message, sender) {
    try {
        // Check if antibug is on
        if (!isAntibugOn()) {
            return { blocked: false };
        }
        
        // Get message text
        const messageText = message.message?.conversation || 
                            message.message?.extendedTextMessage?.text ||
                            message.message?.imageMessage?.caption ||
                            "";
        
        if (!messageText) return { blocked: false };
        
        // Detect bug
        const detection = detectBug(messageText);
        
        if (detection.isBug) {
            console.log("🚨 BUG DETECTED!");
            console.log(`Type: ${detection.type}`);
            console.log(`Sender: ${sender}`);
            console.log(`Message: ${messageText.substring(0, 50)}...`);
            
            // ============ TRY TO DELETE MESSAGE ============
            let deleted = false;
            try {
                // Only try to delete in groups
                if (message.key.remoteJid.endsWith('@g.us')) {
                    await zk.sendMessage(message.key.remoteJid, {
                        delete: {
                            remoteJid: message.key.remoteJid,
                            fromMe: false,
                            id: message.key.id,
                            participant: message.key.participant
                        }
                    });
                    console.log("✅ Bug message deleted from group");
                    deleted = true;
                } else {
                    console.log("ℹ️ Cannot delete in private chat (WhatsApp limitation)");
                }
            } catch (deleteError) {
                console.log("❌ Delete failed:", deleteError.message);
            }
            
            // ============ TRY TO BLOCK USER ============
            let blocked = false;
            try {
                // Method 1: Standard block
                await zk.updateBlockStatus(sender, 'block');
                console.log("✅ User BLOCKED successfully!");
                blocked = true;
            } catch (blockError1) {
                console.log("❌ Block method 1 failed:", blockError1.message);
                
                // Method 2: Alternative block method
                try {
                    const numberOnly = sender.split('@')[0];
                    await zk.updateBlockStatus(numberOnly + '@s.whatsapp.net', 'block');
                    console.log("✅ User BLOCKED successfully (method 2)!");
                    blocked = true;
                } catch (blockError2) {
                    console.log("❌ Block method 2 failed:", blockError2.message);
                    
                    // Method 3: Try using socket
                    try {
                        if (zk.blockUser) {
                            await zk.blockUser(sender, 'block');
                            console.log("✅ User BLOCKED successfully (method 3)!");
                            blocked = true;
                        }
                    } catch (blockError3) {
                        console.log("❌ All block methods failed");
                    }
                }
            }
            
            // ============ SEND NOTIFICATION ============
            const isGroup = message.key.remoteJid.endsWith('@g.us');
            
            let notification = `╭━━━ *『 ANTIBUG SYSTEM 』* ━━━╮
┃ 
┃ 🚨 *BUG DETECTED!*
┃ 
┃ 📛 *Type:* ${detection.type}
┃ 📝 *Reason:* ${detection.description}
┃ 👤 *User:* @${sender.split('@')[0]}
┃ 
┃ ✅ *Message Deleted:* ${deleted ? 'YES' : 'NO'}
┃ 🔨 *User Blocked:* ${blocked ? 'YES' : 'NO'}
┃ 
┃ ${blocked ? '🚫 User has been blocked from contacting the bot!' : '❌ Failed to block user!'}
┃ 
╰━━━━━━━━━━━━━━━━━━━━`;

            // Send notification to the chat
            try {
                await zk.sendMessage(message.key.remoteJid, {
                    text: notification,
                    mentions: [sender]
                }, { quoted: message });
            } catch (notifyError) {
                console.log("❌ Failed to send notification:", notifyError.message);
            }
            
            // ============ NOTIFY OWNER ============
            try {
                const conf = require("../set");
                const ownerJid = conf.NUMERO_OWNER + "@s.whatsapp.net";
                
                if (ownerJid && ownerJid !== sender) {
                    let ownerNotify = `╭━━━ *『 ANTIBUG ALERT 』* ━━━╮
┃ 
┃ 🚨 *BUG DETECTED & HANDLED*
┃ 
┃ 📛 *Type:* ${detection.type}
┃ 📝 *Reason:* ${detection.description}
┃ 👤 *User:* ${sender}
┃ 💬 *Chat:* ${message.key.remoteJid}
┃ 
┃ ✅ *Deleted:* ${deleted ? 'YES' : 'NO'}
┃ 🔨 *Blocked:* ${blocked ? 'YES' : 'NO'}
┃ 
╰━━━━━━━━━━━━━━━━━━━━`;

                    await zk.sendMessage(ownerJid, { text: ownerNotify });
                }
            } catch (ownerError) {
                console.log("❌ Failed to notify owner:", ownerError.message);
            }
            
            return { 
                blocked: true, 
                reason: detection,
                userBlocked: blocked,
                messageDeleted: deleted
            };
        }
        
        return { blocked: false };
        
    } catch (error) {
        console.error("❌ Antibug error:", error);
        return { blocked: false };
    }
}

module.exports = { processIncomingMessage };
