const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const path = require("path");

const configPath = path.join(__dirname, "../bdd/antistatus.json");
const warnPath = path.join(__dirname, "../bdd/antistatusWarns.json");

// Ensure bdd folder exists
if (!fs.existsSync(path.join(__dirname, "../bdd"))) {
    fs.mkdirSync(path.join(__dirname, "../bdd"));
}

// Create config if not exists
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({
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
    try { return JSON.parse(fs.readFileSync(configPath)); }
    catch { return { status: "off", action: "warn", warnCount: 3 }; }
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function isAntistatusOn() {
    return getConfig().status === "on";
}

function getAction() {
    return getConfig().action || "warn";
}

function getWarnLimit() {
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

// ============ STATUS MESSAGE DETECTION ============
// Detects status messages shared into a group via three methods:
// 1. contextInfo.remoteJid === "status@broadcast"
// 2. Forwarded media with forwardingScore = 0 (direct share from status)
// 3. viewOnce messages (commonly shared from status)
function isStatusMessage(message) {
    const msg = message.message;
    if (!msg) return false;

    const ctx =
        msg.extendedTextMessage?.contextInfo ||
        msg.imageMessage?.contextInfo ||
        msg.videoMessage?.contextInfo ||
        msg.documentMessage?.contextInfo ||
        msg.stickerMessage?.contextInfo ||
        msg.audioMessage?.contextInfo || null;

    if (!ctx) return false;

    // Method 1: Sent directly from status@broadcast
    if (ctx.remoteJid === "status@broadcast") return true;

    // Method 2: Forwarded media with forwardingScore 0 (direct status share)
    if (
        typeof ctx.forwardingScore === 'number' &&
        ctx.forwardingScore === 0 &&
        ctx.isForwarded === true &&
        (msg.imageMessage || msg.videoMessage || msg.audioMessage)
    ) return true;

    // Method 3: viewOnce message — commonly shared from status
    if (msg.viewOnceMessage || msg.viewOnceMessageV2) return true;

    return false;
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
    nomCom: "antistatus",
    categorie: "Group",
    reaction: "📵",
    desc: "Block users from sharing their status into the group",
    fromMe: true
}, async (dest, zk, commandeOptions) => {
    const { repondre, arg, verifGroupe, verifAdmin, superUser } = commandeOptions;

    if (!verifGroupe) return repondre("❌ *This command can only be used in groups!*");
    if (!verifAdmin && !superUser) return repondre("❌ *Only group admins can use this command!*");

    if (!arg[0]) {
        return repondre(
            `╭━━━ *『 ANTISTATUS 』* ━━━╮\n` +
            `┃\n` +
            `┃ *Usage:*\n` +
            `┃ .antistatus on — Enable\n` +
            `┃ .antistatus off — Disable\n` +
            `┃ .antistatus status — Check status\n` +
            `┃ .antistatus action warn — Warn first\n` +
            `┃ .antistatus action remove — Remove immediately\n` +
            `┃ .antistatus action delete — Delete silently\n` +
            `┃ .antistatus warncount [1-10] — Set warn limit\n` +
            `┃ .antistatus resetwarn @user — Reset user warns\n` +
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
            `📊 *ANTISTATUS STATUS*\n\n` +
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
        if (!arg[1]) return repondre("❌ *Please tag a user: .antistatus resetwarn @user*");
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
        return repondre(`✅ *Antistatus action set to:* ${action.toUpperCase()}`);
    }

    if (!["on", "off"].includes(cmd))
        return repondre("❌ *Usage: .antistatus on|off|action|warncount|resetwarn|status*");

    const config = getConfig();
    config.status = cmd;
    saveConfig(config);

    if (cmd === "on") {
        await repondre(
            `╭━━━ *『 ANTISTATUS ENABLED 』* ━━━╮\n` +
            `┃\n` +
            `┃ ✅ *Antistatus is now ON*\n` +
            `┃\n` +
            `┃ 🎯 *Action:* ${config.action.toUpperCase()}\n` +
            `┃ ⚠️ *Warn Count:* ${config.warnCount}\n` +
            `┃\n` +
            `┃ *Protected against:*\n` +
            `┃ • Status messages shared to group\n` +
            `┃ • ViewOnce messages\n` +
            `┃ • Media forwarded from status\n` +
            `┃\n` +
            `┃ ✅ *Admins are not affected*\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━━━`
        );
    } else {
        await repondre(`⚠️ *ANTISTATUS DISABLED*`);
    }
});

// ============ HANDLER — called from index.js ============
module.exports = {
    isAntistatusOn,

    async handleAntistatus(zk, message, sender, chatJid, isAdmin, isBotAdmin, superUser) {
        try {
            if (!isAntistatusOn()) return false;

            // Admins, superUsers and bot itself are never affected
            if (isAdmin || superUser || message.key?.fromMe) return false;

            // Check if this is a status shared into the group
            if (!isStatusMessage(message)) return false;

            console.log("📵 STATUS SHARED IN GROUP from:", sender);

            // Delete the message (requires bot to be admin)
            let deleted = false;
            if (isBotAdmin) {
                try {
                    await zk.sendMessage(chatJid, { delete: message.key });
                    deleted = true;
                    console.log("✅ Status message deleted from group");
                } catch (e) {
                    console.log("❌ Delete failed:", e.message);
                }
            }

            const action = getAction();
            const warnLimit = getWarnLimit();

            // ── ACTION: WARN ──────────────────────────────────
            if (action === "warn") {
                const currentWarns = addUserWarn(sender, chatJid);
                const remaining = warnLimit - currentWarns;

                if (currentWarns >= warnLimit) {
                    const removed = isBotAdmin ? await removeUser(zk, chatJid, sender) : false;
                    resetUserWarns(sender, chatJid);

                    await zk.sendMessage(chatJid, {
                        text: removed
                            ? `🔨 @${sender.split('@')[0]} was removed for sharing status in the group ${warnLimit} times.`
                            : `⚠️ @${sender.split('@')[0]} reached the final warning (${warnLimit}/${warnLimit})!\n❌ *Could not remove — bot is not admin.*`,
                        mentions: [sender]
                    });
                } else {
                    await zk.sendMessage(chatJid, {
                        text:
                            `📵 @${sender.split('@')[0]} Sharing your status in this group is not allowed!\n\n` +
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
                        ? `🔨 @${sender.split('@')[0]} was removed for sharing status in the group.`
                        : `📵 @${sender.split('@')[0]} Sharing status in this group is not allowed!\n❌ *Could not remove — bot is not admin.*`,
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
            console.error("Antistatus error:", error);
            return false;
        }
    }
};
