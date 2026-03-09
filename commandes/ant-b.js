const { zokou } = require("../framework/zokou");
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

zokou({
    nomCom: "antibug",
    categorie: "General",
    reaction: "🛡️",
    desc: "Enable or disable antibug protection (auto-block users)",
    fromMe: true
}, async (dest, zk, commandeOptions) => {
    const { repondre, arg, verifGroupe, verifAdmin, superUser } = commandeOptions;

    // Check if user is admin or superUser for group commands
    if (verifGroupe && !verifAdmin && !superUser) {
        return repondre("❌ *Only group admins can use this command!*");
    }

    if (!arg[0] || !["on", "off"].includes(arg[0].toLowerCase())) {
        return repondre(`╭━━━ *『 ANTIBUG 』* ━━━╮
┃ 
┃ 🛡️ *Usage:* .antibug on|off
┃ 
┃ *Description:*
┃ Enable or disable antibug protection
┃ 
┃ *When enabled, bot will:*
┃ • Detect bug messages
┃ • Delete messages (in groups)
┃ • BLOCK users who send bugs
┃ • Notify the chat
┃ • Notify owner
┃ 
╰━━━━━━━━━━━━━━━━━━━━

_Powered by Rahmany_`);
    }

    const status = arg[0].toLowerCase();
    const newConfig = { status };

    try {
        fs.writeFileSync(antibugPath, JSON.stringify(newConfig, null, 2));
        
        if (status === "on") {
            await repondre(`╭━━━ *『 ANTIBUG ENABLED 』* ━━━╮
┃ 
┃ ✅ *Antibug protection is now ACTIVE*
┃ 
┃ 🛡️ *Bot will now:*
┃ • Detect bug messages
┃ • Delete messages (in groups)
┃ • BLOCK users who send bugs
┃ • Send notifications
┃ 
┃ ⚠️ *Warning:*
┃ Users sending bugs will be BLOCKED
┃ 
╰━━━━━━━━━━━━━━━━━━━━

_Powered by Rahmany_`);
        } else {
            await repondre(`╭━━━ *『 ANTIBUG DISABLED 』* ━━━╮
┃ 
┃ ⚠️ *Antibug protection is now OFF*
┃ 
┃ Bot will not detect or block bugs
┃ 
╰━━━━━━━━━━━━━━━━━━━━

_Powered by Rahmany_`);
        }
    } catch (e) {
        await repondre("❌ Failed to update antibug configuration.");
        console.error("Antibug write error:", e);
    }
});
