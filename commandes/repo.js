const { zokou } = require(__dirname + "/../framework/zokou");
const os = require("os");
const { format } = require(__dirname + "/../framework/mesfonctions");
const s = require(__dirname + "/../set");

zokou({ 
    nomCom: "repo", 
    categorie: "General",
    reaction: "📦" 
}, async (dest, zk, commandeOptions) => {
    
    let { ms, repondre, prefixe, mybotpic } = commandeOptions;
    
    // Channel yako
    const channelLink = "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X";
    
    // System info
    const mode = s.MODE?.toLowerCase() == "yes" ? "Public" : "Private";
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    // Message fupi na kitufe cha channel
    const repoMsg = `
╭━━━ *HEROKU-BT* ━━━╮
┃
┃ 👤 Mode: ${mode}
┃ 📊 RAM: ${format(os.totalmem() - os.freemem())}
┃ ⏰ Uptime: ${hours}h ${minutes}m
┃ 📌 Prefix: ${prefixe}
┃
┃ 👨‍💻 Dev: Rahmany & Qart
┃
┃ 📁 Repo: github.com/rahzyn/HEROKU-BT
┃
╰━━━━━━━━━━━━━━╯

*Join channel for updates!* 👇
`;

    try {
        // Tuma message na button moja tu - channel
        await zk.sendMessage(dest, {
            text: repoMsg,
            buttons: [
                {
                    buttonId: "channel",
                    buttonText: { displayText: "📢 JOIN MY CHANNEL" },
                    type: 1
                }
            ],
            headerType: 1
        }, { quoted: ms });

    } catch (e) {
        // Kama button haifanyi kazi, tuma link moja kwa moja
        await repondre(repoMsg + "\n" + channelLink);
    }
});

// Handle button click
zokou({ 
    nomCom: "channel", 
    categorie: "General",
    isButton: true
}, async (dest, zk, commandeOptions) => {
    const channelLink = "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X";
    await zk.sendMessage(dest, {
        text: "*📢 JOIN CHANNEL:*\n" + channelLink
    });
});
