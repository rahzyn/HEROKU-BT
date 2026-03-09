const { zokou } = require("../framework/zokou");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");

zokou({
    nomCom: "menu",
    categorie: "General",
    reaction: "📋",
    desc: "Show all available commands with buttons"
}, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, mybotpic, superUser } = commandeOptions;
    let { cm } = require("../framework/zokou");
    
    // Group commands by category
    var coms = {
        "DOWNLOAD MENU": [],
        "GROUP MENU": [],
        "FUN MENU": [],
        "OWNER MENU": [],
        "AI MENU": [],
        "ANIME MENU": [],
        "CONVERT MENU": [],
        "OTHER MENU": [],
        "REACTIONS MENU": [],
        "MAIN MENU": []
    };
    
    // Categorize commands
    cm.forEach(com => {
        const cmd = com.nomCom;
        
        // Download Menu
        if (['facebook', 'download', 'mediafire', 'tiktok', 'twitter', 'insta', 'apk', 'img', 'pinterest', 'spotify', 'play', 'play2-10', 'audio', 'video', 'ytmp3', 'ytmp4', 'song', 'splay', 'spotifyplay'].includes(cmd)) {
            coms["DOWNLOAD MENU"].push(cmd);
        }
        // Group Menu
        else if (['grouplink', 'kickall', 'add', 'remove', 'kick', 'promote', 'demote', 'dismiss', 'revoke', 'mute', 'unmute', 'autoapprove', 'tag', 'hidetag', 'tagall', 'tagadmins'].includes(cmd)) {
            coms["GROUP MENU"].push(cmd);
        }
        // Fun Menu
        else if (['shapar', 'rate', 'insult', 'hack', 'ship', 'character', 'pickup', 'joke'].includes(cmd)) {
            coms["FUN MENU"].push(cmd);
        }
        // Owner Menu
        else if (['block', 'unblock', 'setpp', 'restart', 'shutdown', 'updatecmd', 'jid', 'gjid'].includes(cmd)) {
            coms["OWNER MENU"].push(cmd);
        }
        // AI Menu
        else if (['ai', 'gpt', 'gpt2', 'gpt3', 'gptmini', 'meta', 'bard', 'gita', 'imagine', 'imagine2', 'blackbox'].includes(cmd)) {
            coms["AI MENU"].push(cmd);
        }
        // Anime Menu
        else if (['waifu', 'neko', 'maid', 'loli', 'animegirl', 'foxgirl', 'naruto', 'dog'].includes(cmd)) {
            coms["ANIME MENU"].push(cmd);
        }
        // Convert Menu
        else if (['sticker', 'sticker2', 'emojimix', 'take', 'tomp3', 'fancy', 'tts', 'trt'].includes(cmd)) {
            coms["CONVERT MENU"].push(cmd);
        }
        // Other Menu
        else if (['timenow', 'date', 'count', 'calculate', 'flip', 'weather', 'news', 'fakechat', 'iphonechat', 'welcomeimg', 'forward', 'forwardall', 'forwardgroup', 'save'].includes(cmd)) {
            coms["OTHER MENU"].push(cmd);
        }
        // Reactions Menu
        else if (['hug', 'kiss', 'slap', 'pat', 'poke', 'cuddle', 'smile', 'wink'].includes(cmd)) {
            coms["REACTIONS MENU"].push(cmd);
        }
        // Main Menu
        else if (['ping', 'alive', 'runtime', 'owner', 'repo', 'menu'].includes(cmd)) {
            coms["MAIN MENU"].push(cmd);
        }
        // Default to OTHER MENU
        else {
            coms["OTHER MENU"].push(cmd);
        }
    });

    // Time and system info
    moment.tz.setDefault('Etc/GMT');
    const temps = moment().format('h:mm:ss A');
    const date = moment().format('M/D/YYYY');
    
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`;
    
    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const platform = os.platform();
    
    // Total commands count
    const totalCmds = cm.length;

    // Build menu text
    let menuText = `╔══════════════════╗
║  
║ ʜᴇʀᴏᴋᴜ-ʙᴛ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ
╚══════════════════╝

╔════❰ 🤖 ʙᴏᴛ ɪɴғᴏ ❱════╗
║ 👑 ᴏᴡɴᴇʀ: ${s.OWNER_NAME || 'Rahmany'}
║ 📛 ʙᴏᴛ: ${s.BOT || 'HEROKU-BT'}
║ 🔣 ᴘʀᴇғɪx: [ ${prefixe || '.'} ]
║ 📳 ᴍᴏᴅᴇ: ${(s.MODE || "yes").toLocaleLowerCase() === "yes" ? "public" : "private"}
║ ⏱️ ᴜᴘᴛɪᴍᴇ: ${uptimeStr}
║ 📚 ᴄᴍᴅs: ${totalCmds}
╚══════════════════╝

╔═════❰ 💻 sʏsᴛᴇᴍ ❱════╗
║ 🧠 ʀᴀᴍ: ${memory}ᴍʙ / ${totalMem}ɢʙ
║ 🖥️ ᴘʟᴀᴛғᴏʀᴍ: ${platform}
║ 📅 ᴅᴀᴛᴇ: ${date}
║ 🕐 ᴛɪᴍᴇ: ${temps}
╚══════════════════╝`;

    // Add each category
    const categories = [
        "DOWNLOAD MENU", "GROUP MENU", "FUN MENU", "OWNER MENU", 
        "AI MENU", "ANIME MENU", "CONVERT MENU", "OTHER MENU", 
        "REACTIONS MENU", "MAIN MENU"
    ];
    
    categories.forEach(cat => {
        if (coms[cat] && coms[cat].length > 0) {
            menuText += `\n\n╔══❰ 📥 ${cat} ❱══╗\n║`;
            
            // Add commands in groups
            let lastSubcat = "";
            coms[cat].forEach(cmd => {
                // Check if this is a subcategory
                if (cat === "DOWNLOAD MENU") {
                    if (['facebook', 'download', 'mediafire', 'tiktok', 'twitter', 'insta', 'apk', 'img', 'pinterest'].includes(cmd) && lastSubcat !== "social") {
                        menuText += `\n║\n║ 🌐 sᴏᴄɪᴀʟ ᴍᴇᴅɪᴀ`;
                        lastSubcat = "social";
                    } else if (['spotify', 'play', 'play2-10', 'audio', 'video', 'ytmp3', 'ytmp4', 'song', 'splay', 'spotifyplay'].includes(cmd) && lastSubcat !== "music") {
                        menuText += `\n║\n║ 🎵 ᴍᴜsɪᴄ/ᴠɪᴅᴇᴏ`;
                        lastSubcat = "music";
                    }
                } else if (cat === "GROUP MENU") {
                    if (['grouplink', 'kickall', 'add', 'remove', 'kick'].includes(cmd) && lastSubcat !== "management") {
                        menuText += `\n║\n║ 🔧 ᴍᴀɴᴀɢᴇᴍᴇɴᴛ`;
                        lastSubcat = "management";
                    } else if (['promote', 'demote', 'dismiss', 'revoke', 'mute', 'unmute', 'autoapprove'].includes(cmd) && lastSubcat !== "admin") {
                        menuText += `\n║\n║ ⚡ ᴀᴅᴍɪɴ ᴛᴏᴏʟs`;
                        lastSubcat = "admin";
                    } else if (['tag', 'hidetag', 'tagall', 'tagadmins'].includes(cmd) && lastSubcat !== "tagging") {
                        menuText += `\n║\n║ 🏷️ ᴛᴀɢɢɪɴɢ`;
                        lastSubcat = "tagging";
                    }
                }
                
                menuText += `\n║ * .${cmd}`;
            });
            
            menuText += `\n║\n╚══════════════════╝`;
        }
    });

    // Footer
    menuText += `\n\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${s.OWNER_NAME || 'Rahmany'}*`;

    // Create buttons (3 buttons)
    const buttons = [
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "🤖 GPT",
                id: `${prefixe || '.'}gpt`
            })
        },
        {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
                display_text: "📢 VIEW CHANNEL",
                url: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
                merchant_url: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X"
            })
        },
        {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
                display_text: "📁 REPO",
                url: "https://github.com/rahzyn/HEROKU-BT",
                merchant_url: "https://github.com/rahzyn/HEROKU-BT"
            })
        }
    ];

    // Get bot image
    var lien = mybotpic ? mybotpic() : "https://files.catbox.moe/zotx9t.jpg";
    
    // Send with image and buttons
    try {
        if (lien && lien.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(dest, {
                image: { url: lien },
                caption: menuText,
                buttons: buttons,
                viewOnce: true,
                headerType: 4
            }, { quoted: ms });
        } else {
            await zk.sendMessage(dest, {
                text: menuText,
                buttons: buttons,
                viewOnce: true
            }, { quoted: ms });
        }
    } catch (e) {
        console.log("❌ Button menu error:", e.message);
        // Fallback to normal message without buttons
        if (lien && lien.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(dest, { 
                image: { url: lien }, 
                caption: menuText
            }, { quoted: ms });
        } else {
            await repondre(menuText);
        }
    }
});
