const { zokou } = require("../framework/zokou");

// Store anti-tag state
let antiTagActive = false;
let ownerJid = null;

zokou({
  nomCom: "antitag",
  categorie: "General",
  reaction: "🛡️"
}, async (origineMessage, zk, commandeOptions) => {
  const { ms, arg, repondu } = commandeOptions;
  
  try {
    // Get group ID
    const groupId = origineMessage.key.remoteJid;
    
    // Check if it's a group
    if (!groupId || !groupId.includes('@g.us')) {
      return repondu("❌ Command hii inafanya kazi kwenye *GROUP* pekee!");
    }

    // Handle ON/OFF commands
    if (arg && arg.length > 0) {
      const action = arg[0].toLowerCase();
      
      if (action === "on") {
        antiTagActive = true;
        
        // Get bot's owner number from config or set manually
        try {
          const config = require("../config");
          ownerJid = config.OWNER_NUMBER + "@s.whatsapp.net";
        } catch {
          ownerJid = "255693629079@s.whatsapp.net"; // Replace with your number
        }
        
        return repondu("✅ *Anti-tag imewashwa!*\nMtu akimention owner atapata onyo.");
      } 
      else if (action === "off") {
        antiTagActive = false;
        return repondu("❌ *Anti-tag imezimwa!*");
      }
      else if (action === "owner") {
        if (arg[1]) {
          let number = arg[1].replace(/[^0-9]/g, '');
          if (number.length >= 10) {
            ownerJid = number + "@s.whatsapp.net";
            return repondu(`✅ Owner number imewekwa: ${arg[1]}`);
          } else {
            return repondu("❌ Namba si sahihi! Weka namba kamili.");
          }
        } else {
          return repondu("Tumia: *.antitag owner 25569XXXXXXXX*");
        }
      }
    }

    // If anti-tag is off, don't proceed
    if (!antiTagActive) return;

    // Make sure we have owner number
    if (!ownerJid) {
      // Try to get from message if bot was mentioned
      if (ms.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        const mentions = ms.message.extendedTextMessage.contextInfo.mentionedJid;
        // Assume first mention is owner if not set
        if (mentions.length > 0) {
          ownerJid = mentions[0];
        }
      } else {
        return; // No owner set, can't check tags
      }
    }

    // Check for mentions in the message
    if (ms.message) {
      let mentionedJids = [];
      
      // Get mentions from different message types
      if (ms.message.extendedTextMessage?.contextInfo?.mentionedJid) {
        mentionedJids = ms.message.extendedTextMessage.contextInfo.mentionedJid;
      }
      
      // Also check for mentions in conversation
      if (ms.message.conversation && ms.message.conversation.includes('@')) {
        // Try to extract mentioned numbers from text
        const words = ms.message.conversation.split(' ');
        for (let word of words) {
          if (word.startsWith('@')) {
            const mention = word.substring(1) + '@s.whatsapp.net';
            mentionedJids.push(mention);
          }
        }
      }

      // If owner is mentioned
      if (mentionedJids.includes(ownerJid)) {
        const tagger = origineMessage.key.participant;
        
        // Get tagger's name
        let taggerName = "Mtu";
        try {
          const groupMetadata = await zk.groupMetadata(groupId);
          const participant = groupMetadata.participants.find(p => p.id === tagger);
          if (participant) {
            taggerName = participant.pushName || participant.id.split('@')[0];
          }
        } catch (e) {
          // Ignore error getting name
        }

        // Send warning message
        await zk.sendMessage(groupId, {
          text: `⚠️ *ONYO LA MWISHO!*\n\n@${tagger.split('@')[0]} USIMTAGE MWENYEWE WA GROUP!`,
          mentions: [tagger]
        });

        console.log(`Anti-tag triggered: ${tagger} tagged owner ${ownerJid}`);
      }
    }

  } catch (error) {
    console.error("Anti-tag error:", error);
  }
});
