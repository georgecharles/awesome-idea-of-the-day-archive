const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

/**
 * Send a screenshot to Discord via webhook
 * @param {string} imagePath - Path to the image file
 * @param {string} webhookUrl - Discord webhook URL
 * @param {object} options - Additional options
 * @returns {Promise<boolean>} - Success status
 */
async function sendToDiscord(imagePath, webhookUrl, options = {}) {
    if (!webhookUrl) {
        throw new Error('Discord webhook URL is required. Set DISCORD_WEBHOOK_URL environment variable.');
    }

    if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
    }

    const filename = path.basename(imagePath);
    const dateMatch = filename.match(/^(\d+)\s+(\w+)\s+(\d+)\.png$/);

    let formattedDate = filename.replace('.png', '');
    if (dateMatch) {
        formattedDate = `${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}`;
    }

    // Create embed message
    const embed = {
        title: '💡 Idea of the Day',
        description: `**${formattedDate}**\n\nFresh startup idea captured from [Ideabrowser.com](https://www.ideabrowser.com/)`,
        color: 0x5865F2, // Discord blurple
        footer: {
            text: '🚀 Awesome Idea of the Day Archive'
        },
        timestamp: new Date().toISOString(),
        ...options.embed
    };

    // Create form data with the image
    const form = new FormData();

    // Add the payload JSON
    const payload = {
        embeds: [embed],
        username: options.username || 'Idea Bot',
        avatar_url: options.avatarUrl || 'https://www.ideabrowser.com/favicon.ico'
    };

    form.append('payload_json', JSON.stringify(payload));
    form.append('file', fs.createReadStream(imagePath), {
        filename: filename,
        contentType: 'image/png'
    });

    // Send to Discord
    const response = await fetch(webhookUrl, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API error (${response.status}): ${errorText}`);
    }

    console.log(`✅ Sent to Discord: ${filename}`);
    return true;
}

/**
 * Send all existing archives to Discord
 * @param {string} archivesDir - Path to archives directory
 * @param {string} webhookUrl - Discord webhook URL
 * @param {number} delayMs - Delay between messages (to avoid rate limits)
 */
async function sendAllArchives(archivesDir, webhookUrl, delayMs = 2000) {
    const sentLogPath = path.join(__dirname, '..', '.discord-sent.json');
    let sentFiles = [];

    // Load previously sent files
    if (fs.existsSync(sentLogPath)) {
        try {
            sentFiles = JSON.parse(fs.readFileSync(sentLogPath, 'utf8'));
        } catch (e) {
            console.warn('Could not parse sent log, starting fresh');
            sentFiles = [];
        }
    }

    // Find all PNG files in archives
    const files = getAllPngFiles(archivesDir);

    // Sort files by date (oldest first)
    files.sort((a, b) => {
        const dateA = extractDateFromPath(a);
        const dateB = extractDateFromPath(b);
        return dateA - dateB;
    });

    console.log(`📁 Found ${files.length} archive files`);
    console.log(`📤 Already sent: ${sentFiles.length} files`);

    const newFiles = files.filter(f => !sentFiles.includes(f));
    console.log(`🆕 New files to send: ${newFiles.length}`);

    for (const file of newFiles) {
        try {
            await sendToDiscord(file, webhookUrl);
            sentFiles.push(file);

            // Save progress after each successful send
            fs.writeFileSync(sentLogPath, JSON.stringify(sentFiles, null, 2));

            // Delay to avoid rate limits (Discord allows ~30 messages/minute for webhooks)
            if (newFiles.indexOf(file) < newFiles.length - 1) {
                console.log(`⏳ Waiting ${delayMs}ms before next message...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        } catch (error) {
            console.error(`❌ Failed to send ${file}: ${error.message}`);
            // Continue with next file
        }
    }

    console.log(`\n✅ Sync complete! Sent ${newFiles.length} new files to Discord.`);
    return newFiles.length;
}

/**
 * Recursively get all PNG files from a directory
 */
function getAllPngFiles(dir) {
    const files = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            files.push(...getAllPngFiles(fullPath));
        } else if (item.isFile() && item.name.endsWith('.png') && !item.name.startsWith('.')) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Extract date from file path for sorting
 */
function extractDateFromPath(filePath) {
    const filename = path.basename(filePath);
    const match = filename.match(/^(\d+)\s+(\w+)\s+(\d+)\.png$/);

    if (match) {
        const day = parseInt(match[1]);
        const monthName = match[2];
        const year = parseInt(match[3]);

        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = months.indexOf(monthName);

        if (monthIndex !== -1) {
            return new Date(year, monthIndex, day).getTime();
        }
    }

    return 0;
}

module.exports = {
    sendToDiscord,
    sendAllArchives,
    getAllPngFiles
};
