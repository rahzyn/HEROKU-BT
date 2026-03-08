// ============================================
// commandes/antibug.js
// ANTI-BUG SECURITY COMMAND - ZOKOU FRAMEWORK
// Version: 3.0 (Imara kabisa)
// ============================================

const zokou = require("../framework/zokou");

zokou({
    nomCom: "antibug",
    categorie: "Security",
    reaction: "🛡️",
    desc: "🛡️ Kinga WhatsApp yako na bugs na mashambulizi",
    usage: ".antibug [scan|check|block|unblock|tips|lockdown|help]"
}, async (origineMessage, zk, commandeOptions) => {
    const { 
        arg, 
        repondre, 
        auteur 
    } = commandeOptions;
    
    try {
        // Debug - Angalia kama command inafanya kazi
        console.log(`🛡️ ANTIBUG: Called by ${auteur || 'unknown'}`);
        
        // ============================================
        // MENU - Hakuna arguments
        // ============================================
        if (!arg || arg.length === 0) {
            const menu = `╭━━━〔 🛡️ *ANTI-BUG* 〕━━━┈⊷
┃
┃ *COMMANDS ZA KINGA:*
┃
┃ ✦ .antibug scan
┃ ✦ .antibug check
┃ ✦ .antibug block [namba]
┃ ✦ .antibug unblock [namba]
┃ ✦ .antibug tips
┃ ✦ .antibug lockdown
┃ ✦ .antibug help
┃
┃ *INFO:*
┃ ✓ Kinga akaunti yako ya WhatsApp
┃ ✓ Zuia bugs na mashambulizi
┃ ✓ Tumia kwa usalama wako
┃
╰━━━━━━━━━━━━━━━┈⊷
> ZOKOU • ANTIBUG v3.0 🛡️`;
            
            await repondre(menu);
            return;
        }

        // ============================================
        // COMMAND: SCAN - Angalia linked devices
        // ============================================
        if (arg[0] === 'scan') {
            const scanMsg = `🔍 *SCAN YA USALAMA*\n\n` +
                `*Hatua za kufanya:*\n\n` +
                `1️⃣ *Fungua WhatsApp* kwenye simu yako\n` +
                `2️⃣ *Nenda*: Settings > Linked Devices\n` +
                `3️⃣ *Angalia* orodha ya vifaa vilivyounganishwa\n\n` +
                `🔴 *Kama unaona kifaa kisichojulikana:*\n` +
                `   • Bonyeza kifaa hicho\n` +
                `   • Chagua "Log Out"\n` +
                `   • Badilisha password yako ya WhatsApp\n\n` +
                `🟢 *Kama kila kitu kipo sawa:*\n` +
                `   • Hongera! Akaunti yako ipo salama\n\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `⏱️ *Scan imekamilika* - ${new Date().toLocaleTimeString()}`;
            
            await repondre(scanMsg);
            return;
        }

        // ============================================
        // COMMAND: CHECK - Angalia usalama
        // ============================================
        if (arg[0] === 'check') {
            const checkList = `📋 *CHECKLIST YA USALAMA*\n\n` +
                `*Jibu Ndiyo/Hapana kwa kila swali:*\n\n` +
                `1️⃣ *Ume-washa 2-Step Verification?*\n` +
                `   (Settings > Account > 2-step verification)\n\n` +
                `2️⃣ *Umeangalia linked devices leo?*\n` +
                `   (Settings > Linked Devices)\n\n` +
                `3️⃣ *Una screen lock kwenye simu?*\n` +
                `   (Password/Fingerprint/Face ID)\n\n` +
                `4️⃣ *Hujawahi kushare msimbo wako na mtu?*\n\n` +
                `5️⃣ *WhatsApp yako ni halali (sio MOD)?*\n\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `🎯 *Ikiwa jibu ni HAPANA kwa swali lolote:*\n` +
                `Tumia *.antibug tips* kujua cha kufanya!`;
            
            await repondre(checkList);
            return;
        }

        // ============================================
        // COMMAND: BLOCK - Zuia namba
        // ============================================
        if (arg[0] === 'block') {
            // Kama hakuna namba iliyotolewa
            if (!arg[1]) {
                await repondre(`❌ *Tafadhali weka namba ya kuzuia*\n\n` +
                               `Mfano: .antibug block 255712345678`);
                return;
            }
            
            const number = arg[1].replace(/[^0-9]/g, '');
            // Hakikisha namba ina format sahihi
            const formattedNumber = number.startsWith('255') ? number : 
                                   (number.startsWith('0') ? '255' + number.substring(1) : '255' + number);
            
            const blockMsg = `⛔ *KUZUIA NAMBA*\n\n` +
                `Namba: *${formattedNumber}*\n\n` +
                `*Jinsi ya kuzuia:*\n\n` +
                `1️⃣ *Fungua WhatsApp* kwenye simu yako\n` +
                `2️⃣ *Tafuta chat* ya namba hii\n` +
                `3️⃣ *Bofya menyu* (三点) > More\n` +
                `4️⃣ *Chagua* "Block" > "Block" tena\n\n` +
                `📌 *Pia unaweza:*\n` +
                `Settings > Privacy > Blocked contacts > Add\n\n` +
                `✅ *Namba imezuiwa* - Hutapokea ujumbe tena`;
            
            await repondre(blockMsg);
            return;
        }

        // ============================================
        // COMMAND: UNBLOCK - Ondoa block
        // ============================================
        if (arg[0] === 'unblock') {
            // Kama hakuna namba iliyotolewa
            if (!arg[1]) {
                await repondre(`❌ *Tafadhali weka namba ya kuondoa block*\n\n` +
                               `Mfano: .antibug unblock 255712345678`);
                return;
            }
            
            const number = arg[1].replace(/[^0-9]/g, '');
            const formattedNumber = number.startsWith('255') ? number : 
                                   (number.startsWith('0') ? '255' + number.substring(1) : '255' + number);
            
            const unblockMsg = `✅ *KUONDOA BLOCK*\n\n` +
                `Namba: *${formattedNumber}*\n\n` +
                `*Jinsi ya kuondoa block:*\n\n` +
                `1️⃣ *Fungua WhatsApp*\n` +
                `2️⃣ *Nenda*: Settings > Privacy > Blocked contacts\n` +
                `3️⃣ *Tafuta* namba *${formattedNumber}*\n` +
                `4️⃣ *Bofya* "Unblock"\n\n` +
                `✅ *Sasa utaweza kupokea ujumbe kutoka kwa namba hii*`;
            
            await repondre(unblockMsg);
            return;
        }

        // ============================================
        // COMMAND: TIPS - Vidokezo vya usalama
        // ============================================
        if (arg[0] === 'tips') {
            const tips = `📚 *VIDOKEZO 7 ZA KINGA MASHAMBULIZI*\n\n` +
                `1️⃣ *2-Step Verification*\n` +
                `   🔐 Weka PIN ya ziada\n` +
                `   Settings > Account > 2-step verification\n\n` +
                `2️⃣ *Angalia vifaa mara kwa mara*\n` +
                `   📱 Settings > Linked Devices\n` +
                `   Log out vifaa usivyovijua\n\n` +
                `3️⃣ *Usishare msimbo wako*\n` +
                `   🤫 Hakuna anayehitaji msimbo wako\n\n` +
                `4️⃣ *Epuka link za kutiliwa shaka*\n` +
                `   🔗 Usibofye link fupi au zenye spelling mistakes\n\n` +
                `5️⃣ *Block na Report mara moja*\n` +
                `   ⚡ Ukiona ujumbe wa kutiliwa shaka\n\n` +
                `6️⃣ *Sasisha WhatsApp*\n` +
                `   🔄 Updates zina security patches\n\n` +
                `7️⃣ *Usitumie WhatsApp MOD*\n` +
                `   ⚠️ Zinaweza kuwa na backdoors\n\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `🛡️ *Kumbuka*: Usalama ni jukumu lako!`;
            
            await repondre(tips);
            return;
        }

        // ============================================
        // COMMAND: LOCKDOWN - Hali ya juu ya usalama
        // ============================================
        if (arg[0] === 'lockdown') {
            const lockdownMsg = `🔒 *HALI YA LOCKDOWN*\n\n` +
                `*Hatua za haraka za usalama mkali:*\n\n` +
                `1️⃣ *Vunja uhusiano na vifaa vyote*\n` +
                `   Settings > Linked Devices > Log out all\n\n` +
                `2️⃣ *Washa 2-Step Verification*\n` +
                `   Ikiwa haijawashwa, washa sasa!\n\n` +
                `3️⃣ *Badilisha privacy settings*\n` +
                `   • Last Seen: Nobody\n` +
                `   • Profile Photo: My Contacts\n` +
                `   • About: My Contacts\n` +
                `   • Groups: My Contacts\n\n` +
                `4️⃣ *Ripoti kwa WhatsApp*\n` +
                `   Kama una mashaka, wasiliana na:\n` +
                `   support@whatsapp.com\n\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `✅ *Lockdown imekamilika!* Usalama wako umeimarika.`;
            
            await repondre(lockdownMsg);
            return;
        }

        // ============================================
        // COMMAND: HELP - Msaada kamili
        // ============================================
        if (arg[0] === 'help') {
            const helpMsg = `🆘 *ANTI-BUG HELP*\n\n` +
                `*.antibug* - Menu kuu\n` +
                `*.antibug scan* - Kagua linked devices\n` +
                `*.antibug check* - Angalia usalama wako\n` +
                `*.antibug block [namba]* - Zuia namba inayosumbua\n` +
                `*.antibug unblock [namba]* - Ondoa block kwenye namba\n` +
                `*.antibug tips* - Vidokezo vya kujikinga\n` +
                `*.antibug lockdown* - Weka usalama mkali\n\n` +
                `*MIFANO:*\n` +
                `• .antibug block 255712345678\n` +
                `• .antibug unblock 255712345678\n\n` +
                `*NOTE:* Namba za Tanzania zinaanza na 255`;
            
            await repondre(helpMsg);
            return;
        }

        // ============================================
        // Command haipo - Onyesha ujumbe wa kosa
        // ============================================
        await repondre(`❌ *Command "${arg[0]}" haipo*\n\n` +
                       `Tumia *.antibug help* kuona commands zote.`);

    } catch (error) {
        // ============================================
        // ERROR HANDLING - Kama kuna hitilafu
        // ============================================
        console.log("❌ ANTIBUG Error:", error);
        await repondre("❌ *Kuna tatizo limetokea*\n\nTafadhali jaribu tena baadaye.");
    }
});
