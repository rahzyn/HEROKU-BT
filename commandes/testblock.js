const { zokou } = require("../framework/zokou");

zokou({
  nomCom: "testblock",
  categorie: "Owner",
  reaction: "🔨",
  desc: "Test blocking function",
  fromMe: true
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, superUser } = commandeOptions;
  
  if (!superUser) return repondre("Only owner can use this");
  
  if (!arg[0]) return repondre("❌ Weka namba. Example: .testblock 255123456789");
  
  const number = arg[0].replace(/[^0-9]/g, '');
  const jid = number + '@s.whatsapp.net';
  
  repondre(`⏳ Jaribio la kublock ${number}...`);
  
  // Jaribu njia 4 tofauti
  let results = [];
  
  // Method 1
  try {
    await zk.updateBlockStatus(jid, 'block');
    results.push("✅ Method 1: updateBlockStatus - SUCCESS");
  } catch (e) {
    results.push(`❌ Method 1: updateBlockStatus - ${e.message}`);
  }
  
  // Method 2
  try {
    if (zk.blockUser) {
      await zk.blockUser(jid, "block");
      results.push("✅ Method 2: blockUser - SUCCESS");
    }
  } catch (e) {}
  
  // Method 3
  try {
    if (zk.block) {
      await zk.block(jid);
      results.push("✅ Method 3: block - SUCCESS");
    }
  } catch (e) {}
  
  // Method 4 - Tumia socket
  try {
    if (zk.ws) {
      // Another approach
      results.push("ℹ️ Method 4: Not tested");
    }
  } catch (e) {}
  
  let reply = "*🔨 BLOCK TEST RESULTS*\n\n";
  reply += results.join('\n');
  
  if (results.some(r => r.includes('✅'))) {
    reply += "\n\n✅ Block inafanya kazi!";
  } else {
    reply += "\n\n❌ Block HAIFANYI kazi! Angalia permissions za bot.";
  }
  
  repondre(reply);
});
