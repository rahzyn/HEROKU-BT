
const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

// Channel URL - Badilisha na channel yako
const CHANNEL_URL = "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X"; // 🔴 WEKA CHANNEL URL YAKO HAPA

zokou({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../framework/zokou");
    var coms = {};
    var mode = (s.MODE.toLowerCase() === "yes") ? "PUBLIC" : "PRIVATE";
    var botName = s.BOT_NAME || "HEROKU-BT";

    cm.map((com) => {
        if (!coms[com.categorie]) coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');
    
    // System stats
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

    // Menu Header - Design ya kuvutia
    let infoMsg = `╭━━━ *『 ${botName} 』* ━━━╮\n`;
    infoMsg += `┃ 👋 *HELLOW*, ${nomAuteurMessage}!*\n`;
    infoMsg += `┣━━━━━━━━━━━━━━━━━━━━\n`;
    infoMsg += `┃ 📊 *SYSTEM INFO*\n`;
    infoMsg += `┃ ├─ 💻 Platform: *${os.platform()}*\n`;
    infoMsg += `┃ ├─ ⚙️ Arch: *${os.arch()}*\n`;
    infoMsg += `┃ ├─ 🖥️ Host: *${os.hostname()}*\n`;
    infoMsg += `┃ ├─ 💾 RAM: *${memoryUsed}MB*\n`;
    infoMsg += `┃ ╰─ ⏱️ Uptime: *${hours}h ${minutes}m ${seconds}s*\n`;
    infoMsg += `┣━━━━━━━━━━━━━━━━━━━━\n`;
    infoMsg += `┃ ⚙️ *BOT STATUS*\n`;
    infoMsg += `┃ ├─ 🔘 Mode: *${mode}*\n`;
    infoMsg += `┃ ├─ 🚀 Prefix: *[ ${prefixe} ]*\n`;
    infoMsg += `┃ ├─ ⏰ Time: *${temps}*\n`;
    infoMsg += `┃ ├─ 📅 Date: *${date}*\n`;
    infoMsg += `┃ ├─ 👥 Users: *${global.db?.users?.length || 0}*\n`;
    infoMsg += `┃ ╰─ 👥 Groups: *${global.db?.groups?.length || 0}*\n`;
    infoMsg += `┣━━━━━━━━━━━━━━━━━━━━\n`;
    infoMsg += `┃ ${readMore}\n`;
    infoMsg += `┃ 📋 *COMMAND MENU* 📋\n`;
    infoMsg += `┣━━━━━━━━━━━━━━━━━━━━\n`;

    let menuMsg = ``;

    // Sorting categories
    const sortedCategories = Object.keys(coms).sort();
    
    for (const cat of sortedCategories) {
        // Category header with emoji
        let categoryEmoji = "📁";
        if (cat.toLowerCase().includes("ai")) categoryEmoji = "🤖";
        else if (cat.toLowerCase().includes("down")) categoryEmoji = "📥";
        else if (cat.toLowerCase().includes("group")) categoryEmoji = "👥";
        else if (cat.toLowerCase().includes("general")) categoryEmoji = "⚡";
        else if (cat.toLowerCase().includes("owner")) categoryEmoji = "👑";
        
        menuMsg += `┃ ${categoryEmoji} *${cat.toUpperCase()}*\n`;
        
        // Commands in category (max 4 per line for better display)
        let cmdLine = "┃   ";
        coms[cat].forEach((cmd, index) => {
            cmdLine += `🔸 ${cmd} `;
            if ((index + 1) % 4 === 0 && index !== coms[cat].length - 1) {
                menuMsg += cmdLine + "\n";
                cmdLine = "┃   ";
            }
        });
        if (cmdLine !== "┃   ") {
            menuMsg += cmdLine + "\n";
        }
        menuMsg += `┃ \n`;
    }

    // Featured commands section
    menuMsg += `┃ ✨ *FEATURED COMMANDS*\n`;
    menuMsg += `┃   🔹 ${prefixe}gpt  🔹 ${prefixe}dall\n`;
    menuMsg += `┃   🔹 ${prefixe}ping  🔹 ${prefixe}alive\n`;
    menuMsg += `┃   🔹 ${prefixe}yt    🔹 ${prefixe}tiktok\n`;
    menuMsg += `┃ \n`;

    // Footer with channel CTA
    menuMsg += `┣━━━━━━━━━━━━━━━━━━━━\n`;
    menuMsg += `┃ 📢 *FOLLOW OUR CHANNEL*\n`;
    menuMsg += `┃ 👇 Bofya button chini\n`;
    menuMsg += `╰━━━━━━━━━━━━━━━━━━━━\n\n`;
    menuMsg += `_© ${botName} - Developed by The Best!_`;

    // Image URL (badilisha na image yako)
    let imageUrl = "https://files.catbox.moe/zotx9t.jpg";

    try {
        // Send as media with buttons
        await zk.sendMessage(dest, { 
            image: { url: imageUrl }, 
            caption: infoMsg + menuMsg,
            footer: `📊 ${botName} | ${temps} | ${date}`,
            buttons: [
                {
                    buttonId: "channel_btn",
                    buttonText: { displayText: "📢 VIEW CHANNEL" },
                    type: 1,
                    url: CHANNEL_URL
                },
                {
                    buttonId: `${prefixe}gpt`,
                    buttonText: { displayText: "🤖 GPT" },
                    type: 1
                },
                {
                    buttonId: `${prefixe}ping`,
                    buttonText: { displayText: "⚡ PING" },
                    type: 1
                },
                {
                    buttonId: `${prefixe}alive`,
                    buttonText: { displayText: "💚 ALIVE" },
                    type: 1
                }
            ],
            headerType: 4
        }, { quoted: ms });
        
    } catch (e) {
        console.log("❌ Menu error: " + e);
        
        // Fallback: Send without buttons if error
        try {
            await zk.sendMessage(dest, { 
                image: { url: imageUrl }, 
                caption: infoMsg + menuMsg + `\n\n📢 *CHANNEL:* ${CHANNEL_URL}`
            }, { quoted: ms });
        } catch (err) {
            repondre("❌ Menu error: " + e);
        }
    }
});

// Optional: Channel command to directly get channel link
zokou({ nomCom: "channel", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre } = commandeOptions;
    
    const channelMsg = `📢 *OFFICIAL CHANNEL*\n\n` +
                      `Join our WhatsApp channel for:\n` +
                      `✅ Latest updates\n` +
                      `✅ New features\n` +
                      `✅ Bot news\n` +
                      `✅ Giveaways\n\n` +
                      `🔗 *Link:* ${CHANNEL_URL}\n\n` +
                      `_Click the button below to join!_`;
    
    await zk.sendMessage(dest, {
        text: channelMsg,
        buttons: [
            {
                buttonId: "join_channel",
                buttonText: { displayText: "📢 JOIN CHANNEL" },
                type: 1,
                url: CHANNEL_URL
            }
        ],
        footer: "© HEROKU-BT"
    }, { quoted: ms });
});
