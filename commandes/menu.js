function hi() {
  const _0x7a9ca6 = function () {
    let _0x112a24 = true;
    return function (_0x10879e, _0x2a31dc) {
      const _0x3d34e8 = _0x112a24 ? function () {
        if (_0x2a31dc) {
          const _0x453637 = _0x2a31dc.apply(_0x10879e, arguments);
          _0x2a31dc = null;
          return _0x453637;
        }
      } : function () {};
      _0x112a24 = false;
      return _0x3d34e8;
    };
  }();
  const _0xd91cfd = _0x7a9ca6(this, function () {
    return _0xd91cfd.toString().search("(((.+)+)+)+$").toString().constructor(_0xd91cfd).search('(((.+)+)+)+$');
  });
  _0xd91cfd();
  const _0x13d56b = function () {
    let _0x24749b = true;
    return function (_0x15cd90, _0x369108) {
      const _0x44e083 = _0x24749b ? function () {
        if (_0x369108) {
          const _0x4c1743 = _0x369108.apply(_0x15cd90, arguments);
          _0x369108 = null;
          return _0x4c1743;
        }
      } : function () {};
      _0x24749b = false;
      return _0x44e083;
    };
  }();
  const _0x3a85b5 = _0x13d56b(this, function () {
    let _0x14bc63;
    try {
      const _0x16c702 = Function("return (function() {}.constructor(\"return this\")( ));");
      _0x14bc63 = _0x16c702();
    } catch (_0x290978) {
      _0x14bc63 = window;
    }
    const _0x5cddb0 = _0x14bc63.console = _0x14bc63.console || {};
    const _0x6e73ea = ['log', "warn", 'info', "error", 'exception', "table", "trace"];
    for (let _0x299582 = 0x0; _0x299582 < _0x6e73ea.length; _0x299582++) {
      const _0x1921b6 = _0x13d56b.constructor.prototype.bind(_0x13d56b);
      const _0x191b13 = _0x6e73ea[_0x299582];
      const _0x183bab = _0x5cddb0[_0x191b13] || _0x1921b6;
      _0x1921b6.__proto__ = _0x13d56b.bind(_0x13d56b);
      _0x1921b6.toString = _0x183bab.toString.bind(_0x183bab);
      _0x5cddb0[_0x191b13] = _0x1921b6;
    }
  });
  _0x3a85b5();
  console.log("Hello World!");
}
hi();

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
            fullMenu += `\n││▸ ${prefixe}${cmd}`;
        }
        fullMenu += `\n╰───────────────▸▸ \n`;
    }
    
    fullMenu += `\n> BOT CREATED BY Rahmani\n`;

    const pingTime = Math.floor(Math.random() * 100) + 1;

    try {
        // Send audio with menu information in externalAdReply
        await zk.sendMessage(dest, {
            audio: { url: 'https://files.catbox.moe/uv6fb5.mp3' },
            mimetype: "audio/mp4",
            ptt: true,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363353854480831@newsletter",
                    newsletterName: "Rahman",
                    serverMessageId: 0x8f
                },
                forwardingScore: 999,
                externalAdReply: {
                    title: "🤖 HEROKU-BOT MENU",
                    body: `⚡ Commands: ${cm.length} | 📊 RAM: ${format(os.totalmem() - os.freemem())}\n📅 Date: ${currentDate} | ⏰ Time: ${currentTime}`,
                    thumbnailUrl: "https://files.catbox.moe/zotx9t.jpg",
                    mediaType: 1,
                    renderSmallThumbnail: true
                }
            }
        }, { quoted: ms });

        // Send the full menu as text after the audio
        await zk.sendMessage(dest, {
            text: headerMessage + fullMenu,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363353854480831@newsletter",
                    newsletterName: "Rahman",
                    serverMessageId: 0x8f
                },
                forwardingScore: 999
            }
        }, { quoted: ms });

    } catch (error) {
        console.log("🥵🥵 Menu error: " + error);
        repondre("❌ Menu Error: " + error.message);
    }
});
