// Command 1: Kuwasha / kuzima anti-mention
zokou({
    nomCom: "antimention",
    categorie: "Moderation"
}, async (jid, sock, { arg, repondre, ms, verifGroupe, verifAdmin, superUser }) => {
    if (!verifGroupe) {
        return repondre("❌ This command only works in groups");
    }
    
    if (!verifAdmin && !superUser) {
        return repondre("❌ Only group admins can use this command");
    }
    
    if (!arg[0] || !["on", "off", "status"].includes(arg[0].toLowerCase())) {
        return repondre("✅ Usage:\n.antimention on - Washa anti-mention\n.antimention off - Zima anti-mention\n.antimention status - Angalia hali");
    }

    const action = arg[0].toLowerCase();
    
    if (action === "status") {
        const settings = antiMentionSettings.get(jid) || { enabled: false, warns: new Map() };
        let warnCount = 0;
        for (const [user, data] of settings.warns.entries()) {
            warnCount += data.count;
        }
        return repondre(`📊 *Anti-Mention Status*\n• Enabled: ${settings.enabled ? "✅ ON" : "❌ OFF"}\n• Max Warns: ${MAX_WARNS}\n• Active Warns: ${warnCount}`);
    }
    
    const enabled = action === "on";
    
    if (!antiMentionSettings.has(jid)) {
        antiMentionSettings.set(jid, { enabled: false, warns: new Map() });
    }
    
    const settings = antiMentionSettings.get(jid);
    settings.enabled = enabled;
    antiMentionSettings.set(jid, settings);
    
    repondre(`🛡 Anti-Mention has been turned *${enabled ? "ON" : "OFF"}* for this group.\nMax warns: ${MAX_WARNS} then removal`);
});

// Command 2: Kuangalia warns za user
zokou({
    nomCom: "mentionwarns",
    categorie: "Moderation"
}, async (jid, sock, { arg, repondre, ms, verifGroupe, verifAdmin, superUser }) => {
    if (!verifGroupe) {
        return repondre("❌ This command only works in groups");
    }
    
    const mentioned = ms.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    let targetUser = mentioned && mentioned.length > 0 ? mentioned[0] : auteurMessage;
    
    const settings = antiMentionSettings.get(jid);
    if (!settings) {
        return repondre("📊 No warns found for this user");
    }
    
    const userWarn = settings.warns.get(targetUser);
    if (!userWarn) {
        return repondre(`✅ @${targetUser.split('@')[0]} has no warns`, { mentions: [targetUser] });
    }
    
    const timeLeft = Math.floor((WARN_TIMEOUT - (Date.now() - userWarn.timestamp)) / 60000);
    repondre(`📊 *Warn Info for @${targetUser.split('@')[0]}*\n• Warns: ${userWarn.count}/${MAX_WARNS}\n• Expires in: ${timeLeft} minutes`, { mentions: [targetUser] });
});

// Command 3: Kuweka warn manually
zokou({
    nomCom: "warnmention",
    categorie: "Moderation"
}, async (jid, sock, { arg, repondre, ms, verifGroupe, verifAdmin, superUser }) => {
    if (!verifGroupe) {
        return repondre("❌ This command only works in groups");
    }
    
    if (!verifAdmin && !superUser) {
        return repondre("❌ Only group admins can use this command");
    }
    
    const mentioned = ms.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length === 0) {
        return repondre("❌ Please mention a user\nUsage: .warnmention @user");
    }
    
    const targetUser = mentioned[0];
    const settings = antiMentionSettings.get(jid) || { enabled: true, warns: new Map() };
    
    const userWarn = settings.warns.get(targetUser) || { count: 0, timestamp: Date.now() };
    userWarn.count += 1;
    userWarn.timestamp = Date.now();
    settings.warns.set(targetUser, userWarn);
    antiMentionSettings.set(jid, settings);
    
    if (userWarn.count >= MAX_WARNS) {
        const metadata = await getGroupMetadata(sock, jid);
        const isBotAdmin = metadata && isGroupAdmin(metadata.participants, idBot);
        
        if (isBotAdmin) {
            await sock.groupParticipantsUpdate(jid, [targetUser], "remove");
            await sock.sendMessage(jid, { 
                text: `🚫 @${targetUser.split('@')[0]} has been removed for reaching max warns.`, 
                mentions: [targetUser] 
            });
            settings.warns.delete(targetUser);
            antiMentionSettings.set(jid, settings);
        } else {
            repondre(`⚠️ @${targetUser.split('@')[0]} has ${userWarn.count}/${MAX_WARNS} warns but I'm not admin to remove.`, { mentions: [targetUser] });
        }
    } else {
        repondre(`⚠️ Warned @${targetUser.split('@')[0]}\nTotal warns: ${userWarn.count}/${MAX_WRNS}`, { mentions: [targetUser] });
    }
});

// Command 4: Kuondoa warns
zokou({
    nomCom: "resetwarns",
    categorie: "Moderation"
}, async (jid, sock, { arg, repondre, ms, verifGroupe, verifAdmin, superUser }) => {
    if (!verifGroupe) {
        return repondre("❌ This command only works in groups");
    }
    
    if (!verifAdmin && !superUser) {
        return repondre("❌ Only group admins can use this command");
    }
    
    const mentioned = ms.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length === 0) {
        return repondre("❌ Please mention a user\nUsage: .resetwarns @user");
    }
    
    const targetUser = mentioned[0];
    const settings = antiMentionSettings.get(jid);
    
    if (settings && settings.warns.has(targetUser)) {
        settings.warns.delete(targetUser);
        antiMentionSettings.set(jid, settings);
        repondre(`✅ Reset warns for @${targetUser.split('@')[0]}`, { mentions: [targetUser] });
    } else {
        repondre(`❌ No warns found for @${targetUser.split('@')[0]}`, { mentions: [targetUser] });
    }
});
