const { zokou } = require("../framework/zokou");

zokou({
    nomCom: "repo",
    categorie: "General",
    reaction: "📁",
    desc: "Get bot repository link"
}, async (dest, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;
    
    const repoMessage = `╭━━━ *『 HEROKU-BT REPO 』* ━━━╮
┃ 
┃ 📁 *REPOSITORY INFORMATION*
┃ 
┃ 🔗 *GitHub Repository:*
┃    https://github.com/rahzyn/HEROKU-BT
┃ 
┃ ⭐ *Star this repo* ⭐
┃    Show your support by starring
┃ 
┃ 🔄 *Fork this repo* 🔄
┃    Create your own version
┃ 
┃ 📦 *Deploy to Heroku:*
┃    Click the button below
┃ 
┃ 💬 *Report Issues:*
┃    Open an issue on GitHub
┃    Or contact owner
┃ 
┣━━━━━━━━━━━━━━━━━━━━
┃ 📢 *JOIN OUR CHANNEL*
┃    Get latest updates & news
┃ 🔗 https://whatsapp.com/channel/0029VatokI45EjxufALmY32X
┃ 
┃ 💬 *CONTACT OWNER*
┃ 🔗 https://wa.me/255693629079
╰━━━━━━━━━━━━━━━━━━━━

_© HEROKU-BT - Made with 💚_
_Thank you for using HEROKU-BT!_`;

    await repondre(repoMessage);
});
