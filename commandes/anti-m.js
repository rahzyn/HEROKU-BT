const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const path = require("path");

// ============ CONFIGURATION ============
const configPath = path.join(__dirname, "../bdd/antimention.json");
const warnPath = path.join(__dirname, "../bdd/antimentionWarns.json");

// Ensure bdd folder exists
if (!fs.existsSync(path.join(__dirname, "../bdd"))) {
    fs.mkdirSync(path.join(__dirname, "../bdd"));
}

// Create config files if not exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ 
        status: "off", 
        action: "warn",
        warnCount: 3
    }, null, 2));
}

if (!fs.existsSync(warnPath)) {
    fs.writeFileSync(warnPath, JSON.stringify({}, null, 2));
}

// ============ FUNCTIONS ============
function isAntimentionOn() {
    try {
        const data = fs.readFileSync(configPath);
        const config = JSON.parse(data);
        return config.status === "on";
    } catch {
        return false;
    }
}

function getAntimentionAction() {
    try {
        const data = fs.readFileSync(configPath);
        const config = JSON.parse(data);
        return config.action || "warn";
    } catch {
        return "warn";
    }
}

function getWarnCountSetting() {
    try {
        const data = fs.readFileSync(configPath);
        const config = JSON.parse(data);
        return config.warnCount || 3;
    } catch {
        return 3;
    }
}

function getUserWarns(userJid, groupJid) {
    try {
        const data = fs.readFileSync(warnPath);
        const warns = JSON.parse(data);
        const key = `${groupJid}_${userJid}`;
        return warns[key] || 0;
    } catch {
        return 0;
    }
}

function addUserWarn(userJid, groupJid) {
    try {
        const data = fs.readFileSync(warnPath);
        const warns = JSON.parse(data);
        const key = `${groupJid}_${userJid}`;
        warns[key] = (warns[key] || 0) + 1;
        fs.writeFileSync(warnPath, JSON.stringify(warns, null, 2));
        return warns[key];
    } catch (error) {
        console.log("Error saving warn:", error);
        return 1;
    }
}

function resetUserWarns(userJid, groupJid) {
    try {
        const data = fs.readFileSync(warnPath);
        const warns = JSON.parse(data);
        const key = `${groupJid}_${userJid}`;
        delete warns[key];
        fs.writeFileSync(warnPath, JSON.stringify(warns, null, 2));
    } catch (error) {
        console.log("Error resetting warns:", error);
    }
}

// ============ ANTI-MENTION HANDLER (HAITUMII INDEX) ============
async function handleAntimention(zk, message, sender, chatJid, isAdmin, isBotAdmin, superUser, botJid) {
    try {
        if (!isAntimentionOn()) return false;
        
        if (isAdmin || superUser || sender === botJid || message.key?.fromMe) {
            return false;
        }
        
        const messageText = message.message?.conversation || 
                            message.message?.extendedTextMessage?.text ||
                            message.message?.imageMessage?.caption ||
                            "";
        
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const botNumber = botJid.split('@')[0];
        const containsMention = mentionedJids.includes(botJid) || 
                               (messageText && messageText.includes(`@${botNumber}`));
        
        if (!containsMention) return false;
        
        console.log("🚫 ANTI-MENTION TRIGGERED!");
        console.log(`Sender: ${sender}`);
        
        // Delete message
        let deleted = false;
        try {
            await zk.sendMessage(chatJid, { delete: message.key });
            console.log("✅ Mention message deleted");
            deleted = true;
        } catch (deleteError) {
            console.log("❌ Failed to delete:", deleteError.message);
        }
        
        const action = getAntimentionAction();
        const warnLimit = getWarnCountSetting();
        
        if (action === "warn") {
            let currentWarns = getUserWarns(sender, chatJid);
            currentWarns = addUserWarn(sender, chatJid);
            
            console.log(`Current warns: ${currentWarns}/${warnLimit}`);
            
            if (currentWarns >= warnLimit) {
                if (isBotAdmin) {
                    try {
                        await zk.groupParticipantsUpdate(chatJid, [sender], "remove");
                        console.log("✅ User removed");
                        
                        await zk.sendMessage(chatJid, {
                            text: `🔨 @${sender.split('@')[0]} removed for mentioning me ${warnLimit} times.`,
                            mentions: [sender]
                        });
                        
                        resetUserWarns(sender, chatJid);
                    } catch (removeError) {
                        console.log("❌ Failed to remove:", removeError.message);
                        
                        await zk.sendMessage(chatJid, {
                            text: `⚠️ @${sender.split('@')[0]} You have reached ${warnLimit} warnings!\n❌ Cannot remove - bot is not admin.`,
                            mentions: [sender]
                        });
                    }
                } else {
                    await zk.sendMessage(chatJid, {
                        text: `⚠️ @${sender.split('@')[0]} You have reached ${warnLimit} warnings!`,
                        mentions: [sender]
                    });
                }
            } else {
                const remaining = warnLimit - currentWarns;
                await zk.sendMessage(chatJid, {
                    text: `⚠️ @${sender.split('@')[0]} Do not mention me!\n\n*Warning:* ${currentWarns}/${warnLimit}\n*Remaining:* ${remaining}`,
                    mentions: [sender]
                });
            }
        } else if (action === "remove") {
            if (isBotAdmin) {
                try {
                    await zk.groupParticipantsUpdate(chatJid, [sender], "remove");
                    console.log("✅ User removed immediately");
                    
                    await zk.sendMessage(chatJid, {
                        text: `🔨 @${sender.split('@')[0]} removed for mentioning me.`,
                        mentions: [sender]
                    });
                } catch (removeError) {
                    console.log("❌ Failed to remove:", removeError.message);
                    
                    await zk.sendMessage(chatJid, {
                        text: `⚠️ @${sender.split('@')[0]} Do not mention me!\n❌ Cannot remove - bot is not admin.`,
                        mentions: [sender]
                    });
                }
            } else {
                await zk.sendMessage(chatJid, {
                    text: `⚠️ @${sender.split('@')[0]} Do not mention me!`,
                    mentions: [sender]
                });
            }
        }
        
        return true;
        
    } catch (error) {
        console.error("Antimention error:", error);
        return false;
    }
}

// ============ MAIN COMMAND ============
zokou({
    nomCom: "antimention",
    categorie: "Group",
    reaction: "🚫",
    desc: "Enable/disable anti-mention (blocks mentions)",
    fromMe: true
}, async (dest, zk, commandeOptions) => {
    const { repondre, arg, verifGroupe, verifAdmin, superUser, ms, auteurMessage, idBot } = commandeOptions;

    if (!verifGroupe) {
        return repondre("❌ *This command can only be used in groups!*");
    }

    if (!verifAdmin && !superUser) {
        return repondre("❌ *Only group admins can use this command!*");
    }

    if (!arg[0]) {
        return repondre("*❗ Usage:*\n" +
            ".antimention on - Enable\n" +
            ".antimention off - Disable\n" +
            ".antimention action warn|remove|delete - Set action\n" +
            ".antimention warncount [number] - Set warn count\n" +
            ".antimention resetwarn @user - Reset warns\n" +
            ".antimention status - Check status\n\n" +
            "_Powered by HEROKU-BT_");
    }

    if (arg[0].toLowerCase() === "status") {
        const config = JSON.parse(fs.readFileSync(configPath));
        return repondre(`📊 *ANTI-MENTION STATUS*\n\n` +
            `Status: ${config.status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
            `Action: ${config.action.toUpperCase()}\n` +
            `Warn Count: ${config.warnCount}\n\n` +
            `_Powered by HEROKU-BT_`);
    }

    if (arg[0].toLowerCase() === "warncount" && arg[1]) {
        const count = parseInt(arg[1]);
        if (isNaN(count) || count < 1 || count > 10) {
            return repondre("❌ *Warn count must be between 1 and 10*");
        }
        
        const config = JSON.parse(fs.readFileSync(configPath));
        config.warnCount = count;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return repondre(`✅ *Warn count set to:* ${count}\n\n_Powered by HEROKU-BT_`);
    }

    if (arg[0].toLowerCase() === "resetwarn") {
        if (!arg[1]) {
            return repondre("❌ *Please mention the user to reset warns*\nExample: .antimention resetwarn @user");
        }
        
        let targetUser = "";
        if (arg[1].includes("@")) {
            targetUser = arg[1].replace("@", "") + "@s.whatsapp.net";
        } else {
            targetUser = arg[1].replace(/[^0-9]/g, '') + "@s.whatsapp.net";
        }
        
        resetUserWarns(targetUser, dest);
        return repondre(`✅ *Warns reset for @${targetUser.split('@')[0]}*\n\n_Powered by HEROKU-BT_`);
    }

    if (arg[0].toLowerCase() === "action" && arg[1]) {
        const action = arg[1].toLowerCase();
        if (!["delete", "warn", "remove"].includes(action)) {
            return repondre("❌ *Invalid action! Use: delete, warn, or remove*");
        }
        
        const config = JSON.parse(fs.readFileSync(configPath));
        config.action = action;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return repondre(`✅ *Antimention action set to:* ${action.toUpperCase()}\n\n_Powered by HEROKU-BT_`);
    }

    if (!["on", "off"].includes(arg[0].toLowerCase())) {
        return repondre("*❗ Usage:* .antimention on|off|action|warncount|resetwarn|status");
    }

    const status = arg[0].toLowerCase();
    const config = JSON.parse(fs.readFileSync(configPath));
    config.status = status;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    await repondre(
        status === "on"
            ? `✅ *ANTI-MENTION ENABLED*\n\n` +
              `Action: ${config.action.toUpperCase()}\n` +
              `Warn Count: ${config.warnCount}\n\n` +
              `_Powered by HEROKU-BT_`
            : `⚠️ *ANTI-MENTION DISABLED*\n\n_Powered by HEROKU-BT_`
    );
});

// ============ EVENT HANDLER (SELF-CONTAINED) ============
// This runs automatically when the command file is loaded
setTimeout(() => {
    try {
        // Get the socket instance from global
        const zk = global.sock;
        if (!zk) {
            console.log("⏳ Waiting for socket to initialize...");
            return;
        }
        
        console.log("🚀 Anti-mention handler attached!");
        
        // Attach event listener
        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message) return;
            
            const from = ms.key.remoteJid;
            const isGroup = from?.endsWith("@g.us");
            if (!isGroup) return;
            
            // Get group metadata
            let isSenderAdmin = false;
            let isBotAdmin = false;
            
            try {
                const groupMeta = await zk.groupMetadata(from);
                const participants = groupMeta.participants || [];
                const admins = participants.filter(p => p.admin).map(p => p.id);
                const botId = zk.user.id.split(':')[0] + '@s.whatsapp.net';
                
                isSenderAdmin = admins.includes(ms.key.participant || ms.participant);
                isBotAdmin = admins.includes(botId);
                
                await handleAntimention(
                    zk,
                    ms,
                    ms.key.participant || ms.participant,
                    from,
                    isSenderAdmin,
                    isBotAdmin,
                    false, // superUser
                    botId
                );
            } catch (e) {
                // Silent fail
            }
        });
        
    } catch (error) {
        console.log("❌ Anti-mention handler error:", error.message);
    }
}, 5000);

// Export for external use if needed
module.exports = {
    isAntimentionOn,
    getAntimentionAction,
    getWarnCountSetting,
    getUserWarns,
    resetUserWarns,
    handleAntimention
};
