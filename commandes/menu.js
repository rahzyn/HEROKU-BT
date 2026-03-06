const {
  zokou
} = require(__dirname + "/../framework/zokou");
const {
  format
} = require(__dirname + "/../framework/mesfonctions");
const os = require('os');
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const axios = require('axios');

zokou({
  'nomCom': "menu",
  'categorie': "Menu",
  'reaction': "✨"
}, async (_0x160fc2, _0x219205, _0xe5791b) => {
  let {
    ms: _0xb19de,
    repondre: _0x41afad,
    prefixe: _0x14d418,
    nomAuteurMessage: _0x11cbde,
    mybotpic: _0xd7082a,
    auteurMessage
  } = _0xe5791b;
  
  let {
    cm: _0x256458
  } = require(__dirname + "/../framework/zokou");
  
  let _0x199ed8 = {};
  let _0x15c89f = "🔓 Public";
  if (s.MODE.toLowerCase() !== "yes") {
    _0x15c89f = "🔒 Private";
  }
  
  // Group commands by category
  _0x256458.map(_0x3a2d5b => {
    if (!_0x199ed8[_0x3a2d5b.categorie]) {
      _0x199ed8[_0x3a2d5b.categorie] = [];
    }
    _0x199ed8[_0x3a2d5b.categorie].push(_0x3a2d5b.nomCom);
  });
  
  // Time greeting
  moment.tz.setDefault("Africa/Dar_es_Salaam");
  const _0x4c271f = moment().hour();
  let _0x57980c = "🌅 Good Morning";
  if (_0x4c271f >= 12 && _0x4c271f < 16) {
    _0x57980c = "☀️ Good Afternoon";
  } else if (_0x4c271f >= 16 && _0x4c271f < 19) {
    _0x57980c = "🌤️ Good Evening";
  } else if (_0x4c271f >= 19 || _0x4c271f < 5) {
    _0x57980c = "🌙 Good Night";
  }
  
  // Date and time
  moment.tz.setDefault("Africa/Dar_es_Salaam");
  const _0x483331 = moment().format("DD/MM/YYYY");
  const currentTime = moment().format("HH:mm:ss");
  
  // System info
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const uptimeString = `${hours}h ${minutes}m ${seconds}s`;
  
  // Bot info
  const botName = s.BOT_NAME || "HEROKU-BT";
  const ownerName = s.OWNER_NAME || "Rahmany";
  const totalCommands = _0x256458.length;
  const totalCategories = Object.keys(_0x199ed8).length;
  
  // Stylish Header
  let menuText = `╭─────────────────⊷
│     ✦ *${botName} MENU* ✦
╰─────────────────⊷

┏━━━━━━━━━━━━━━━━━━━┓
┃ *👋 Hello, ${_0x11cbde || 'User'}!*
┃ *${_0x57980c}*
┗━━━━━━━━━━━━━━━━━━━┛

╭───『 *🤖 BOT INFO* 』───⊷
│ ✦ *Owner*    : ${ownerName}
│ ✦ *Prefix*   : 「 ${s.PREFIXE} 」
│ ✦ *Mode*     : ${_0x15c89f}
│ ✦ *Commands* : ${totalCommands}
│ ✦ *Category* : ${totalCategories}
╰─────────────────⊷

╭───『 *📊 SYSTEM INFO* 』───⊷
│ ✦ *Date*     : ${_0x483331}
│ ✦ *Time*     : ${currentTime}
│ ✦ *Platform* : ${os.platform()}
│ ✦ *Uptime*   : ${uptimeString}
│ ✦ *RAM*      : ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
│ ✦ *Node*     : ${process.version}
╰─────────────────⊷\n\n`;

  // Commands by category - Styled
  let commandsSection = `╭───『 *📋 COMMANDS LIST* 』───⊷\n`;
  
  // Emoji mapping for categories
  const categoryEmojis = {
    "Menu": "📌",
    "Main": "🏠",
    "Group": "👥",
    "Admin": "👑",
    "Owner": "⚡",
    "Download": "📥",
    "Search": "🔍",
    "Tools": "🛠️",
    "Fun": "🎮",
    "Game": "🎲",
    "Economy": "💰",
    "Education": "📚",
    "News": "📰",
    "Religion": "🕋",
    "AI": "🤖",
    "Convert": "🔄",
    "Maker": "✨",
    "Sticker": "🏷️",
    "Audio": "🎵",
    "Video": "🎬",
    "Photo": "📷",
    "Wallpaper": "🖼️",
    "NSFW": "🔞"
  };
  
  for (const category in _0x199ed8) {
    const emoji = categoryEmojis[category] || "📁";
    commandsSection += `\n╭───『 ${emoji} *${category}* 』───⊷\n`;
    
    // Display commands in columns (3 per row for better visibility)
    const commands = _0x199ed8[category];
    let row = "│ ";
    
    for (let i = 0; i < commands.length; i++) {
      row += `✦ ${commands[i]} `;
      
      // Every 3 commands or at the end, add newline
      if ((i + 1) % 3 === 0 || i === commands.length - 1) {
        commandsSection += row + "\n";
        row = "│ ";
      }
    }
    
    commandsSection += `╰─────────────────⊷\n`;
  }
  
  // Footer with channel info
  const footer = `\n╭─────────────────⊷
│  ✦ *Total: ${totalCommands} commands*
│  ✦ *Type: ${s.PREFIXE}help <command>*
╰─────────────────⊷

┏━━━━━━━━━━━━━━━━━━━┓
┃  *📢 OFFICIAL CHANNEL*  ┃
┃  @RAHMANI_XMD        ┃
┗━━━━━━━━━━━━━━━━━━━┛

> *Made with ❤️ by ${ownerName}*`;

  const fullMenu = menuText + commandsSection + footer;
  
  try {
    // Send menu with fancy external ad reply
    await _0x219205.sendMessage(_0x160fc2, {
      'text': fullMenu,
      'contextInfo': {
        'externalAdReply': {
          'title': `✨ ${botName} ✨`,
          'body': `⚡ ${totalCommands} Commands • ${totalCategories} Categories ⚡`,
          'thumbnailUrl': "https://files.catbox.moe/zotx9t.jpg",
          'sourceUrl': "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
          'mediaType': 1,
          'renderLargerThumbnail': true,
          'showAdAttribution': false
        },
        'forwardedNewsletterMessageInfo': {
          'newsletterJid': "120363353854480831@newsletter",
          'newsletterName': "RAHMANI XMD",
          'serverMessageId': -1
        }
      }
    });
    
    // Send audio with delay
    setTimeout(async () => {
      try {
        await _0x219205.sendMessage(_0x160fc2, {
          'audio': {
            'url': "https://files.catbox.moe/4jedgr.mp3"
          },
          'mimetype': "audio/mpeg",
          'ptt': true
        });
      } catch (audioError) {
        console.log("Audio error:", audioError);
      }
    }, 1000);
    
    // Try to send a welcome sticker if available
    try {
      const stickerUrl = "https://files.catbox.moe/zotx9t.jpg"; // Replace with sticker URL
      await _0x219205.sendMessage(_0x160fc2, {
        'sticker': { 'url': stickerUrl },
        'contextInfo': {
          'forwardedNewsletterMessageInfo': {
            'newsletterJid': "120363353854480831@newsletter",
            'newsletterName': "RAHMANI XMD",
            'serverMessageId': -1
          }
        }
      });
    } catch (stickerError) {
      // Ignore sticker error
    }
    
  } catch (error) {
    console.log("Menu Error:", error);
    // Fallback to simple menu
    let simpleMenu = `*✨ ${botName} MENU ✨*\n\n`;
    simpleMenu += `👋 Hello ${_0x11cbde || 'User'}!\n`;
    simpleMenu += `📌 Prefix: ${s.PREFIXE}\n`;
    simpleMenu += `📊 Commands: ${totalCommands}\n\n`;
    
    for (const category in _0x199ed8) {
      simpleMenu += `*${category}:*\n`;
      simpleMenu += _0x199ed8[category].map(cmd => `✦ ${cmd}`).join('\n') + '\n\n';
    }
    
    simpleMenu += `> Made by ${ownerName}`;
    await _0x219205.sendMessage(_0x160fc2, { 'text': simpleMenu }, { quoted: _0xb19de });
  }
});
