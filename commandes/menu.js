const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

// Channel URL - Your WhatsApp channel
const CHANNEL_URL = "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X";

// Emoji mapping for categories
const categoryEmojis = {
    "general": "⚡",
    "ai": "🤖",
    "downloader": "📥",
    "group": "👥",
    "owner": "👑",
    "education": "📚",
    "fun": "🎮",
    "tools": "🛠️",
    "media": "🎵",
    "converter": "🔄",
    "economy": "💰",
    "game": "🎯",
    "mods": "🔧",
    "nsfw": "🔞",
    "user": "👤",
    "admin": "👮",
    "info": "ℹ️",
    "news": "📰",
    "sticker": "🎨",
    "search": "🔍",
    "edit": "✏️"
};

// Default emoji
const defaultEmoji = "📁";

zokou({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../framework/zokou");
    
    var coms = {};
    var mode = (s.MODE.toLowerCase() === "yes") ? "PUBLIC" : "PRIVATE";
    var botName = s.BOT_NAME || "HEROKU-BT";

    // Organize commands by category
    cm.map((com) => {
        if (!coms[com.categorie]) coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    // Sort commands within each category
    for (let cat in coms) {
        coms[cat].sort();
    }

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

    // ========== HEADER SECTION (ENGLISH) ==========
    let menuMsg = `╭━━━ *『 ${botName} 』* ━━━╮\n`;
    menuMsg += `┃ 👋 *HELLO*, ${nomAuteurMessage}!\n`;
    menuMsg += `┣━━━━━━━━━━━━━━━━━━━━\n`;
    menuMsg += `┃ 📊 *SYSTEM INFORMATION*\n`;
    menuMsg += `┃ ├─ 💻 Platform: *${os.platform()}*\n`;
    menuMsg += `┃ ├─ ⚙️ Architecture: *${os.arch()}*\n`;
    menuMsg += `┃ ├─ 🖥️ Hostname: *${os.hostname()}*\n`;
    menuMsg += `┃ ├─ 💾 RAM Used: *${memoryUsed}MB*\n`;
    menuMsg += `┃ ╰─ ⏱️ Uptime: *${hours}h ${minutes}m ${seconds}s*\n`;
    menuMsg += `┣━━━━━━━━━━━━━━━━━━━━\n`;
    menuMsg += `┃ ⚙️ *BOT STATUS*\n`;
    menuMsg += `┃ ├─ 🔘 Mode: *${mode}*\n`;
    menuMsg += `┃ ├─ 🚀 Prefix: *[ ${prefixe} ]*\n`;
    menuMsg += `┃ ├─ ⏰ Time: *${temps}*\n`;
    menuMsg += `┃ ├─ 📅 Date: *${date}*\n`;
    menuMsg += `┃ ├─ 👥 Users: *${global.db?.users?.length || 0}*\n`;
    menuMsg += `┃ ╰─ 👥 Groups: *${global.db?.groups?.length || 0}*\n`;
    menuMsg += `┣━━━━━━━━━━━━━━━━━━━━\n`;
    menuMsg += `┃ ${readMore}\n`;
    menuMsg += `┃ 📋 *COMMANDS MENU* 📋\n`;
    menuMsg += `┣━━━━━━━━━━━━━━━━━━━━\n`;

    // ========== COMMANDS SECTION (ENGLISH) ==========
    
    // Sort categories with priority
    const sortedCategories = Object.keys(coms).sort((a, b) => {
        // Priority categories first
        const priority = ["general", "ai", "downloader", "group", "owner"];
        const aIndex = priority.indexOf(a.toLowerCase());
        const bIndex = priority.indexOf(b.toLowerCase());
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b);
    });
    
    for (const cat of sortedCategories) {
        // Skip empty categories
        if (coms[cat].length === 0) continue;
        
        // Get category emoji
        const catLower = cat.toLowerCase();
        const categoryEmoji = categoryEmojis[catLower] || defaultEmoji;
        
        // Category header in English
        menuMsg += `┃ ${categoryEmoji} *${cat.toUpperCase()}* [${coms[cat].length}]\n`;
        
        // Display commands in columns (4 per line)
        let cmdLine = "┃   ";
        coms[cat].forEach((cmd, index) => {
            cmdLine += `▸ ${prefixe}${cmd} `;
            if ((index + 1) % 4 === 0 && index !== coms[cat].length - 1) {
                menuMsg += cmdLine + "\n";
                cmdLine = "┃   ";
            }
        });
        
        // Add remaining commands
        if (cmdLine !== "┃   ") {
            menuMsg += cmdLine + "\n";
        }
        menuMsg += `┃ \n`;
    }

    // ========== POPULAR COMMANDS SECTION ==========
    menuMsg += `┃ ⭐ *POPULAR COMMANDS*\n`;
    menuMsg += `┃   `;
    const popularCmds = ["gpt", "dalle", "ping", "alive", "yt", "tiktok", "sticker", "play"];
    popularCmds.forEach((cmd, i) => {
        menuMsg += `▸ ${prefixe}${cmd} `;
        if ((i + 1) % 4 === 0 && i !== popularCmds.length - 1) {
            menuMsg += "\n┃   ";
        }
    });
    menuMsg += `\n┃ \n`;

    // ========== HOW TO USE ==========
    menuMsg += `┃ 📝 *HOW TO USE*\n`;
    menuMsg += `┃   ▸ Type commands in English\n`;
    menuMsg += `┃   ▸ Example: ${prefixe}gpt How are you?\n`;
    menuMsg += `┃   ▸ Bot will respond in English\n`;
    menuMsg += `┃ \n`;

    // ========== FOOTER SECTION ==========
    menuMsg += `┣━━━━━━━━━━━━━━━━━━━━\n`;
    menuMsg += `┃ 📢 *JOIN OUR CHANNEL*\n`;
    menuMsg += `┃    Get latest updates & news\n`;
    menuMsg += `┃ 🔗 ${CHANNEL_URL}\n`;
    menuMsg += `╰━━━━━━━━━━━━━━━━━━━━\n\n`;
    menuMsg += `_© ${botName} - Made with 💚_\n`;
    menuMsg += `_Total commands: ${cm.length}_`;

    // Image URL
    let imageUrl = "https://files.catbox.moe/zotx9t.jpg";

    try {
        // Send with buttons - VIEW CHANNEL button now works directly!
        await zk.sendMessage(dest, { 
            image: { url: imageUrl }, 
            caption: menuMsg,
            footer: `📊 ${botName} | ${temps} | ${date}`,
            buttons: [
                {
                    buttonId: "channel_btn",
                    buttonText: { displayText: "📢 VIEW CHANNEL" },
                    type: 4, // Type 4 = URL button
                    url: CHANNEL_URL // Your channel URL - opens directly when clicked
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
        
        // Fallback: Send without buttons if error occurs
        try {
            await zk.sendMessage(dest, { 
                image: { url: imageUrl }, 
                caption: menuMsg
            }, { quoted: ms });
        } catch (err) {
            repondre("❌ Error: " + e);
        }
    }
});
