const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { zokou } = require("../framework/zokou");
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const { Catbox } = require('node-catbox');
const path = require('path');
const os = require('os');
const catbox = new Catbox();

// Generate unique temp file path
function getTempFilePath(extension) {
    return path.join(os.tmpdir(), `heroku_bt_${Date.now()}${extension}`);
}

async function uploadToCatbox(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error("💥 File does not exist");
    }
    try {
        const response = await catbox.uploadFile({ path: filePath });
        return response; // returns the uploaded file URL
    } catch (err) {
        throw new Error(String(err));
    }
}

async function convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat("mp3")
            .on("error", (err) => reject(err))
            .on("end", () => resolve(outputPath))
            .save(outputPath);
    });
}

zokou({ nomCom: "url", categorie: "General", reaction: "👨🏿‍💻" }, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre, ms } = commandeOptions;
    let mediaPath = null;
    let mediaType = '';

    try {
        if (!msgRepondu) {
            return repondre("🌺 *Reply to an image, video, or audio file* 🌺\n\n```Example: Reply to a photo with .url```");
        }

        // Check message type
        const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            return repondre("❌ *No media found in replied message* ❌");
        }

        // Determine media type and download
        if (quotedMsg.imageMessage) {
            mediaPath = await downloadMediaMessage(
                { key: { remoteJid: origineMessage }, message: quotedMsg },
                'buffer',
                {}
            );
            const tempPath = getTempFilePath('.jpg');
            fs.writeFileSync(tempPath, mediaPath);
            mediaPath = tempPath;
            mediaType = 'image';
        } 
        else if (quotedMsg.videoMessage) {
            const videoSize = quotedMsg.videoMessage.fileLength || 0;
            if (videoSize > 50 * 1024 * 1024) {
                return repondre("🎥 *Video too large* 🎥\n\n```Maximum size: 50MB```");
            }
            mediaPath = await downloadMediaMessage(
                { key: { remoteJid: origineMessage }, message: quotedMsg },
                'buffer',
                {}
            );
            const tempPath = getTempFilePath('.mp4');
            fs.writeFileSync(tempPath, mediaPath);
            mediaPath = tempPath;
            mediaType = 'video';
        } 
        else if (quotedMsg.audioMessage) {
            mediaPath = await downloadMediaMessage(
                { key: { remoteJid: origineMessage }, message: quotedMsg },
                'buffer',
                {}
            );
            const tempPath = getTempFilePath('.ogg');
            fs.writeFileSync(tempPath, mediaPath);
            
            // Convert to MP3
            const mp3Path = getTempFilePath('.mp3');
            try {
                await convertToMp3(tempPath, mp3Path);
                fs.unlinkSync(tempPath); // Remove original
                mediaPath = mp3Path;
                mediaType = 'audio';
            } catch (convError) {
                console.error("Conversion error:", convError);
                fs.unlinkSync(tempPath);
                return repondre("🔊 *Audio conversion failed* 🔊\n\n```Please try another audio file```");
            }
        } 
        else {
            return repondre("❓ *Unsupported media type* ❓\n\n```Supported: Images, Videos, Audio files```");
        }

        // Upload to Catbox
        if (!mediaPath || !fs.existsSync(mediaPath)) {
            return repondre("📁 *File download failed* 📁\n\n```Please try again```");
        }

        const catboxUrl = await uploadToCatbox(mediaPath);
        
        // Clean up temp file
        try { fs.unlinkSync(mediaPath); } catch (e) {}

        // Stylish response based on media type
        const responses = {
            image: "🖼️ *IMAGE UPLOADED* 🖼️\n━━━━━━━━━━━━━━\n📎 **Your Image URL:**\n```${catboxUrl}```\n━━━━━━━━━━━━━━\n✅ *Upload successful!*",
            video: "🎬 *VIDEO UPLOADED* 🎬\n━━━━━━━━━━━━━━\n📎 **Your Video URL:**\n```${catboxUrl}```\n━━━━━━━━━━━━━━\n✅ *Upload successful!*",
            audio: "🎵 *AUDIO UPLOADED* 🎵\n━━━━━━━━━━━━━━\n📎 **Your Audio URL:**\n```${catboxUrl}```\n━━━━━━━━━━━━━━\n✅ *Upload successful!*"
        };

        const responseText = responses[mediaType].replace('${catboxUrl}', catboxUrl);
        await repondre(responseText);

    } catch (error) {
        console.error('❌ URL Generator Error:', error);
        // Clean up on error
        if (mediaPath && fs.existsSync(mediaPath)) {
            try { fs.unlinkSync(mediaPath); } catch (e) {}
        }
        repondre(`💫 *Oops! Something went wrong* 💫\n━━━━━━━━━━━━━━\n❌ *Error:* ${error.message || 'Unknown error'}\n━━━━━━━━━━━━━━\n🔄 *Please try again later*`);
    }
});
