const { zokou } = require("../framework/zokou");

zokou({
    nomCom: "testblock",
    categorie: "Owner",
    reaction: "🧪",
    desc: "Test block function",
    fromMe: true
}, async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser } = commandeOptions;
    
    if (!superUser) {
        return repondre("❌ Owner only!");
    }
    
    if (!arg[0]) {
        return repondre("❌ Provide number!\nExample: .testblock 255693629079");
    }
    
    const number = arg[0].replace(/[^0-9]/g, '');
    const jid = number + '@s.whatsapp.net';
    
    await repondre(`⏳ Testing block on ${number}...`);
    
    try {
        await zk.updateBlockStatus(jid, 'block');
        await repondre(`✅ SUCCESS! ${number} has been blocked.`);
    } catch (e) {
        await repondre(`❌ FAILED! Error: ${e.message}`);
    }
});
