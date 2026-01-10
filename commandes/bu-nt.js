const { zokou } = require("../../framework/zokou");

zokou(
  { nomCom: "antibug", categorie: "protection",
  }, async (dest, zk, commandeOptions) => {
  const { repondre, auteurMessage, nomAuteurMessage } = commandeOptions;

    try {
      const bugPatterns = [
        /‏‏/g,
        /️️️️️️️️️️️️️️️️/g,
        /⃫/g,
        /̸/g,
        /͡/g,
        /͜/g
      ];

      const text = msg?.message?.conversation || "";

      const isBug = bugPatterns.some(p => p.test(text));

      if (isBug) {
        await zk.sendMessage(dest, { delete: msg.key });
        return repondre("⚠️ Bug message detected and removed.");
      }

      repondre("✅ Anti-bug system is active.");

    } catch (e) {
      console.log("Anti-bug error:", e);
      repondre("❌ Error running anti-bug command.");
    }

  }
);
