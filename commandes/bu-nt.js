
const { zokou } = require("../framework/zokou");

zokou({ nomCom: "antibug", categorie: "protection" }, async (dest, zk, commandeOptions) => {
  const { repondre, message } = commandeOptions;

  try {
    const bugPatterns = [
      /‏‏/g, // RTL characters
      /️️️️️️️️️️️️️️️️/g, // Invisible characters
      /⃫/g, /̸/g, /͡/g, /͜/g // Special characters used in crash texts
    ];

    const isBug = bugPatterns.some(pattern => pattern.test(message));

    if (isBug) {
      await zk.sendMessage(dest, { delete: message.key });
      await repondre("⚠️ Bug message detected and removed.");
    } else {
      await repondre("✅ Anti-bug system is active. No bugs found in the last message.");
    }
  } catch (error) {
    console.error("Anti-bug error:", error);
    await repondre("❌ Error while running anti-bug command.");
  }
});
