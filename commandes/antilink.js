const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const path = require("path");

// Configuration file for antilink
const antilinkPath = path.join(__dirname, "../bdd/antilink.json");

// Ensure bdd folder exists
if (!fs.existsSync(path.join(__dirname, "../bdd"))) {
  fs.mkdirSync(path.join(__dirname, "../bdd"));
}

// Create antilink.json if it doesn't exist
if (!fs.existsSync(antilinkPath)) {
  fs.writeFileSync(antilinkPath, JSON.stringify({ 
    status: "off",
    action: "delete" // delete, warn, remove
  }, null, 2));
}

// Function to read antilink status
function isAntilinkOn() {
  try {
    const data = fs.readFileSync(antilinkPath);
    const config = JSON.parse(data);
    return config.status === "on";
  } catch {
    return false;
  }
}

// Function to get antilink action
function getAntilinkAction() {
  try {
    const data = fs.readFileSync(antilinkPath);
    const config = JSON.parse(data);
    return config.action || "delete";
  } catch {
    return "delete";
  }
}

// Main command to toggle antilink
zokou({
  nomCom: "antilink",
  categorie: "Group",
  reaction: "🔗",
  desc: "Enable or disable anti-link (auto-delete links)",
  fromMe: true
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifGroupe, verifAdmin } = commandeOptions;

  // Check if in group
  if (!verifGroupe) {
    return repondre("❌ *This command can only be used in groups!*");
  }

  // Check if user is admin
  if (!verifAdmin) {
    return repondre("❌ *Only group admins can use this command!*");
  }

  if (!arg[0] || !["on", "off"].includes(arg[0].toLowerCase())) {
    return repondre("*❗ Usage:*\n.antilink on - Enable auto-delete\n.antilink off - Disable auto-delete\n.antilink action delete|warn|remove - Set action\n\n_Powered by Rahmany_");
  }

  const status = arg[0].toLowerCase();
  
  // Check if setting action
  if (arg[1] && arg[0].toLowerCase() === "action") {
    const action = arg[1].toLowerCase();
    if (!["delete", "warn", "remove"].includes(action)) {
      return repondre("❌ *Invalid action! Use: delete, warn, or remove*");
    }
    
    try {
      const config = JSON.parse(fs.readFileSync(antilinkPath));
      config.action = action;
      fs.writeFileSync(antilinkPath, JSON.stringify(config, null, 2));
      return repondre(`✅ *Antilink action set to:* ${action.toUpperCase()}\n\n_Powered by Rahmany_`);
    } catch (e) {
      return repondre("❌ Failed to update action.");
    }
  }

  try {
    const config = JSON.parse(fs.readFileSync(antilinkPath));
    config.status = status;
    fs.writeFileSync(antilinkPath, JSON.stringify(config, null, 2));
    
    await repondre(
      status === "on"
        ? `✅ *ANTILINK ENABLED*\n\nAll links will be auto-deleted.\nAction: ${config.action.toUpperCase()}\n\n_Powered by Rahmany_`
        : `⚠️ *ANTILINK DISABLED*\n\nLinks will not be deleted.\n\n_Powered by Rahmany_`
    );
  } catch (e) {
    await repondre("❌ Failed to update antilink configuration.");
  }
});

// Export functions for main.js
module.exports = {
  isAntilinkOn,
  getAntilinkAction,
  
  // Function to handle link detection
  async handleAntilink(zk, message, sender, chatJid, isAdmin, isBotAdmin) {
    try {
      if (!isAntilinkOn()) return false;
      
      // Get message text
      const messageText = message.message?.conversation || 
                          message.message?.extendedTextMessage?.text ||
                          message.message?.imageMessage?.caption ||
                          "";
      
      if (!messageText) return false;
      
      // Check for links
      const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9]+\.(com|org|net|io|gov|edu|tz|co\.tz|go\.tz|africa|ke|ug))(\/[^\s]*)?/gi;
      
      if (linkRegex.test(messageText)) {
        console.log("🔗 LINK DETECTED!");
        
        // Skip if sender is admin or bot
        if (isAdmin || sender.includes('@g.us')) return false;
        
        const action = getAntilinkAction();
        
        // Delete message (always try to delete)
        let deleted = false;
        try {
          const deleteKey = {
            remoteJid: chatJid,
            fromMe: false,
            id: message.key.id,
            participant: message.key.participant
          };
          
          await zk.sendMessage(chatJid, { delete: deleteKey });
          console.log("✅ Link message deleted");
          deleted = true;
        } catch (deleteError) {
          console.log("❌ Failed to delete:", deleteError.message);
        }
        
        // Take action based on configuration
        if (action === "remove" && isBotAdmin) {
          // Remove user from group
          try {
            await zk.groupParticipantsUpdate(chatJid, [sender], "remove");
            console.log("✅ User removed from group");
            
            // Notify group
            await zk.sendMessage(chatJid, {
              text: `🔨 @${sender.split('@')[0]} removed for sending link.`,
              mentions: [sender]
            });
          } catch (removeError) {
            console.log("❌ Failed to remove:", removeError.message);
          }
        } 
        else if (action === "warn") {
          // Send warning
          await zk.sendMessage(chatJid, {
            text: `⚠️ @${sender.split('@')[0]} Links are not allowed in this group!`,
            mentions: [sender]
          });
        }
        else {
          // Just delete - no notification
          if (deleted) {
            console.log("✅ Link deleted silently");
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Antilink error:", error);
      return false;
    }
  }
};
