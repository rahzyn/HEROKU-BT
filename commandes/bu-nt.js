const { zokou } = require("../framework/zokou");
const fs = require("fs");
const path = require("path");

const antibugPath = path.join(__dirname, "../bdd/antibug.json");

zokou(
  {
    nomCom: "antibug",
    categorie: "General",
    reaction: "🛡️",
    desc: "Enable or disable antibug protection",
    fromMe: true,
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg } = commandeOptions;

    if (!arg[0] || !["on", "off"].includes(arg[0].toLowerCase())) {
      return repondre("*❗ Correct usage:* .antibug on | .antibug off");
    }

    const status = arg[0].toLowerCase();
    const newConfig = { status };

    try {
      fs.writeFileSync(antibugPath, JSON.stringify(newConfig, null, 2));
      await repondre(
        status === "on"
          ? "✅ Antibug has been enabled. The bot will now block bug-type messages."
          : "⚠️ Antibug has been disabled. Bug protection is off."
      );
    } catch (e) {
      await repondre("❌ Failed to update antibug configuration.");
      console.error("Antibug write error:", e);
    }
  }
);
