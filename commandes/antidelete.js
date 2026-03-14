const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");

const configPath = './bdd/antidelete.json';

// Create config if not exists
if (!fs.existsSync('./bdd')) fs.mkdirSync('./bdd');
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ status: "off" }, null, 2));
}

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
        return repondre("*❗ Usage:* .antidelete on | off");
    }

    const status = arg[0].toLowerCase();
    fs.writeFileSync(configPath, JSON.stringify({ status }, null, 2));
    
    if (status === "on") {
        await repondre(`✅ *ANTIDELETE ENABLED*\n\nDeleted messages will be sent to owner.`);
    } else {
        await repondre(`⚠️ *ANTIDELETE DISABLED*`);
    }
});

module.exports = {
    isAntiDeleteOn: () => {
        try {
            const data = fs.readFileSync(configPath);
            const config = JSON.parse(data);
            return config.status === "on";
        } catch {
            return false;
        }
    }
};
