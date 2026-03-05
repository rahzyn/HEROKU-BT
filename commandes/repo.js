const { zokou } = require(__dirname + "/../framework/zokou");
const os = require("os");
const { format } = require(__dirname + "/../framework/mesfonctions");
const s = require(__dirname + "/../set");
const axios = require('axios');
const moment = require('moment');

zokou({ 
    nomCom: "repo", 
    categorie: "General",
    reaction: "📦",
    alias: ["info", "botinfo", "channel", "pair", "session"]
}, async (dest, zk, commandeOptions) => {
    
    let { ms, repondre, prefixe } = commandeOptions;
    
    // ===== URL ZAKO ZOTE =====
    const channelUrl = "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X";
    const channelName = "BeltahTech Updates";
    const channelId = "120363353854480831@newsletter"; // Hii inafanya view channel
    
    const githubUrl = "https://github.com/rahzyn/HEROKU-BT";
    const pairUrl = "https://heroku-pair.onrender.com/";
    const ownerUrl = "https://wa.me/255693629079";
    
    // ===== PICHA YAKO =====
    const pichaYako = "https://files.catbox.moe/zotx9t.jpg";
    
    // System info
    const mode = s.MODE?.toLowerCase() == "yes" ? "🌐 Public" : "🔒 Private";
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const usedMemory = format(os.totalmem() - os.freemem());
    const totalMemory = format(os.totalmem());
    
    try {
        // Pata data kutoka GitHub API
        const githubRes = await axios.get('https://api.github.com/repos/rahzyn/HEROKU-BT');
        const githubData = githubRes.data;
        
        const created = moment(githubData.created_at).format('DD/MM/YYYY');
        const updated = moment(githubData.updated_at).format('DD/MM/YYYY');
        
        // Message kamili
        const repoMsg = `
╭━━━━ *HEROKU-BT* ━━━━╮
┃
┃  🤖 *Mode:* ${mode}
┃  💾 *RAM:* ${usedMemory}/${totalMemory}
┃  ⏰ *Uptime:* ${days}d ${hours}h ${minutes}m
┃  📌 *Prefix:* ${prefixe}
┃
┃  ⭐ *Stars:* ${githubData.stargazers_count}
┃  🍴 *Forks:* ${githubData.forks_count}
┃  👀 *Watchers:* ${githubData.watchers_count}
┃  📅 *Created:* ${created}
┃  🔄 *Updated:* ${updated}
┃
┃  👑 *Dev:* Rahmany & Qart
┃  📢 *Channel:* ${channelName}
┃
╰━━━━━━━━━━━━━━━━╯

*✨ PAIR SESSION:* 
${pairUrl}

*👇 CLICK BUTTONS BELOW 👇*
        `;

        // Tuma message NA VIEW CHANNEL INAYOBOFYEKA
        await zk.sendMessage(dest, {
            image: { url: pichaYako },
            caption: repoMsg,
            footer: "Powered by BeltahTech",
            buttons: [
                {
                    urlButton: {
                        displayText: "🔗 PAIR SESSION",
                        url: pairUrl
                    }
                },
                {
                    urlButton: {
                        displayText: "📢 JOIN CHANNEL",
                        url: channelUrl
                    }
                },
                {
                    urlButton: {
                        displayText: "📁 GET REPO",
                        url: githubUrl
                    }
                },
                {
                    urlButton: {
                        displayText: "💬 CONTACT OWNER",
                        url: ownerUrl
                    }
                }
            ],
            headerType: 4,
            contextInfo: {
                // HII INAFANYA VIEW CHANNEL IONEKANE NA IBOFYEIKE MOJA KWA MOJA
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelId,
                    newsletterName: channelName,
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: "HEROKU-BT BOT",
                    body: `⭐ ${githubData.stargazers_count} Stars | 🍴 ${githubData.forks_count} Forks`,
                    thumbnailUrl: pichaYako,
                    sourceUrl: channelUrl, // Hii inafanya channel kufunguka
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: ms });

    } catch (e) {
        console.log("Error:", e);
        
        // Fallback kama GitHub API haifanyi kazi
        const fallbackMsg = `
╭━━━━ *HEROKU-BT* ━━━━╮
┃
┃  🤖 *Mode:* ${mode}
┃  💾 *RAM:* ${usedMemory}/${totalMemory}
┃  ⏰ *Uptime:* ${days}d ${hours}h ${minutes}m
┃  📌 *Prefix:* ${prefixe}
┃
┃  👑 *Dev:* Rahmany & Qart
┃  📢 *Channel:* ${channelName}
┃
╰━━━━━━━━━━━━━━━━╯

*✨ PAIR SESSION:* 
${pairUrl}

*👇 CLICK BUTTONS BELOW 👇*
        `;
        
        await zk.sendMessage(dest, {
            image: { url: pichaYako },
            caption: fallbackMsg,
            footer: "Powered by BeltahTech",
            buttons: [
                {
                    urlButton: {
                        displayText: "🔗 PAIR SESSION",
                        url: pairUrl
                    }
                },
                {
                    urlButton: {
                        displayText: "📢 JOIN CHANNEL",
                        url: channelUrl
                    }
                },
                {
                    urlButton: {
                        displayText: "📁 GET REPO",
                        url: githubUrl
                    }
                },
                {
                    urlButton: {
                        displayText: "💬 CONTACT OWNER",
                        url: ownerUrl
                    }
                }
            ],
            headerType: 4,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelId,
                    newsletterName: channelName,
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: "HEROKU-BT BOT",
                    body: "Join our channel!",
                    thumbnailUrl: pichaYako,
                    sourceUrl: channelUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: ms });
    }
});
