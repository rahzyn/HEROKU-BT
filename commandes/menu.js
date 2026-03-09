const { zokou } = require("../framework/zokou");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");

zokou({
    nomCom: "menu",
    categorie: "General",
    reaction: "🤠",
    desc: "Show all available commands"
}, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, mybotpic, superUser, nomAuteurMessage } = commandeOptions;
    let { cm } = require("../framework/zokou");
    
    // Time and system info
    moment.tz.setDefault('Etc/GMT');
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');
    
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
    
    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const platform = os.platform();
    const arch = os.arch();
    const hostname = os.hostname();
    
    // Mode
    const mode = (s.MODE || "yes").toLocaleLowerCase() === "yes" ? "PUBLIC" : "PRIVATE";
    
    // Total commands count
    const totalCmds = cm.length;
    
    // Group commands by category
    const generalCmds = [];
    const aiCmds = [];
    const groupCmds = [];
    const ownerCmds = [];
    const audioEditCmds = [];
    const conversionCmds = [];
    const downloadCmds = [];
    const footballCmds = [];
    const funCmds = [];
    const godFirstCmds = [];
    const hentaiCmds = [];
    const herokuCmds = [];
    const herokuClientCmds = [];
    const iaCmds = [];
    const menuCmds = [];
    const modsCmds = [];
    const newsCmds = [];
    const picsCmds = [];
    const reactionCmds = [];
    const rechercheCmds = [];
    const searchCmds = [];
    const stickcmdCmds = [];
    const ttsCmds = [];
    const userCmds = [];
    
    // Categorize commands
    cm.forEach(com => {
        const cmd = com.nomCom;
        
        // General
        if (['about', 'alive', 'antibug', 'antidelete', 'areact', 'calc', 'channel', 'channel1', 'dev', 'developer', 'getall', 'go', 'group1', 'heroku', 'inspire', 'love', 'mail', 'me', 'menu', 'menu3', 'number', 'owner', 'pair', 'ping', 'problem', 'rahmani', 'repo', 'rtime', 'script', 'ss', 'support', 'test', 'time', 'uptime', 'vision', 'vv', 'vv2'].includes(cmd)) {
            generalCmds.push(cmd);
        }
        // AI
        else if (['gpt', 'bard', 'dalle', 'gemini', 'gpt4'].includes(cmd)) {
            aiCmds.push(cmd);
        }
        // Group
        else if (['add', 'antibot', 'antidemote', 'antilink', 'antipromote', 'automute', 'autounmute', 'del', 'demote', 'fkick', 'gdesc', 'gname', 'goodbye', 'gpp', 'group', 'hidetag', 'info', 'link', 'nsfw', 'promote', 'remove', 'tagadmin', 'tagall', 'warn', 'welcome'].includes(cmd)) {
            groupCmds.push(cmd);
        }
        // Owner
        else if (['testblock', 'block', 'unblock', 'setpp', 'restart', 'shutdown', 'updatecmd', 'jid', 'gjid'].includes(cmd)) {
            ownerCmds.push(cmd);
        }
        // Audio Edit
        else if (['bass', 'deep', 'nightcore', 'reverse', 'slow', 'smooth', 'tempo'].includes(cmd)) {
            audioEditCmds.push(cmd);
        }
        // Conversion
        else if (['photo', 'scrop', 'sticker', 'take', 'trt', 'url', 'write'].includes(cmd)) {
            conversionCmds.push(cmd);
        }
        // Download
        else if (['ytmp3', 'ytmp4', 'facebook', 'tiktok', 'twitter', 'insta', 'mediafire'].includes(cmd)) {
            downloadCmds.push(cmd);
        }
        // Football
        else if (['bundesliga_highlights', 'bundesliga_matchday', 'bundesliga_news', 'bundesliga_table', 'bundesliga_top_assist', 'bundesliga_top_scorer', 'cl_highlights', 'cl_matchday', 'cl_news', 'cl_table', 'cl_top_assist', 'cl_top_scorer'].includes(cmd)) {
            footballCmds.push(cmd);
        }
        // Fun
        else if (['advice', 'dare', 'fancy', 'insult', 'jokes', 'lines', 'status', 'trivia', 'truth', 'shapar', 'rate', 'hack', 'ship', 'character', 'pickup', 'joke'].includes(cmd)) {
            funCmds.push(cmd);
        }
        // God First
        else if (['surah'].includes(cmd)) {
            godFirstCmds.push(cmd);
        }
        // Hentai
        else if (['blowjob', 'hentaivid', 'hneko', 'hwaifu', 'trap'].includes(cmd)) {
            hentaiCmds.push(cmd);
        }
        // Heroku
        else if (['getallvar', 'getvar', 'setvar', 'botname', 'linkmenu', 'setprefix', 'settings', 'warncount'].includes(cmd)) {
            herokuCmds.push(cmd);
        }
        // Heroku Client
        else if (['alwaysonline', 'anticall', 'antidelete', 'antivv', 'autolikestatus', 'autorecord', 'autotyping', 'chatbot', 'downloadstatus', 'greet', 'pm-permit', 'privatemode', 'publicmode', 'readmessage', 'readstatus', 'startmessage'].includes(cmd)) {
            herokuClientCmds.push(cmd);
        }
        // IA
        else if (['gpt'].includes(cmd)) {
            iaCmds.push(cmd);
        }
        // Menu
        else if (['menu3'].includes(cmd)) {
            menuCmds.push(cmd);
        }
        // Mods
        else if (['left', 'restart'].includes(cmd)) {
            modsCmds.push(cmd);
        }
        // News
        else if (['technews', 'applenews', 'nasanews', 'population'].includes(cmd)) {
            newsCmds.push(cmd);
        }
        // Pics
        else if (['best-wallp', 'nature', 'random'].includes(cmd)) {
            picsCmds.push(cmd);
        }
        // Reaction
        else if (['awoo', 'bite', 'blush', 'bonk', 'bully', 'cringe', 'cry', 'cuddle', 'dance', 'glomp', 'handhold', 'happy', 'highfive', 'hug', 'kick', 'kill', 'kiss', 'lick', 'nom', 'pat', 'poke', 'slap', 'smile', 'smug', 'wave', 'wink', 'yeet'].includes(cmd)) {
            reactionCmds.push(cmd);
        }
        // Recherche
        else if (['apk'].includes(cmd)) {
            rechercheCmds.push(cmd);
        }
        // Search
        else if (['play', 'github', 'img', 'song', 'stickersearch', 'weather', 'yts'].includes(cmd)) {
            searchCmds.push(cmd);
        }
        // Stickcmd
        else if (['allcmd', 'delcmd', 'setcmd'].includes(cmd)) {
            stickcmdCmds.push(cmd);
        }
        // TTS
        else if (['dit', 'itta', 'say'].includes(cmd)) {
            ttsCmds.push(cmd);
        }
        // User
        else if (['enhance', 'pair'].includes(cmd)) {
            userCmds.push(cmd);
        }
    });

    // Build menu
    let menuText = `╭━━━ *『 HEROKU-BT 』* ━━━╮
┃ 👋 *HELLO*, ${nomAuteurMessage || 'User'}!
┣━━━━━━━━━━━━━━━━━━━━
┃ 📊 *SYSTEM INFORMATION*
┃ ├─ 💻 Platform: *${platform}*
┃ ├─ ⚙️ Architecture: *${arch}*
┃ ├─ 🖥️ Hostname: *${hostname.substring(0, 20)}*
┃ ├─ 💾 RAM Used: *${memory}MB*
┃ ╰─ ⏱️ Uptime: *${uptimeStr}*
┣━━━━━━━━━━━━━━━━━━━━
┃ ⚙️ *BOT STATUS*
┃ ├─ 🔘 Mode: *${mode}*
┃ ├─ 🚀 Prefix: *[ ${prefixe || '.'} ]*
┃ ├─ ⏰ Time: *${temps}*
┃ ├─ 📅 Date: *${date}*
┃ ├─ 👥 Users: *0*
┃ ╰─ 👥 Groups: *0*
┣━━━━━━━━━━━━━━━━━━━━
┃ 📋 *COMMANDS MENU* 📋
┣━━━━━━━━━━━━━━━━━━━━`;

    // Add each category with commands in a simple list
    if (generalCmds.length > 0) {
        menuText += `
┃ ⚡ *GENERAL* [${generalCmds.length}]`;
        generalCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (aiCmds.length > 0) {
        menuText += `
┃ 
┃ 🤖 *AI* [${aiCmds.length}]`;
        aiCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (groupCmds.length > 0) {
        menuText += `
┃ 
┃ 👥 *GROUP* [${groupCmds.length}]`;
        groupCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (ownerCmds.length > 0) {
        menuText += `
┃ 
┃ 👑 *OWNER* [${ownerCmds.length}]`;
        ownerCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (audioEditCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *AUDIO-EDIT* [${audioEditCmds.length}]`;
        audioEditCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (conversionCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *CONVERSION* [${conversionCmds.length}]`;
        conversionCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (downloadCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *DOWNLOAD* [${downloadCmds.length}]`;
        downloadCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (footballCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *FOOTBALL LIVE* [${footballCmds.length}]`;
        footballCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (funCmds.length > 0) {
        menuText += `
┃ 
┃ 🎮 *FUN* [${funCmds.length}]`;
        funCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (godFirstCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *GOD-FIRST* [${godFirstCmds.length}]`;
        godFirstCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (hentaiCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *HENTAI* [${hentaiCmds.length}]`;
        hentaiCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (herokuCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *HEROKU* [${herokuCmds.length}]`;
        herokuCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (herokuClientCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *HEROKU-CLIENT* [${herokuClientCmds.length}]`;
        herokuClientCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (iaCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *IA* [${iaCmds.length}]`;
        iaCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (menuCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *MENU* [${menuCmds.length}]`;
        menuCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (modsCmds.length > 0) {
        menuText += `
┃ 
┃ 🔧 *MODS* [${modsCmds.length}]`;
        modsCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (newsCmds.length > 0) {
        menuText += `
┃ 
┃ 📰 *NEWS* [${newsCmds.length}]`;
        newsCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (picsCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *PICS* [${picsCmds.length}]`;
        picsCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (reactionCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *REACTION* [${reactionCmds.length}]`;
        reactionCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (rechercheCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *RECHERCHE* [${rechercheCmds.length}]`;
        rechercheCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (searchCmds.length > 0) {
        menuText += `
┃ 
┃ 🔍 *SEARCH* [${searchCmds.length}]`;
        searchCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (stickcmdCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *STICKCMD* [${stickcmdCmds.length}]`;
        stickcmdCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (ttsCmds.length > 0) {
        menuText += `
┃ 
┃ 📁 *TTS* [${ttsCmds.length}]`;
        ttsCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    if (userCmds.length > 0) {
        menuText += `
┃ 
┃ 👤 *USER* [${userCmds.length}]`;
        userCmds.forEach(cmd => {
            menuText += `\n┃    -${cmd}`;
        });
    }

    // Popular commands
    const popularCmds = ['gpt', 'dalle', 'ping', 'alive', 'yt', 'tiktok', 'sticker', 'play'];
    menuText += `
┃ 
┃ ⭐ *POPULAR COMMANDS*`;
    popularCmds.forEach(cmd => {
        menuText += `\n┃    -${cmd}`;
    });

    // How to use
    menuText += `
┃ 
┃ 📝 *HOW TO USE*
┃    Type commands with prefix
┃    Example: -ping
┃    Bot will respond
┃ 
┣━━━━━━━━━━━━━━━━━━━━
┃ 📢 *JOIN OUR CHANNEL*
┃    Get latest updates & news
┃ 🔗 https://whatsapp.com/channel/0029VatokI45EjxufALmY32X
╰━━━━━━━━━━━━━━━━━━━━

_© HEROKU-BT - Made with 💚_
_Total commands: ${totalCmds}_
📊 HEROKU-BT | ${temps} | ${date}`;

    // Get bot image
    var lien = mybotpic ? mybotpic() : "https://files.catbox.moe/zotx9t.jpg";
    
    // Send with image if available
    if (lien && lien.match(/\.(jpeg|png|jpg)$/i)) {
        try {
            await zk.sendMessage(dest, { 
                image: { url: lien }, 
                caption: menuText
            }, { quoted: ms });
        } catch (e) {
            await repondre(menuText);
        }
    } else {
        await repondre(menuText);
    }
});
