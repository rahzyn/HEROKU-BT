const os = require("os");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness, uptime, and system info",
    execute: async (client, message, args) => {
        const start = Date.now();
        await message.reply("🏓 *Testing connection...*");
        const end = Date.now();
        const latency = end - start;
        
        // Uptime calculation
        const uptime = process.uptime();
        const uptimeString = formatUptime(uptime);

        // System information
        const memoryUsage = (os.freemem() / os.totalmem() * 100).toFixed(2);
        const cpuModel = os.cpus()[0].model;
        const platform = os.platform();
        
        // Response message
        const response = `🔔 *Pong!* 
⏱️ *Latency:* ${latency}ms
🕒 *Uptime:* ${uptimeString}
💻 *Platform:* ${platform}
🧠 *CPU:* ${cpuModel}
🗂️ *Memory Free:* ${memoryUsage}%`;

        await message.reply(response);
    }
};

// Helper function to format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}
