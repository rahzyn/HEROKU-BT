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
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandOptions;
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
╭────────────────────────╮  
│            ✪ *𝐁𝐎𝐓*        │  
│     ° =  𝐇𝐄𝐑𝐎𝐊𝐔-𝐁𝐓    =°         │  
╰────────────────────────╯  

╭━━❰ *AVAILABLE MENUS* ❱━━╮  
┃ ❒  📜 ▸ *MENU*                    
┃ ❒  📄 ▸ *MENU2*                  
┃ ❒  🐞 ▸ *BUGMENU*  
┃ =======================
┃ ❒  🔌 ▸ *PLUGINS*  : ${cm.length}   
┃ ❒  💾 ▸ *RAM*      : ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}    
┃ ❒  🖥️  ▸ *SYSTEM*   : ${os.platform()}         
┃ ❒  🎨 ▸ *THEME*    : 𝐇𝐄𝐑𝐎𝐊𝐔  
╰━━━━━━━━━━━━━━━━━━━━━━╯  

📌 _*Type the command to proceed.*_  
════════════════════════  
💡 WE ARE FAMILY
════════════════════════\n`;

    let fullMenu = `\n *COMMANDS*${readmore}\n`;

    for (const category in commands) {
        fullMenu += ` ╭─────❒ *${category}* ✣`;
        for (const cmd of commands[category]) {
            fullMenu += `\n││▸ ${cmd}`;
        }
        fullMenu += `\n╰───────────────▸▸ \n`;
    }

    fullMenu += `> BOT CREATED BY 𝐇𝐄𝐑𝐎𝐊𝐔-𝐁𝐓\n`;

    const imageOrVideoUrl = mybotpic();
    const musicUrl = "https://files.catbox.moe/uv6fb5.mp3";

    try {
        // If it's a video or gif
        if (imageOrVideoUrl.match(/\.(mp4|gif)$/i)) {
            await zk.sendMessage(dest, {
                video: { url: imageOrVideoUrl },
                caption: headerMessage + fullMenu,
                footer: "𝐇𝐄𝐑𝐎𝐊𝐔-𝐁𝐓*, developed by 𝐑𝐚𝐡𝐦𝐚𝐧𝐢",
                gifPlayback: true
            }, { quoted: ms });
        } 
        // If it's a static image
        else if (imageOrVideoUrl.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(dest, {
                image: { url: imageOrVideoUrl },
                caption: headerMessage + fullMenu,
                footer: "𝐇𝐄𝐑𝐎𝐊𝐔-𝐁𝐓*, developed by 𝐑𝐚𝐡𝐦𝐚𝐧𝐢"
            }, { quoted: ms });
        } 
        // If none of the above, send text only
        else {
            await repondre(headerMessage + fullMenu);
        }

        // Send background music after menu
        await zk.sendMessage(dest, {
            audio: { url: musicUrl },
            mimetype: 'audio/mp4',
            ptt: false
        }, { quoted: ms });

    } catch (error) {
        console.log("🥵🥵 Menu error: " + error);
        repondre("🥵🥵 Menu error: " + error);
    }
});
