const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

zokou({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage } = commandOptions;
    let { cm } = require(__dirname + "/../framework/zokou");

    var commands = {};
    var mode = "public";

    if ((s.MODE).toLowerCase() !== "yes") {
        mode = "private";
    }

    cm.map((command) => {
        if (!commands[command.categorie]) commands[command.categorie] = [];
        commands[command.categorie].push(command.nomCom);
    });

    moment.tz.setDefault('Etc/GMT');
    const currentTime = moment().format('HH:mm:ss');
    const currentDate = moment().format('DD/MM/YYYY');

    let headerMessage = `
╭─────────────────╮  
│        *𝐇𝐄𝐑𝐎𝐊𝐔-𝐁𝐎𝐓*     │  
│      *BEST WHATSAPP BOT*  │  
╰─────────────────╯  

╭━━❰ *AVAILABLE MENUS* ❱━━╮  
┃ ❒  ▸ *MENU* 🧷               
┃ ❒  ▸ *MENU2*   ⚒️              
┃ ❒  ▸ *BUGMENU* 🦠
┃ =======================
┃ ❒  ▸ *PLUGINS*  : ${cm.length}   
┃ ❒  ▸ *RAM*      : ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}    
┃ ❒  ▸ *SYSTEM* 🤖  : ${os.platform()}         
┃ ❒  ▸ *THEME*  : HEROKU-BT  🔥
╰━━━━━━━━━━━━━━━━━━━━━━╯  

📌 _*Type the command to proceed.*_  
════════════════════════  
😊 𝒆𝒏𝒋𝒐𝒚 𝒇𝒐𝒓 𝒖𝒔𝒊𝒏𝒈 𝒉𝒆𝒓𝒐𝒌𝒖-𝒃𝒕 💥
════════════════════════\n`;

    let fullMenu = `\n *COMMANDS*${readmore}\n`;

    for (const category in commands) {
        fullMenu += ` ╭─────❒ *${category}* ✣`;
        for (const cmd of commands[category]) {
            fullMenu += `\n││▸ ${prefixe + cmd}`; // Imeongezwa prefix
        }
        fullMenu += `\n╰───────────────▸▸ \n`;
    }
    
    fullMenu += `> BOT CREATED BY Rahmani\n`;

    // Tafuta picha ya bot - kama ipo kwenye s.BOTPIC
    let imageUrl = s.BOTPIC || "https://files.catbox.moe/zotx9t.jpg";
    
    // Angalia kama mybotpic ipo kwenye commandOptions na ni function
    let botPicUrl = imageUrl;
    if (commandOptions.mybotpic && typeof commandOptions.mybotpic === 'function') {
        try {
            botPicUrl = await commandOptions.mybotpic() || imageUrl;
        } catch (e) {
            console.log("Error getting bot pic:", e);
            botPicUrl = imageUrl;
        }
    }

    const musicUrl = "https://files.catbox.moe/uv6fb5.mp3";

    try {
        // Send menu with image
        await zk.sendMessage(dest, {
            image: { url: botPicUrl },
            caption: headerMessage + fullMenu,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363317350679391@newsletter',
                    newsletterName: "HEROKU-BT",
                    serverMessageId: -1
                }
            }
        }, { quoted: ms });

        // Send background music after menu (optional)
        // Unaweza kuondoa hii kama hutaki muziki
        await zk.sendMessage(dest, {
            audio: { url: musicUrl },
            mimetype: 'audio/mp4',
            ptt: false
        }, { quoted: ms });

    } catch (error) {
        console.log("🥵🥵 Menu error: " + error);
        // Tuma text tu kama kuna error na image
        await repondre(headerMessage + fullMenu);
    }
});
