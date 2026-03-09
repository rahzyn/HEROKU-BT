const { zokou } = require("../framework/zokou");

zokou({
  nomCom: "repo",
  categorie: "General",
  reaction: "📁",
  desc: "Get bot repository link"
}, async (dest, zk, commandeOptions) => {
  const { repondre } = commandeOptions;
  
  const repoMessage = `╔════════════════════════════╗
║       📁 HEROKU-BT REPO 📁       ║
╠════════════════════════════╣
║                                   
║  📌 *REPOSITORY INFORMATION*      
║  • 📁 Name: HEROKU-BT             
║  • 👑 Owner: @Rahmany             
║  • ⭐ Stars: ★★★★★ (5)            
║  • 🔄 Forks: ⑂ 100+               
║                                   
║  🔗 *DIRECT LINK:*                 
║  https://github.com/rahzyn/       
║  HEROKU-BT                        
║                                   
║  📦 *PAIR CODE:*                   
║  https://heroku-pair.onrender.com/
║                                   
║  📢 *CHANNEL:*                     
║  https://whatsapp.com/channel/    
║  0029VatokI45EjxufALmY32X         
║                                   
║  💬 *OWNER:*                       
║  https://wa.me/255693629079        
║                                   
║  ✨ *QR CODE:*                     
║  https://quickchart.io/qr?text=    
║  https://github.com/rahzyn/        
║  HEROKU-BT&size=200               
║                                   
╚════════════════════════════╝
     Powered with ❤️ by Rahmany`;

  await repondre(repoMessage);
});
