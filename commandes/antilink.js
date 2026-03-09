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
        action: "warn",  // Default to warn
        warnCount: 3      // Default warn count
    }, null, 2));
}

// Create warns file if not exists
if (!fs.existsSync(warnPath)) {
    fs.writeFileSync(warnPath, JSON.stringify({}, null, 2));
}

// Function to read antilink status
function isAntilinkOn() {
    try {
        const data = fs.readFileSync(antilinkPath);
        const config = JSON.parse(data);
        return config.status === "on";
    } catch {
        return false;
    }
}

// Function to get antilink action
function getAntilinkAction() {
    try {
        const data = fs.readFileSync(antilinkPath);
        const config = JSON.parse(data);
        return config.action || "warn";
    } catch {
        return "warn";
    }
}

// Function to get warn count setting
function getWarnCountSetting() {
    try {
        const data = fs.readFileSync(antilinkPath);
        const config = JSON.parse(data);
        return config.warnCount || 3;
    } catch {
        return 3;
    }
}

// Function to get user warns
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

// Function to add user warn
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

// Function to reset user warns
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

// Main command
zokou({
    nomCom: "antilink",
    categorie: "Group",
    reaction: "🔗",
    desc: "Enable or disable anti-link with warn system",
    fromMe: true
}, async (dest, zk, commandeOptions) => {
    const { repondre, arg, verifGroupe, verifAdmin, superUser } = commandeOptions;

    // Check if in group
    if (!verifGroupe) {
        return repondre("❌ *This command can only be used in groups!*");
    }

    // Check if user is admin or superUser
    if (!verifAdmin && !superUser) {
        return repondre("❌ *Only group admins can use this command!*");
    }

    if (!arg[0]) {
        return repondre("*❗ Usage:*\n" +
            ".antilink on - Enable\n" +
            ".antilink off - Disable\n" +
            ".antilink action warn|remove|delete - Set action\n" +
            ".antilink warncount [number] - Set warn count\n" +
            ".antilink resetwarn @user - Reset warns\n" +
            ".antilink status - Check status\n\n" +
            "_Powered by Rahmany_");
    }

    // Handle status check
    if (arg[0].toLowerCase() === "status") {
        const config = JSON.parse(fs.readFileSync(antilinkPath));
        return repondre(`📊 *ANTILINK STATUS*\n\n` +
            `Status: ${config.status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
            `Action: ${config.action.toUpperCase()}\n` +
            `Warn Count: ${config.warnCount}\n\n` +
            `_Powered by Rahmany_`);
    }

    // Handle warn count setting
    if (arg[0].toLowerCase() === "warncount" && arg[1]) {
        const count = parseInt(arg[1]);
        if (isNaN(count) || count < 1 || count > 10) {
            return repondre("❌ *Warn count must be between 1 and 10*");
        }
        
        try {
            const config = JSON.parse(fs.readFileSync(antilinkPath));
            config.warnCount = count;
            fs.writeFileSync(antilinkPath, JSON.stringify(config, null, 2));
            return repondre(`✅ *Warn count set to:* ${count}\n\n` +
                `User will be removed after sending ${count} links.\n\n` +
                `_Powered by Rahmany_`);
        } catch (e) {
            return repondre("❌ Failed to update warn count.");
        }
    }

    // Handle reset warns for user
    if (arg[0].toLowerCase() === "resetwarn") {
        if (!arg[1]) {
            return repondre("❌ *Please mention the user to reset warns*\nExample: .antilink resetwarn @user");
        }
        
        let targetUser = "";
        if (arg[1].includes("@")) {
            targetUser = arg[1].replace("@", "") + "@s.whatsapp.net";
        } else {
            targetUser = arg[1].replace(/[^0-9]/g, '') + "@s.whatsapp.net";
        }
        
        resetUserWarns(targetUser, dest);
        return repondre(`✅ *Warns reset for @${targetUser.split('@')[0]}*\n\n_Powered by Rahmany_`);
    }

    // Handle action setting
    if (arg[0].toLowerCase() === "action" && arg[1]) {
        const action = arg[1].toLowerCase();
        if (!["delete", "warn", "remove"].includes(action)) {
            return repondre("❌ *Invalid action! Use: delete, warn, or remove*");
        }
        
        try {
            const config = JSON.parse(fs.readFileSync(antilinkPath));
            config.action = action;
            fs.writeFileSync(antilinkPath, JSON.stringify(config, null, 2));
            return repondre(`✅ *Antilink action set to:* ${action.toUpperCase()}\n\n_Powered by Rahmany_`);
        } catch (e) {
            return repondre("❌ Failed to update action.");
        }
    }

    // Handle on/off
    if (!["on", "off"].includes(arg[0].toLowerCase())) {
        return repondre("*❗ Usage:* .antilink on|off|action|warncount|resetwarn|status");
    }

    const status = arg[0].toLowerCase();

    try {
        const config = JSON.parse(fs.readFileSync(antilinkPath));
        config.status = status;
        fs.writeFileSync(antilinkPath, JSON.stringify(config, null, 2));
        
        await repondre(
            status === "on"
                ? `✅ *ANTILINK ENABLED*\n\n` +
                  `Action: ${config.action.toUpperCase()}\n` +
                  `Warn Count: ${config.warnCount}\n\n` +
                  `_Powered by Rahmany_`
                : `⚠️ *ANTILINK DISABLED*\n\n_Powered by Rahmany_`
        );
    } catch (e) {
        await repondre("❌ Failed to update antilink configuration.");
    }
});

// Export functions for main.js
module.exports = {
    isAntilinkOn,
    getAntilinkAction,
    getWarnCountSetting,
    getUserWarns,
    resetUserWarns,
    
    // Function to handle link detection with warn system
    async handleAntilink(zk, message, sender, chatJid, isAdmin, isBotAdmin, superUser) {
        try {
            // Check if antilink is on
            if (!isAntilinkOn()) return false;
            
            // Skip if sender is admin, superUser, or bot itself
            if (isAdmin || superUser || message.key.fromMe) {
                return false;
            }
            
            // Get message text
            const messageText = message.message?.conversation || 
                                message.message?.extendedTextMessage?.text ||
                                message.message?.imageMessage?.caption ||
                                "";
            
            if (!messageText) return false;
            
            // Check for links (comprehensive regex)
            const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9]+\.(com|org|net|io|gov|edu|tz|co\.tz|go\.tz|africa|ke|ug))(\/[^\s]*)?/gi;
            
            if (!linkRegex.test(messageText)) return false;
            
            console.log("🔗 LINK DETECTED!");
            console.log(`Sender: ${sender}`);
            
            // Try to delete message (always delete)
            try {
                await zk.sendMessage(chatJid, { 
                    delete: { 
                        remoteJid: chatJid, 
                        fromMe: false, 
                        id: message.key.id,
                        participant: message.key.participant
                    } 
                });
                console.log("✅ Link message deleted");
            } catch (deleteError) {
                console.log("❌ Failed to delete:", deleteError.message);
            }
            
            const action = getAntilinkAction();
            const warnLimit = getWarnCountSetting();
            
            // If action is "warn", use warn system
            if (action === "warn") {
                // Get current warn count
                let currentWarns = getUserWarns(sender, chatJid);
                currentWarns = addUserWarn(sender, chatJid);
                
                console.log(`Current warns: ${currentWarns}/${warnLimit}`);
                
                // Check if reached warn limit
                if (currentWarns >= warnLimit) {
                    // Remove user from group
                    if (isBotAdmin) {
                        try {
                            await zk.groupParticipantsUpdate(chatJid, [sender], "remove");
                            console.log("✅ User removed from group (reached warn limit)");
                            
                            // Notify group
                            await zk.sendMessage(chatJid, {
                                text: `🔨 @${sender.split('@')[0]} has been removed for sending links ${warnLimit} times.`,
                                mentions: [sender]
                            });
                            
                            // Reset warns after removal
                            resetUserWarns(sender, chatJid);
                            
                        } catch (removeError) {
                            console.log("❌ Failed to remove:", removeError.message);
                        }
                    } else {
                        // Bot not admin, just warn
                        await zk.sendMessage(chatJid, {
                            text: `⚠️ @${sender.split('@')[0]} You have sent ${currentWarns}/${warnLimit} links.\nBot needs to be admin to remove you.`,
                            mentions: [sender]
                        });
                    }
                } else {
                    // Send warning with count
                    const remaining = warnLimit - currentWarns;
                    await zk.sendMessage(chatJid, {
                        text: `⚠️ @${sender.split('@')[0]} Links are not allowed!\n\n` +
                              `*Warning:* ${currentWarns}/${warnLimit}\n` +
                              `*Remaining:* ${remaining} ${remaining === 1 ? 'warning' : 'warnings'} before removal.`,
                        mentions: [sender]
                    });
                }
            } 
            else if (action === "remove") {
                // Remove immediately
                if (isBotAdmin) {
                    try {
                        await zk.groupParticipantsUpdate(chatJid, [sender], "remove");
                        console.log("✅ User removed from group immediately");
                        
                        await zk.sendMessage(chatJid, {
                            text: `🔨 @${sender.split('@')[0]} removed for sending links.`,
                            mentions: [sender]
                        });
                    } catch (removeError) {
                        console.log("❌ Failed to remove:", removeError.message);
                    }
                } else {
                    await zk.sendMessage(chatJid, {
                        text: `⚠️ @${sender.split('@')[0]} Links are not allowed!\nBot needs to be admin to remove you.`,
                        mentions: [sender]
                    });
                }
            }
            // else action === "delete" - already deleted, no further action
            
            return true;
            
        } catch (error) {
            console.error("Antilink error:", error);
            return false;
        }
    }
};
