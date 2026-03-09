const { zokou } = require("../framework/zokou");

zokou({
  nomCom: "menu",
  categorie: "General",
  reaction: "📋",
  desc: "Show all available commands"
}, async (dest, zk, commandeOptions) => {
  const { repondre, superUser } = commandeOptions;
  
  const menuMessage = `╔══════════════════════════════════╗
║       🤖 HEROKU-BT MENU 🤖       ║
╠══════════════════════════════════╣
║                                   
║  📌 *GENERAL COMMANDS*            
║  ──────────────────────────────
║  • .menu - Show this menu
║  • .info - Bot information
║  • .repo - Repository link
║  • .ping - Check bot response
║  • .alive - Check bot status
║                                   
║  📌 *GROUP COMMANDS*               
║  ──────────────────────────────
║  • .add [number] - Add user
║  • .kick @user - Remove user
║  • .promote @user - Make admin
║  • .demote @user - Remove admin
║  • .group open - Open group
║  • .group close - Close group
║  • .invite - Get group link
║                                   
║  📌 *ANTI-DELETE COMMANDS*         
║  ──────────────────────────────
║  • .antidelete on - Enable
║  • .antidelete off - Disable
║                                   
║  📌 *ANTILINK COMMANDS*            
║  ──────────────────────────────
║  • .antilink on - Enable
║  • .antilink off - Disable
║  • .antilink action warn|remove|delete
║  • .antilink warncount [number]
║  • .antilink resetwarn @user
║  • .antilink status
║                                   
║  📌 *ANTIBUG COMMANDS*             
║  ──────────────────────────────
║  • .antibug on - Enable
║  • .antibug off - Disable
║                                   
║  📌 *OWNER COMMANDS*               ${superUser ? '✅' : '❌'}
║  ──────────────────────────────
║  • .ban @user - Ban user
║  • .unban @user - Unban user
║  • .banlist - List banned users
║  • .addsudo [number] - Add sudo user
║  • .delsudo [number] - Remove sudo
║  • .sudo - List sudo users
║  • .bc - Broadcast message
║  • .update - Update bot
║                                   
║  📌 *LEVEL SYSTEM*                 
║  ──────────────────────────────
║  • .rank - Your level
║  • .leaderboard - Top users
║                                   
║  📌 *WELCOME SYSTEM*               
║  ──────────────────────────────
║  • .welcome on - Enable welcome
║  • .welcome off - Disable welcome
║  • .goodbye on - Enable goodbye
║  • .goodbye off - Disable goodbye
║                                   
╚══════════════════════════════════╝
╔══════════════════════════════════╗
║  📢 *CHANNEL:*                    
║  https://whatsapp.com/channel/    
║  0029VatokI45EjxufALmY32X         
║                                   
║  📁 *REPO:*                        
║  https://github.com/rahzyn/       
║  HEROKU-BT                        
║                                   
║  💬 *OWNER:*                       
║  https://wa.me/255693629079        
╚══════════════════════════════════╝
     Powered with ❤️ by Rahmany`;

  await repondre(menuMessage);
});
