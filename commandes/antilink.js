const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const path = require("path");

const antilinkPath = path.join(__dirname, "../bdd/antilink.json");
const warnPath = path.join(__dirname, "../bdd/antilinkWarns.json");

// Ensure bdd folder exists
if (!fs.existsSync(path.join(__dirname, "../bdd"))) {
    fs.mkdirSync(path.join(__dirname, "../bdd"));
}

// Create config if not exists
if (!fs.existsSync(antilinkPath)) {
    fs.writeFileSync(antilinkPath, JSON.stringify({
        status: "off",
        action: "warn",
        warnCount: 3
    }, null, 2));
}

// Create warns file if not exists
if (!fs.existsSync(warnPath)) {
    fs.writeFileSync(warnPath, JSON.stringify({}, null, 2));
}

// ============ HELPERS ============

function getConfig() {
    try { return JSON.parse(fs.readFileSync(antilinkPath)); }
    catch { return { status: "off", action: "warn", warnCount: 3 }; }
}

function saveConfig(config) {
    fs.writeFileSync(antilinkPath, JSON.stringify(config, null, 2));
}

function isAntilinkOn() {
    return getConfig().status === "on";
}

function getAntilinkAction() {
    return getConfig().action || "warn";
}

function getWarnCountSetting() {
    return getConfig().warnCount || 3;
}

function getUserWarns(userJid, groupJid) {
    try {
        const warns = JSON.parse(fs.readFileSync(warnPath));
        return warns[`${groupJid}_${userJid}`] || 0;
    } catch { return 0; }
}

function addUserWarn(userJid, groupJid) {
    try {
        const warns = JSON.parse(fs.readFileSync(warnPath));
        const key = `${groupJid}_${userJid}`;
        warns[key] = (warns[key] || 0) + 1;
        fs.writeFileSync(warnPath, JSON.stringify(warns, null, 2));
        return warns[key];
    } catch { return 1; }
}

function resetUserWarns(userJid, groupJid) {
    try {
        const warns = JSON.parse(fs.readFileSync(warnPath));
        delete warns[`${groupJid}_${userJid}`];
        fs.writeFileSync(warnPath, JSON.stringify(warns, null, 2));
    } catch {}
}

// ============ LINK DETECTION ============
function containsLink(text) {
    if (!text || typeof text !== 'string') return false;

    const patterns = [
        // WhatsApp group/channel invite links
        /chat\.whatsapp\.com\/[a-zA-Z0-9]+/i,
        /whatsapp\.com\/channel\/[a-zA-Z0-9]+/i,
        // HTTP/HTTPS links
        /https?:\/\/[^\s]+/i,
        // www. links
        /www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i,
        // Domain links without www/http
        /\b[a-zA-Z0-9-]+\.(com|net|org|io|me|gg|tv|co|app|dev|ly|link|site|online|shop|store|xyz|info|biz|africa|ke|tz|ug|ng|gh|za)(\.[a-zA-Z]{2})?\/?\S*/i,
        // Telegram links
        /t\.me\/[a-zA-Z0-9_]+/i,
        // Shortened URLs
        /bit\.ly\/[a-zA-Z0-9]+/i,
        /tinyurl\.com\/[a-zA-Z0-9]+/i,
        /rb\.gy\/[a-zA-Z0-9]+/i,
    ];

    return patterns.some(p => p.test(text));
}

// ============ REMOVE USER ============
async function removeUser(zk, chatJid, sender) {
    try {
        await zk.groupParticipantsUpdate(chatJid, [sender], "remove");
        console.log("✅ User removed:", sender);
        return true;
    } catch (e) {
        console.log("❌ Remove failed:", e.message);
        return false;
    }
}

// ============ COMMAND ============
zokou({
    nomCom: "antilink",
    categorie: "Group",
    reaction: "🔗",
    desc: "Enable or disable anti-link with warn system",
    fromMe: true
}, async (dest, zk, commandeOptions) => {
    const { repondre, arg, verifGroupe, verifAdmin, superUser } = commandeOptions;

    if (!verifGroupe) return repondre("❌ *This command can only be used in groups!*");
    if (!verifAdmin && !superUser) return repondre("❌ *Only group admins can use this command!*");

    if (!arg[0]) {
        return repondre(
            `╭━━━ *『 ANTILINK 』* ━━━╮\n` +
            `┃\n` +
            `┃ *Usage:*\n` +
            `┃ .antilink on — Enable\n` +
            `┃ .antilink off — Disable\n` +
            `┃ .antilink status — Check status\n` +
            `┃ .antilink action warn — Warn first\n` +
            `┃ .antilink action remove — Remove immediately\n` +
            `┃ .antilink action delete — Delete only\n` +
            `┃ .antilink warncount [1-10] — Set warn limit\n` +
            `┃ .antilink resetwarn @user — Reset user warns\n` +
            `┃\n` +
            `┃ ✅ *Admins are not affected*\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━━━`
        );
    }

    const cmd = arg[0].toLowerCase();

    if (cmd === "status") {
        const config = getConfig();
        return repondre(
            `📊 *ANTILINK STATUS*\n\n` +
            `Status: ${config.status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
            `Action: ${config.action.toUpperCase()}\n` +
            `Warn Count: ${config.warnCount}\n` +
            `Bot Admin: ${commandeOptions.verifZokouAdmin ? '✅' : '❌'}`
        );
    }

    if (cmd === "warncount" && arg[1]) {
        const count = parseInt(arg[1]);
        if (isNaN(count) || count < 1 || count > 10)
            return repondre("❌ *Warn count must be between 1 and 10*");
        const config = getConfig();
        config.warnCount = count;
        saveConfig(config);
        return repondre(`✅ *Warn count set to:* ${count}`);
    }

    if (cmd === "resetwarn") {
        if (!arg[1]) return repondre("❌ *Please tag a user: .antilink resetwarn @user*");
        const target = arg[1].replace("@", "").replace(/[^0-9]/g, '') + "@s.whatsapp.net";
        resetUserWarns(target, dest);
        return repondre(`✅ *Warns reset for @${target.split('@')[0]}*`);
    }

    if (cmd === "action" && arg[1]) {
        const action = arg[1].toLowerCase();
        if (!["delete", "warn", "remove"].includes(action))
            return repondre("❌ *Invalid action! Use: delete, warn, or remove*");
        const config = getConfig();
        config.action = action;
        saveConfig(config);
        return repondre(`✅ *Antilink action set to:* ${action.toUpperCase()}`);
    }

    if (!["on", "off"].includes(cmd))
        return repondre("❌ *Usage: .antilink on|off|action|warncount|resetwarn|status*");

    const config = getConfig();
    config.status = cmd;
    saveConfig(config);

    if (cmd === "on") {
        await repondre(
            `╭━━━ *『 ANTILINK ENABLED 』* ━━━╮\n` +
            `┃\n` +
            `┃ ✅ *Antilink is now ON*\n` +
            `┃\n` +
            `┃ 🎯 *Action:* ${config.action.toUpperCase()}\n` +
            `┃ ⚠️ *Warn Count:* ${config.warnCount}\n` +
            `┃\n` +
            `┃ *Protected against:*\n` +
            `┃ • Regular links (http/https)\n` +
            `┃ • WhatsApp group/channel links\n` +
            `┃ • Telegram links\n` +
            `┃ • Shortened URLs\n` +
            `┃\n` +
            `┃ ✅ *Admins are not affected*\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━━━`
        );
    } else {
        await repondre(`⚠️ *ANTILINK DISABLED*`);
    }
});

// ============ HANDLER — called from index.js ============
module.exports = {
    isAntilinkOn,
    getAntilinkAction,
    getWarnCountSetting,
    getUserWarns,
    resetUserWarns,

    async handleAntilink(zk, message, sender, chatJid, isAdmin, isBotAdmin, superUser) {
        try {
            if (!isAntilinkOn()) return false;

            // Admins, superUsers and bot itself are never affected
            if (isAdmin || superUser || message.key.fromMe) return false;

            // Read text from all message types
            const messageText =
                message.message?.conversation ||
                message.message?.extendedTextMessage?.text ||
                message.message?.imageMessage?.caption ||
                message.message?.videoMessage?.caption ||
                message.message?.documentMessage?.caption || "";

            if (!messageText) return false;

            if (!containsLink(messageText)) return false;

            console.log("🔗 LINK DETECTED from:", sender);

            // Delete the link message (requires bot to be admin)
            let deleted = false;
            if (isBotAdmin) {
                try {
                    await zk.sendMessage(chatJid, { delete: message.key });
                    deleted = true;
                    console.log("✅ Link message deleted");
                } catch (e) {
                    console.log("❌ Delete failed:", e.message);
                }
            }

            const action = getAntilinkAction();
            const warnLimit = getWarnCountSetting();

            // ── ACTION: WARN ──────────────────────────────────
            if (action === "warn") {
                const currentWarns = addUserWarn(sender, chatJid);
                const remaining = warnLimit - currentWarns;

                if (currentWarns >= warnLimit) {
                    const removed = isBotAdmin ? await removeUser(zk, chatJid, sender) : false;
                    resetUserWarns(sender, chatJid);

                    await zk.sendMessage(chatJid, {
                        text: removed
                            ? `🔨 @${sender.split('@')[0]} was removed for sending links ${warnLimit} times.`
                            : `⚠️ @${sender.split('@')[0]} reached the final warning (${warnLimit}/${warnLimit})!\n❌ *Could not remove — bot is not admin.*`,
                        mentions: [sender]
                    });
                } else {
                    await zk.sendMessage(chatJid, {
                        text:
                            `⚠️ @${sender.split('@')[0]} Links are not allowed here!\n\n` +
                            `*Warning:* ${currentWarns}/${warnLimit}\n` +
                            `*Remaining:* ${remaining}\n\n` +
                            `_You will be removed after ${warnLimit} warnings._`,
                        mentions: [sender]
                    });
                }
            }

            // ── ACTION: REMOVE ────────────────────────────────
            else if (action === "remove") {
                const removed = isBotAdmin ? await removeUser(zk, chatJid, sender) : false;
                await zk.sendMessage(chatJid, {
                    text: removed
                        ? `🔨 @${sender.split('@')[0]} was removed for sending a link.`
                        : `⚠️ @${sender.split('@')[0]} Links are not allowed!\n❌ *Could not remove — bot is not admin.*`,
                    mentions: [sender]
                });
            }

            // ── ACTION: DELETE (silent) ───────────────────────
            else if (action === "delete") {
                if (!deleted && isBotAdmin) {
                    try { await zk.sendMessage(chatJid, { delete: message.key }); } catch (e) {}
                }
                // No notification — silent delete
            }

            return true;

        } catch (error) {
            console.error("Antilink error:", error);
            return false;
        }
    }
};
