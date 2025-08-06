const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)

zokou({ nomCom: "git", categorie: "General" }, async (dest, zk, commandeOptions) => {
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
╔════════════════╗  
  🚀 *REPOS & GROUPS* 🚀  
╚════════════════╝  
  
📢 *CHANNEL*  
➤ https://whatsapp.com/channel/0029VanspvdLtOj55DG0t82Y  
  
👥 *GROUP*  
➤ https://chat.whatsapp.com/BO1RVKMAatT7QldEGMvhYd  
  
💻 *REPO*  
➤ https://github.com/KYPHER26/KYPHER_XMD  
  
▶️ *YOUTUBE*  
➤ https://www.youtube.com/@Kypher_tech  
  
═══════════════════════  
🎨 *DESIGNED BY*  
✞𓊈𒆜 _𝐊𝐘𝚸𝚮𝚵𝚪_𒆜𓊉 ✞  
═══════════════════════  
  
🔔 *Stay Connected!*  
💬 _Join us for updates and exclusive content._  
  
🔥 *DON’T FORGET TO:*  
➤ Star the repo ⭐  
➤ FOLLOW WAchannel 🔔  
➤ Share with friends \n
  `;
    
let menuMsg = `
     CREATED BY 𓊈𒆜 _𝐊𝐘𝚸𝚮𝚵𝚪_TECH_SUPPORT𒆜𓊉

❒────────────────────❒`;

   var lien = mybotpic();

   if (lien.match(/\.(mp4|gif)$/i)) {
    try {
        zk.sendMessage(dest, { video: { url: lien }, caption:infoMsg + menuMsg, footer: "Je suis *Beltahmd*, déveloper Beltah Tech" , gifPlayback : true }, { quoted: ms });
    }
    catch (e) {
        console.log("🥵🥵 Menu erreur " + e);
        repondre("🥵🥵 Menu erreur " + e);
    }
} 
// Vérification pour .jpeg ou .png
else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
    try {
        zk.sendMessage(dest, { image: { url: lien }, caption:infoMsg + menuMsg, footer: "Je suis *Beltahmd*, déveloper Beltah Tech" }, { quoted: ms });
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
