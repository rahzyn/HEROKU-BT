const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");

const configPath = './bdd/antidelete.json';

zokou({
    nomCom: "antidelete",
    categorie: "General",
    reaction: "🗑️",
    desc: "Enable/disable anti-delete",
    fromMe: true
}, async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser } = commandeOptions;

    if (!superUser) {
        return repondre("❌ *Only owner can use this command!*");
    }

    if (!arg[0] || !["on", "off"].includes(arg[0].toLowerCase())) {
        return repondre("*❗ Usage:* .antidelete on | off\n\n_Deleted messages will be sent to owner_");
    }

    const status = arg[0].toLowerCase();
    fs.writeJSONSync(configPath, { status }, { spaces: 2 });
    
    if (status === "on") {
        await repondre(`✅ *ANTIDELETE ENABLED*\n\nAll deleted messages will be forwarded to your DM.`);
    } else {
        await repondre(`⚠️ *ANTIDELETE DISABLED*`);
    }
});
