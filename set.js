const fs = require('fs-extra');
const { Sequelize } = require('sequelize');
if (fs.existsSync('set.env'))
    require('dotenv').config({ path: __dirname + '/set.env' });
const path = require("path");
const databasePath = path.join(__dirname, './database.db');

// DATABASE_URL must be set in your environment variables
// Usiwahi hardcode credentials kwenye code!
const DATABASE_URL = process.env.DATABASE_URL || databasePath;

module.exports = { 
    // ============ SESSION ============
    session: process.env.SESSION_ID || 'zokk',
    
    // ============ BOT SETTINGS ============
    PREFIXE: process.env.PREFIX || ".",
    OWNER_NAME: process.env.OWNER_NAME || "Rahmani",
    NUMERO_OWNER: process.env.NUMERO_OWNER || "255XXXXXXXXX", // Weka namba yako hapa
    BOT: process.env.BOT_NAME || 'HEROKU-BT',
    MODE: process.env.PUBLIC_MODE || "no",
    PM_PERMIT: process.env.PM_PERMIT || 'no',
    ETAT: process.env.PRESENCE || '1',          // 1=online, 2=typing, 3=recording
    DP: process.env.STARTING_BOT_MESSAGE || "yes",
    
    // ============ AUTO STATUS SETTINGS ============
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "yes",
    AUTO_REACT_STATUS: process.env.AUTO_REACT_STATUS || 'yes',
    AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'no',
    
    // ============ ANTI-DELETE SETTINGS ============
    ANTI_DELETE_MESSAGE: process.env.ANTI_DELETE_MESSAGE || 'yes',  // Changed from ANTIDELETE1
    ADM: process.env.ADM || 'yes',  // Added ADM for anti-delete compatibility
    
    // ============ WARN SYSTEM ============
    WARN_COUNT: parseInt(process.env.WARN_COUNT) || 3,  // Convert to number
    
    // ============ BOT PROFILE ============
    URL: process.env.BOT_MENU_LINKS || 'https://files.catbox.moe/zotx9t.jpg',
    
    // ============ CHATBOT ============
    CHATBOT: process.env.PM_CHATBOT || 'no',
    
    // ============ HEROKU SETTINGS ============
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
    HEROKU_APY_KEY: process.env.HEROKU_APY_KEY,
    
    // ============ DATABASE ============
    DATABASE_URL,
    DATABASE: DATABASE_URL,
};

console.log("✅ Configuration Loaded");
console.log(`📱 Prefix: ${module.exports.PREFIXE}`);
console.log(`👤 Owner: ${module.exports.OWNER_NAME}`);
console.log(`📞 Owner Number: ${module.exports.NUMERO_OWNER}`);
console.log(`🔰 Mode: ${module.exports.MODE === 'yes' ? 'Public' : 'Private'}`);
console.log(`🗑️ Anti-Delete: ${module.exports.ANTI_DELETE_MESSAGE === 'yes' ? 'ON' : 'OFF'}`);
console.log(`⚠️ Warn Count: ${module.exports.WARN_COUNT}`);

let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`🔄 Updating ${__filename}`);
    delete require.cache[fichier];
    require(fichier);
});
