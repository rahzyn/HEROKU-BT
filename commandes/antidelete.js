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
    const { repondre, arg } = commandeOptions;

    if (!arg[0] || !["on", "off"].includes(arg[0])) {
        return repondre("*Usage:* .antidelete on | off");
    }

    fs.writeJSONSync(configPath, { status: arg[0] }, { spaces: 2 });
    
    if (arg[0] === "on") {
        await repondre(`✅ *ANTIDELETE ENABLED*\nDeleted messages will be sent to owner.`);
    } else {
        await repondre(`⚠️ *ANTIDELETE DISABLED*`);
    }
});
