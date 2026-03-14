const fs = require("fs-extra");
const path = require("path");

const antibugPath = path.join(__dirname, "../bdd/antibug.json");

// Ensure bdd folder exists
if (!fs.existsSync(path.join(__dirname, "../bdd"))) {
    fs.mkdirSync(path.join(__dirname, "../bdd"));
}

// Create antibug.json if not exists — default ON
if (!fs.existsSync(antibugPath)) {
    fs.writeFileSync(antibugPath, JSON.stringify({ status: "on" }, null, 2));
}

// Read antibug status
function isAntibugOn() {
    try {
        const data = fs.readFileSync(antibugPath);
        return JSON.parse(data).status === "on";
    } catch {
        return false;
    }
}

// ============================================================
// SMART BUG DETECTION — covers all known WhatsApp bug types
// ============================================================
function detectBug(message) {
    if (!message || typeof message !== 'string') return { isBug: false };

    // ── 1. CRASH CHARACTERS ──────────────────────────────────
    // Special characters known to crash WhatsApp or freeze the device
    const crashChars = [
        '\u{FDF2}',   // Arabic ligature Allah
        '\u{FDFD}',   // Bismillah (full form)
        '\u{1242B}',  // Cuneiform crash char
        '\uA9C1',     // Javanese left rerenggan
        '\uA9C2',     // Javanese right rerenggan
        '\uFFFE',     // Reversed BOM
        '\uFFFF',     // Non-character
        '\u202E',     // Right-to-left override
        '\u202B',     // Right-to-left embedding
        '\u200F',     // Right-to-left mark
        '\u061C',     // Arabic letter mark
        '\uFDD0',     // Non-character (start of range)
        '\uFDEF',     // Non-character (end of range)
    ];
    for (const ch of crashChars) {
        if (message.includes(ch)) {
            return {
                isBug: true,
                type: "CRASH_CHARACTER",
                description: `Crash character detected: U+${ch.codePointAt(0).toString(16).toUpperCase()}`
            };
        }
    }

    // ── 2. ZERO-WIDTH / INVISIBLE CHARACTER SPAM ────────────
    // Invisible characters that break parsing and cause freezing
    const zwChars = [
        '\u200B', // Zero-width space
        '\u200C', // Zero-width non-joiner
        '\u200D', // Zero-width joiner
        '\u2060', // Word joiner
        '\uFEFF', // Zero-width no-break space (BOM)
        '\u180E', // Mongolian vowel separator
        '\u00AD', // Soft hyphen
    ];
    let zwCount = 0;
    for (const ch of zwChars) {
        for (const c of message) {
            if (c === ch) zwCount++;
        }
    }
    if (zwCount >= 5) {
        return {
            isBug: true,
            type: "ZERO_WIDTH_SPAM",
            description: `Zero-width/invisible characters found (${zwCount} detected)`
        };
    }

    // ── 3. RTL/LTR DIRECTION OVERRIDE SPAM ──────────────────
    // Direction override characters that break text rendering
    const rtlChars = ['\u202E', '\u202D', '\u202C', '\u202B', '\u202A', '\u200F', '\u200E'];
    let rtlCount = 0;
    for (const c of message) {
        if (rtlChars.includes(c)) rtlCount++;
    }
    if (rtlCount >= 3) {
        return {
            isBug: true,
            type: "RTL_OVERRIDE_ATTACK",
            description: `RTL/LTR override characters found (${rtlCount} detected)`
        };
    }

    // ── 4. UNICODE COMBINING CHARACTERS OVERLOAD ────────────
    // Zalgo text / stacked diacritics that break rendering
    const combiningRange = /[\u0300-\u036F\u0489\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/g;
    const combiningMatches = message.match(combiningRange);
    if (combiningMatches && combiningMatches.length >= 20) {
        return {
            isBug: true,
            type: "ZALGO_COMBINING_ATTACK",
            description: `Zalgo/combining characters found (${combiningMatches.length} detected)`
        };
    }

    // ── 5. EMOJI OVERLOAD ────────────────────────────────────
    // Excessive emojis that slow down or crash the app
    const emojiPattern = /(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]|\u{1F300}-\u{1FAFF})/gu;
    const emojiMatches = message.match(emojiPattern);
    if (emojiMatches && emojiMatches.length >= 50) {
        return {
            isBug: true,
            type: "EMOJI_OVERLOAD",
            description: `Too many emojis (${emojiMatches.length} detected)`
        };
    }

    // ── 6. REPEATED CHARACTER FLOOD ─────────────────────────
    // Single character repeated many times — RAM overflow
    if (/(.)\1{30,}/u.test(message)) {
        return {
            isBug: true,
            type: "REPEATED_CHAR_FLOOD",
            description: "A single character repeated more than 30 times consecutively"
        };
    }

    // ── 7. ARABIC/PERSIAN CRASH SEQUENCES ───────────────────
    // Long Arabic character sequences that break the renderer
    if (/[\u0600-\u06FF]{50,}/.test(message)) {
        return {
            isBug: true,
            type: "ARABIC_SEQUENCE_CRASH",
            description: "Excessively long Arabic character sequence"
        };
    }

    // ── 8. NULL BYTES / CONTROL CHARACTERS ──────────────────
    // Control characters that break message processing
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(message)) {
        return {
            isBug: true,
            type: "CONTROL_CHARACTER",
            description: "Null byte or control character detected"
        };
    }

    // ── 9. SURROGATE PAIR ABUSE ──────────────────────────────
    // Unpaired surrogates that break Unicode processing
    if (/[\uD800-\uDFFF]/.test(message)) {
        return {
            isBug: true,
            type: "SURROGATE_ABUSE",
            description: "Unpaired Unicode surrogate characters detected"
        };
    }

    // ── 10. CHARACTER OVERLOAD ───────────────────────────────
    if (message.length > 1500) {
        return {
            isBug: true,
            type: "CHARACTER_OVERLOAD",
            description: `Message is too long (${message.length} characters)`
        };
    }

    // ── 11. URL SPAM ─────────────────────────────────────────
    const urlMatches = message.match(/(https?:\/\/[^\s]+)/g);
    if (urlMatches && urlMatches.length >= 3) {
        return {
            isBug: true,
            type: "URL_SPAM",
            description: `Too many URLs (${urlMatches.length} detected)`
        };
    }

    // ── 12. SCRIPT INJECTION ─────────────────────────────────
    if (/<script|javascript:|onerror=|onload=/i.test(message)) {
        return {
            isBug: true,
            type: "SCRIPT_INJECT",
            description: "Script injection attempt detected"
        };
    }

    return { isBug: false };
}

// ============ BLOCK USER ============
async function blockUser(zk, sender) {
    try {
        await zk.updateBlockStatus(sender, 'block');
        console.log("✅ User blocked:", sender);
        return true;
    } catch (e) {
        try {
            await zk.updateBlockStatus(sender.split('@')[0] + '@s.whatsapp.net', 'block');
            console.log("✅ User blocked (method 2)");
            return true;
        } catch (e2) {
            console.log("❌ Block failed:", e2.message);
            return false;
        }
    }
}

// ============ CLEAR PRIVATE CHAT ============
// WhatsApp does not allow bots to delete other users' messages in DMs.
// Solution: use chatModify to clear the entire chat history from your side.
async function clearPrivateChat(zk, jid, lastMessageKey) {
    try {
        await zk.chatModify({
            delete: true,
            lastMessages: [{
                key: lastMessageKey,
                messageTimestamp: Math.floor(Date.now() / 1000)
            }]
        }, jid);
        console.log("✅ Private chat cleared:", jid);
        return true;
    } catch (e) {
        console.log("❌ chatModify failed:", e.message);
        try { await zk.readMessages([lastMessageKey]); } catch (_) {}
        return false;
    }
}

// ============ MAIN ============
async function processIncomingMessage(zk, message, sender) {
    try {
        if (!isAntibugOn()) return { blocked: false };

        const messageText =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption || "";

        if (!messageText) return { blocked: false };

        const detection = detectBug(messageText);
        if (!detection.isBug) return { blocked: false };

        console.log("\n🚨 BUG DETECTED:", detection.type, "| From:", sender);

        const isGroup = message.key.remoteJid.endsWith('@g.us');
        let deleted = false;

        // STEP 1: BLOCK immediately
        const blocked = await blockUser(zk, sender);

        // STEP 2: DELETE / CLEAR message
        if (!isGroup) {
            // Private chat — clear the entire chat from your side
            deleted = await clearPrivateChat(zk, message.key.remoteJid, message.key);
        } else {
            // Group — delete the bug message (requires bot to be admin)
            try {
                await zk.sendMessage(message.key.remoteJid, {
                    delete: {
                        remoteJid: message.key.remoteJid,
                        fromMe: false,
                        id: message.key.id,
                        participant: message.key.participant
                    }
                });
                deleted = true;
                console.log("✅ Bug message deleted from group");
            } catch (e) {
                console.log("❌ Group delete failed (bot not admin?):", e.message);
            }
        }

        // STEP 3: NOTIFY OWNER
        try {
            const conf = require("../set");
            const ownerJid = conf.NUMERO_OWNER + "@s.whatsapp.net";
            if (ownerJid && ownerJid !== sender) {
                await zk.sendMessage(ownerJid, {
                    text:
`╭━━━ *『 ANTIBUG ALERT 』* ━━━╮
┃ 
┃ 🚨 *BUG DETECTED & HANDLED*
┃ 
┃ 📛 *Type:* ${detection.type}
┃ 📝 *Details:* ${detection.description}
┃ 👤 *User:* ${sender.split('@')[0]}
┃ 💬 *Chat:* ${isGroup ? 'Group' : 'Private DM'}
┃ 
┃ 🔨 *Blocked:* ${blocked ? '✅ YES' : '❌ NO'}
┃ 🗑️ *${isGroup ? 'Deleted' : 'Chat Cleared'}:* ${deleted ? '✅ YES' : '❌ NO'}
┃ 
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━`
                });
            }
        } catch (e) {
            console.log("Owner notify failed:", e.message);
        }

        // STEP 4: NOTIFY GROUP (group only)
        if (isGroup) {
            try {
                await zk.sendMessage(message.key.remoteJid, {
                    text:
`╭━━━ *『 ANTIBUG 』* ━━━╮
┃ 
┃ 🚨 *BUG DETECTED!*
┃ 
┃ 📛 *Type:* ${detection.type}
┃ 👤 *User:* @${sender.split('@')[0]}
┃ 
┃ 🔨 *Blocked:* ${blocked ? '✅ YES' : '❌ NO'}
┃ 🗑️ *Deleted:* ${deleted ? '✅ YES' : '❌ NO'}
┃ 
╰━━━━━━━━━━━━━━━━━━━━`,
                    mentions: [sender]
                });
            } catch (e) {}
        }

        return { blocked: true, userBlocked: blocked, messageDeleted: deleted };

    } catch (error) {
        console.error("❌ Antibug error:", error);
        return { blocked: false };
    }
}

module.exports = { processIncomingMessage };
