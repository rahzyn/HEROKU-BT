const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)
zokou({ nomCom: "menu3", categorie: "Menu" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre ,prefixe,nomAuteurMessage,mybotpic} = commandeOptions;
    let { cm } = require(__dirname + "/../framework//zokou");
    var coms = {};
    var mode = "public";
    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }
    cm.map(async (com, index) => {
        if (!coms[com.categorie])
            coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });
    moment.tz.setDefault('Etc/GMT');
// Créer une date et une heure en GMT
const temps = moment().format('HH:mm:ss');
const date = moment().format('DD/MM/YYYY');
  let infoMsg =  `
╭▱▰「 *${s.BOT}* 」▱▰❂
┃⊛╭▰▱▰▱▰▱▰▱➻
┃⊛│◆ 𝐨𝐰𝐧𝐞𝐫 : ${s.OWNER_NAME}
┃⊛│◆ 𝐩𝐫𝐞𝐟𝐢𝐱 : [ ${s.PREFIXE} ] 
┃⊛│◆ 𝐦𝐨𝐝𝐞 : *${mode}*
┃⊛│◆ 𝐑𝐚𝐦  : 𝟴/𝟭𝟯𝟮 𝗚𝗕
┃⊛│◆ 𝐃𝐚𝐭𝐞  : *${date}* 
┃⊛│◆ 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦 : ${os.platform()}
┃⊛│◆ 𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : Rahmani
┃⊛│◆ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐞𝐬 : ${cm.length}
┃⊛│◆ 𝐓𝐡𝐞𝐦𝐞 : HEROKU-BT
┃⊛└▰▱▰▱▰▱▰▱➻
╰▱▰▱▰▱▰⊷▱▰▱▰▱❂\n${readmore}`;
    let menuMsg = `how to use😢`;
    for (const cat in coms) {
        menuMsg += `
╭▱▱▱✺ *${cat}* ✺▰▰▰⊷ 
┊│┌▰▱▰⊷•∞•⊷▱▰▱⊛
┊│┊
┌┤┊ `;for (const cmd of coms[cat]) {
          menuMsg += `          
┊│┊☆  *${cmd}*`    
        } 
        menuMsg +=`
┊│└▰▱▰⊷•∞•⊷▱▰▱⊛  
╰▰▰▰═⊷✺•∞•✺⊷═▱▱▱⊷`
    }
    menuMsg += `
> code by HEROKU-BT\n
`;
   var lien = mybotpic();
   if (lien.match(/\.(mp4|gif)$/i)) {
    try {
        zk.sendMessage(dest, { video: { url: lien }, caption:infoMsg + menuMsg, footer: "Je suis *𝐇𝐄𝐑𝐎𝐊𝐔-𝐁𝐓*, déveloper heroku" , gifPlayback : true }, { quoted: ms });
    }
    catch (e) {
       console.log("🥵🥵 Menu erreur " + e);
        repondre("🥵🥵 Menu erreur " + e);
    }
} 
// Vérification pour .jpeg ou .png
else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
    try {
        zk.sendMessage(dest, { image: { url: lien }, caption:infoMsg + menuMsg, footer: "Je suis *𝐇𝐄𝐑𝐎𝐊𝐔-𝐁𝐓*, déveloper Heroku" }, { quoted: ms });
    }
    catch (e) {
        console.log("🥵🥵 Menu erreur " + e);
        repondre("🥵🥵 Menu erreur " + e);
    }
} 
else {
    repondre(infoMsg + menuMsg);
}
});
