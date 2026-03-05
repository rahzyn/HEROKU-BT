const { zokou } = require('../framework/zokou');
const { default: axios } = require('axios');

if (!global.userChats) global.userChats = {};

zokou({ nomCom: "gpt", reaction: "🤠", categorie: "ai" }, async (dest, zk, commandeOptions) => {
    const { arg, ms } = commandeOptions;
    const sender = ms.sender;
    const from = dest;

    try {
        if (!arg || arg.length === 0) {
            return await zk.sendMessage(from, { text: "> YES BOSS AM LISTENING TO YOU 😎 ." }, { quoted: ms });
        }

        const text = arg.join(" ");

        // Initialize user chat history
        if (!global.userChats[sender]) global.userChats[sender] = [];
        global.userChats[sender].push(`User: ${text}`);

        // Keep only last 15 messages
        if (global.userChats[sender].length > 15) global.userChats[sender].shift();

        const history = global.userChats[sender].join("\n");

        // Create prompt with history
        const prompt = `
You are Rahmany Ai, a friendly and intelligent WhatsApp bot. Chat naturally without asking repetitive questions.

### Chat History:
${history}
`;

        // Call your new API
        const { data } = await axios.get("https://api.deline.web.id/ai/openai", {
            params: { 
                text: text, 
                prompt: prompt 
            }
        });

        // Check if API call was successful
        if (data.status !== true) {
            throw new Error("API request failed");
        }

        // Extract bot response - using 'result' field from the API response
        const botResponse = data.result || "⚠️ Sorry, I couldn't understand your question.";

        // Save bot reply in history
        global.userChats[sender].push(`Bot: ${botResponse}`);

        // Send plain reply
        await zk.sendMessage(from, { text: botResponse }, { quoted: ms });

    } catch (err) {
        console.error("❌ GPT Error:", err);
        await zk.sendMessage(from, { text: "❌ An error occurred: " + err.message }, { quoted: ms });
    }
});
