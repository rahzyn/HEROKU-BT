const Zokou = require("../framework/Zokou");
const axios = require('axios');

// Configuration for GPT command
Zokou({
  pattern: "gpt1",
  alias: ["chatgpt", "ai"],
  desc: "Uliza swali kwa ChatGPT",
  category: "ai",
  usage: ".gpt swali lako",
  react: "💬"
}, async (message, match, client) => {
  try {
    // Get query from message
    const text = match || (message.quoted && message.quoted.text);
    
    if (!text) {
      return await message.send("*Mfano:*\n.gpt Mji mkuu wa Tanzania ni upi?\n*au*\nReply kwa swali la mtu");
    }
    
    // Send loading reaction
    await message.react("⏳");
    
    // Call your GPT API function
    const response = await getGPTResponse(text);
    
    // Remove loading reaction
    await message.react("✅");
    
    // Send response
    await message.send(`*🤖 ChatGPT Response:*\n\n${response}`);
    
  } catch (error) {
    console.error("GPT Error:", error);
    await message.react("❌");
    await message.send("❌ *Samahani, kuna tatizo.*\nJaribu tena baadaye.");
  }
});

// Configuration for DALL-E command
Zokou({
  pattern: "dall",
  alias: ["dalle", "generate", "picha"],
  desc: "Tengeneza picha kwa DALL-E",
  category: "ai",
  usage: ".dall maelezo ya picha",
  react: "🎨"
}, async (message, match, client) => {
  try {
    // Get prompt from message
    const prompt = match || (message.quoted && message.quoted.text);
    
    if (!prompt) {
      return await message.send("*Mfano:*\n.dall paka mweupe anayevaa kofia nyekundu\n*au*\nReply kwa maelezo");
    }
    
    // Send processing message
    await message.react("⏳");
    const processingMsg = await message.send("🎨 *Inatengeneza picha...* Tafadhali subiri");
    
    // Generate image (you need to implement this function)
    const imageUrl = await getDallEResponse(prompt);
    
    if (!imageUrl) {
      await message.react("❌");
      return await message.send("❌ *Picha haikuweza kutengenezwa.* Jaribu tena.");
    }
    
    // Delete processing message
    if (processingMsg && processingMsg.key) {
      await client.sendMessage(message.from, { 
        delete: processingMsg.key 
      });
    }
    
    // Send the generated image
    await message.react("✅");
    await client.sendMessage(message.from, {
      image: { url: imageUrl },
      caption: `🎨 *Prompt:* ${prompt}\n\n_Generated using DALL-E_`
    }, { quoted: message.data });
    
  } catch (error) {
    console.error("DALL-E Error:", error);
    await message.react("❌");
    await message.send("❌ *Samahani, kuna tatizo.*\nJaribu tena baadaye.");
  }
});

// Function to get GPT response (you need to add your API)
async function getGPTResponse(text) {
  try {
    // OPTION 1: Using public API (free but limited)
    const response = await axios.get(`https://api.ryzendesu.vip/api/ai/gpt?text=${encodeURIComponent(text)}`);
    return response.data.response || response.data.result || "Hakuna jibu";
    
    // OPTION 2: Using OpenAI API (requires API key)
    /*
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: text }]
    }, {
      headers: {
        'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content;
    */
    
  } catch (error) {
    console.error(error);
    return "Samahani, siwezi kujibu sasa hivi.";
  }
}

// Function to get DALL-E response
async function getDallEResponse(prompt) {
  try {
    // OPTION 1: Using free API
    const response = await axios.get(`https://api.ryzendesu.vip/api/ai/dalle?text=${encodeURIComponent(prompt)}`);
    return response.data.image || response.data.url;
    
    // OPTION 2: Using OpenAI API (requires API key)
    /*
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      prompt: prompt,
      n: 1,
      size: "1024x1024"
    }, {
      headers: {
        'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data[0].url;
    */
    
  } catch (error) {
    console.error(error);
    return null;
  }
}
