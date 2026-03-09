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
        { pattern: /.{300,}/, type: "CHARACTER_OVERLOAD", desc: "Message too long (>300 chars)" },
        { pattern: /(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]){10,}/, type: "EMOJI_OVERLOAD", desc: "Too many emojis" },
        { pattern: /<script|javascript:|onerror=|onload=/i, type: "SCRIPT", desc: "Script detected" },
        { pattern: /@everyone|@here|@all/i, type: "MASS_MENTION", desc: "Mass mention" },
        { pattern: /(.)\1{15,}/, type: "REPEATED_CHARS", desc: "Repeated characters" },
        { pattern: /(https?:\/\/[^\s]+){3,}/, type: "URL_SPAM", desc: "Multiple URLs" }
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

// BLOCK USER FUNCTION - IMPROVED VERSION
async function blockUser(zk, sender) {
    const methods = [];
    
    // METHOD 1: Standard updateBlockStatus
    try {
        await zk.updateBlockStatus(sender, 'block');
        console.log("✅ Method 1: updateBlockStatus SUCCESS");
        return true;
    } catch (e) {
        methods.push(`Method 1 failed: ${e.message}`);
    }
    
    // METHOD 2: With different parameter format
    try {
        await zk.updateBlockStatus(sender, "block");
        console.log("✅ Method 2: updateBlockStatus with string SUCCESS");
        return true;
    } catch (e) {
        methods.push(`Method 2 failed: ${e.message}`);
    }
    
    // METHOD 3: Using blockUser if available
    try {
        if (zk.blockUser) {
            await zk.blockUser(sender, 'block');
            console.log("✅ Method 3: blockUser SUCCESS");
            return true;
        }
    } catch (e) {
        methods.push(`Method 3 failed: ${e.message}`);
    }
    
    // METHOD 4: Using number only
    try {
        const numberOnly = sender.split('@')[0];
        await zk.updateBlockStatus(numberOnly + '@s.whatsapp.net', 'block');
        console.log("✅ Method 4: number only SUCCESS");
        return true;
    } catch (e) {
        methods.push(`Method 4 failed: ${e.message}`);
    }
    
    // METHOD 5: Try to block via socket
    try {
        if (zk.ws) {
            // Another approach - send block command via socket
            await zk.sendNode({
                tag: 'action',
                attrs: { type: 'set', epoch: '1' },
                content: [
                    { tag: 'block', attrs: { jid: sender, action: 'block' } }
                ]
            });
            console.log("✅ Method 5: socket block SUCCESS");
            return true;
        }
    } catch (e) {
        methods.push(`Method 5 failed: ${e.message}`);
    }
    
    // Log all failures
    console.log("❌ All block methods failed:");
    methods.forEach(m => console.log(`   • ${m}`));
    
    return false;
}

// Main function
async function processIncomingMessage(zk, message, sender) {
    try {
        if (!isAntibugOn()) return { blocked: false };
        
        const messageText = message.message?.conversation || 
                            message.message?.extendedTextMessage?.text ||
                            message.message?.imageMessage?.caption || "";
        
        if (!messageText) return { blocked: false };
        
        const detection = detectBug(messageText);
        
        if (detection.isBug) {
            console.log("\n🚨 BUG DETECTED!");
            console.log(`Type: ${detection.type}`);
            console.log(`Sender: ${sender}`);
            
            const isGroup = message.key.remoteJid.endsWith('@g.us');
            let deleted = false;
            let blocked = false;
            
            // ============ HANDLE MESSAGE ============
            if (isGroup) {
                // Try to delete from group
                try {
                    await zk.sendMessage(message.key.remoteJid, {
                        delete: {
                            remoteJid: message.key.remoteJid,
                            fromMe: false,
                            id: message.key.id,
                            participant: message.key.participant
                        }
                    });
                    console.log("✅ Message deleted from group");
                    deleted = true;
                } catch (deleteError) {
                    console.log("❌ Delete failed:", deleteError.message);
                }
            } else {
                // Private chat - hide message
                try {
                    await zk.readMessages([message.key]);
                    await zk.sendMessage(message.key.remoteJid, {
                        delete: message.key
                    }).catch(e => {});
                    console.log("✅ Message hidden from your view");
                    deleted = true;
                } catch (dmError) {
                    console.log("❌ Hide failed:", dmError.message);
                }
            }
            
            // ============ BLOCK USER (IMPROVED) ============
            blocked = await blockUser(zk, sender);
            
            // ============ SEND NOTIFICATION ============
            if (isGroup) {
                let notification = `╭━━━ *『 ANTIBUG 』* ━━━╮
┃ 
┃ 🚨 *BUG DETECTED!*
┃ 
┃ 📛 *Type:* ${detection.type}
┃ 👤 *User:* @${sender.split('@')[0]}
┃ 
┃ ✅ *Deleted:* ${deleted ? 'YES' : 'NO'}
┃ 🔨 *Blocked:* ${blocked ? 'YES' : 'NO'}
┃ 
╰━━━━━━━━━━━━━━━━━━━━`;

                try {
                    await zk.sendMessage(message.key.remoteJid, {
                        text: notification,
                        mentions: [sender]
                    });
                } catch (e) {}
            }
            
            // ============ NOTIFY OWNER ============
            try {
                const conf = require("../set");
                const ownerJid = conf.NUMERO_OWNER + "@s.whatsapp.net";
                
                if (ownerJid && ownerJid !== sender) {
                    let ownerNotify = `╭━━━ *『 ANTIBUG ALERT 』* ━━━╮
┃ 
┃ 🚨 *BUG HANDLED*
┃ 
┃ 📛 *Type:* ${detection.type}
┃ 👤 *User:* ${sender}
┃ 💬 *Chat:* ${message.key.remoteJid}
┃ 
┃ ✅ *Blocked:* ${blocked ? 'YES' : 'NO'}
┃ 
╰━━━━━━━━━━━━━━━━━━━━`;

                    await zk.sendMessage(ownerJid, { text: ownerNotify });
                }
            } catch (e) {}
            
            return { 
                blocked: true, 
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
