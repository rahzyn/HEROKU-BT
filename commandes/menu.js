const util = require('util');
const fs = require('fs-extra');
const { zokou } = require("../framework/zokou");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

zokou({
    nomCom: "menu",
    categorie: "General",
    reaction: "📋",
    desc: "Show all available commands with buttons"
}, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic, superUser } = commandeOptions;
    let { cm } = require("../framework/zokou");
    
    var coms = {};
    var mode = "public";
    if ((s.MODE || "yes").toLocaleLowerCase() != "yes") {
        mode = "private";
    }

    // Group commands by category
    cm.map(async (com, index) => {
        if (!coms[com.categorie])
            coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    // Set timezone
    moment.tz.setDefault('Etc/GMT');
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');

    // Get system info
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const platform = os.platform();
    const arch = os.arch();
    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    // Header info message
    let infoMsg = `
╔════════════════════════════╗
║     🤖 *HEROKU-BT BOT*     ║
╚════════════════════════════╝

╭──────────────────────────────╮
│ 🔰 *BOT INFORMATION*          │
├──────────────────────────────┤
│ 👑 *Owner*    : ${s.OWNER_NAME || 'Rahmany'}
│ ⚡ *Prefix*   : [ ${prefixe || '.'} ]
│ 🌐 *Mode*     : ${mode}
│ 📅 *Date*     : ${date}
│ ⏰ *Time*     : ${temps}
│ ⏱️ *Uptime*   : ${hours}h ${minutes}m ${seconds}s
│ 💾 *Memory*   : ${memory} MB
│ 💻 *Platform* : ${platform} ${arch}
│ ✨ *Creator*  : Rahmany
╰──────────────────────────────╯
${readmore}`;

    // Build menu message
    let menuMsg = ``;

    for (const cat in coms) {
        menuMsg += `
╭──────────────────────────────╮
│ 📌 *${cat}*`;
        
        // Add commands in two columns
        let cmdList = coms[cat];
        for (let i = 0; i < cmdList.length; i += 2) {
            if (i + 1 < cmdList.length) {
                menuMsg += `
│  • ${cmdList[i].padEnd(15)} • ${cmdList[i+1]}`;
            } else {
                menuMsg += `
│  • ${cmdList[i]}`;
            }
        }
        menuMsg += `
╰──────────────────────────────╯`;
    }

    // Create buttons with CTA_URL
    const buttons = [
        {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
                display_text: "📢 JOIN CHANNEL",
                url: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
                merchant_url: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X"
            })
        },
        {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
                display_text: "📁 VIEW REPO",
                url: "https://github.com/rahzyn/HEROKU-BT",
                merchant_url: "https://github.com/rahzyn/HEROKU-BT"
            })
        },
        {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
                display_text: "💬 CONTACT OWNER",
                url: "https://wa.me/" + (s.NUMERO_OWNER || '255693629079'),
                merchant_url: "https://wa.me/" + (s.NUMERO_OWNER || '255693629079')
            })
        },
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "📋 MENU",
                id: `${prefixe || '.'}menu`
            })
        },
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "ℹ️ INFO",
                id: `${prefixe || '.'}info`
            })
        },
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "📁 REPO",
                id: `${prefixe || '.'}repo`
            })
        }
    ];

    // Footer message
    const footerMsg = `
╔══════════════════════════════╗
║  ✨ Tap buttons below!       ║
║  💝 Powered by Rahmany       ║
╚══════════════════════════════╝`;

    // Get bot image
    var lien = mybotpic ? mybotpic() : "https://files.catbox.moe/zotx9t.jpg";
    
    // Send with buttons
    try {
        if (lien && lien.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(dest, {
                image: { url: lien },
                caption: infoMsg + menuMsg + footerMsg,
                buttons: buttons,
                viewOnce: true,
                headerType: 4
            }, { quoted: ms });
        } else {
            await zk.sendMessage(dest, {
                text: infoMsg + menuMsg + footerMsg,
                buttons: buttons,
                viewOnce: true
            }, { quoted: ms });
        }
    } catch (e) {
        console.log("❌ Button menu error:", e.message);
        // Fallback to normal message
        await repondre(infoMsg + menuMsg + footerMsg);
    }
});
