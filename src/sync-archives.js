#!/usr/bin/env node
/**
 * Sync all existing archives to Discord
 * Run this once to backfill your Discord channel with existing screenshots
 * 
 * Usage: 
 *   npm run sync-archives
 *   
 * Or manually:
 *   DISCORD_WEBHOOK_URL=your_webhook_url node src/sync-archives.js
 */

require('dotenv').config();
const path = require('path');
const { sendAllArchives } = require('./discord');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const ARCHIVES_DIR = path.join(__dirname, '..', 'archives');

// Delay between messages in milliseconds (2 seconds default to avoid rate limits)
const DELAY_MS = parseInt(process.env.DISCORD_DELAY_MS) || 2000;

async function main() {
    console.log('🚀 Starting Discord Archive Sync');
    console.log('================================\n');

    if (!WEBHOOK_URL) {
        console.error('❌ Error: DISCORD_WEBHOOK_URL environment variable is not set.');
        console.error('');
        console.error('Please set it in your .env file or pass it directly:');
        console.error('  DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... npm run sync-archives');
        process.exit(1);
    }

    console.log(`📂 Archives directory: ${ARCHIVES_DIR}`);
    console.log(`⏱️  Delay between messages: ${DELAY_MS}ms`);
    console.log('');

    try {
        const count = await sendAllArchives(ARCHIVES_DIR, WEBHOOK_URL, DELAY_MS);
        console.log(`\n🎉 Successfully synced ${count} files to Discord!`);
    } catch (error) {
        console.error(`\n❌ Sync failed: ${error.message}`);
        process.exit(1);
    }
}

main();
