const { zokou } = require('../framework/zokou');
const axios = require('axios');

if (!global.userChats) global.userChats = {};

zokou({ nomCom: "gpt", reaction: "🤖", categorie: "ai" }, async (dest, zk, commandeOptions) => {
    const { arg, ms } = commandeOptions;
    const sender = ms.key?.participant || ms.sender || dest;
    const from = dest;
    
    const channelLink = "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X";
   const channelJid = "120363353854480831@newsletter";
   
    try {
        if (!arg || arg.length === 0) {
            return await zk.sendMessage(from, { 
                text: "✳️ *Namaste! Njoo na swali lako.*\n\nMfano: `.gpt Habari za leo?`" 
            }, { quoted: ms });
        }

        const userQuery = arg.join(" ");

        // Hifadhi historia ya mazungumzo
        if (!global.userChats[sender]) global.userChats[sender] = [];
        global.userChats[sender].push(`User: ${userQuery}`);
        if (global.userChats[sender].length > 10) global.userChats[sender].shift();

        // Tengeneza prompt inayomlenga RAHMANI
        const prompt = "You are a helpful, smart and friendly AI assistant named 'Rahmani-AI'. You must always respond in a warm and respectful tone. You were created by Rahmani, a Tanzanian developer. You should answer concisely but thoroughly in the same language the user used.";

        // Tumia API iliyotolewa - inline params
        const apiUrl = `https://api.deline.web.id/ai/openai?text=${encodeURIComponent(userQuery)}&prompt=${encodeURIComponent(prompt)}`;
        
        const { data } = await axios.get(apiUrl);

        // Check API response structure
        const botResponse = data?.result || data?.response || data?.message || "🤖 ⚠️ Sorry, I couldn't understand your question.";

        // Hifadhi jibu la bot
        global.userChats[sender].push(`Bot: ${botResponse}`);

        // Tuma jibu
        await zk.sendMessage(from, {
            text: botResponse,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "ʀᴀʜᴍᴀɴɪ-ᴀɪ",
                    body: "My channel",
                    thumbnailUrl: "https://files.catbox.moe/aktbgo.jpg",
                    sourceUrl: channelLink,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: ms });

    } catch (err) {
        console.error("❌ GPT Error:", err);
        await zk.sendMessage(from, { 
            text: "❌ *Kuna tatizo la mtandao au API*. Jaribu tena baadaye.\n\nHitilafu: " + (err.message || "Unknown error") 
        }, { quoted: ms });
    }
});
