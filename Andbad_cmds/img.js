const { zokou } = require('../framework/zokou');
const gis = require('g-i-s');  // Google Image Search

zokou({
    nomCom: "img",
    categorie: "Search",
    reaction: "📷"
},
async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg } = commandeOptions;

    if (!arg[0]) {
        return await repondre('❌ Please specify an image to search for.');
    }

    const searchTerm = arg.join(" ");

    try {
        const results = await imageSearch(searchTerm);

        if (results.length === 0) {
            return await repondre('⚠️ No images found for: ' + searchTerm);
        }

        for (let i = 0; i < Math.min(results.length, 5); i++) {
            await zk.sendMessage(dest, { image: { url: results[i].url } }, { quoted: ms });
        }
    } catch (error) {
        console.error('Image Search Error:', error);
        return await repondre('❌ Error fetching images.');
    }
});

// Function to Perform Google Image Search
function imageSearch(searchTerm) {
    return new Promise((resolve, reject) => {
        gis(searchTerm, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
