const { zokou } = require("../framework/zokou");
const fs = require("fs");
const path = require("path");

const antibugPath = path.join(__dirname, "../bdd/antibug.json");

// Hakikisha folder ya bdd ipo
if (!fs.existsSync(path.join(__dirname, "../bdd"))) {
  fs.mkdirSync(path.join(__dirname, "../bdd"));
}

// Unda antibug.json kama haipo
if (!fs.existsSync(antibugPath)) {
  fs.writeFileSync(antibugPath, JSON.stringify({ status: "off" }, null, 2));
}

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
          ? "✅ *ANTIBUG ENABLED*\nBot itazuia messages zenye bugs, spam, na character overload!"
          : "⚠️ *ANTIBUG DISABLED*\nBug protection imezimwa."
      );
    } catch (e) {
      await repondre("❌ Failed to update antibug configuration.");
      console.error("Antibug write error:", e);
    }
  }
);
