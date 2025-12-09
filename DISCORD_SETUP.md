# Discord Integration Setup Guide

This guide explains how to set up the Discord integration to send daily startup idea screenshots to your Discord channel.

## 🎯 Features

- **Automatic Notifications**: Screenshots are sent to Discord immediately after capture
- **Beautiful Embeds**: Ideas are posted with rich embeds including timestamps
- **Backfill Support**: Sync all existing archives to Discord with one command
- **Rate Limit Handling**: Built-in delays to avoid Discord rate limits

## 📋 Prerequisites

- Node.js 18+ installed
- A Discord server where you have admin permissions
- A Discord channel named `#business-ideas` (or any channel of your choice)

## 🔧 Step 1: Create Discord Webhook

1. Open **Discord** and navigate to your server
2. **Right-click** on the `#business-ideas` channel
3. Click **"Edit Channel"** (gear icon)
4. Go to **"Integrations"** → **"Webhooks"**
5. Click **"New Webhook"**
6. Configure the webhook:
   - **Name**: `Idea Bot` (or any name you prefer)
   - **Avatar**: Optional - upload a custom icon
7. Click **"Copy Webhook URL"** - **save this somewhere safe!**
8. Click **"Save Changes"**

Your webhook URL will look like:
```
https://discord.com/api/webhooks/1234567890/abcdefghijklmnop...
```

## 🔧 Step 2: Configure Environment Variables

### For Local Development

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Edit `.env` and add your webhook URL:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### For GitHub Actions

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the secret:
   - **Name**: `DISCORD_WEBHOOK_URL`
   - **Value**: Your Discord webhook URL
5. Click **"Add secret"**

## 🚀 Step 3: Install Dependencies

```bash
npm install
```

## 📤 Step 4: Sync Existing Archives to Discord

Run this once to send all existing screenshots to your Discord channel:

```bash
npm run sync-archives
```

This will:
- Find all PNG files in the `archives/` folder
- Sort them by date (oldest first)
- Send each one to Discord with a 2-second delay
- Track what's been sent in `.discord-sent.json` to avoid duplicates

**Note**: If you have many archives, this may take a while. Progress is saved, so you can interrupt and resume later.

## ✅ Step 5: Test Daily Capture

Run a manual capture to test everything works:

```bash
npm run capture
```

This will:
1. Navigate to ideabrowser.com
2. Take a screenshot
3. Save to `archives/YYYY/Month/DD Month YYYY.png`
4. Send the screenshot to Discord

## 🤖 Automatic Daily Captures

The GitHub Actions workflow (`.github/workflows/update_images.yml`) runs automatically:

- **Schedule**: Daily at midnight UTC
- **Trigger**: Also runs on push to `main` branch
- **Manual**: Can be triggered manually from GitHub Actions tab

Each capture automatically sends to Discord if `DISCORD_WEBHOOK_URL` secret is configured.

## 🛠️ Troubleshooting

### "DISCORD_WEBHOOK_URL not set" warning

Make sure you've:
- Created a `.env` file with the webhook URL (for local)
- Added the secret in GitHub repository settings (for Actions)

### Rate Limit Errors

Discord webhooks have rate limits (~30 messages per minute). If syncing many archives:
- The script automatically adds 2-second delays
- You can adjust by setting `DISCORD_DELAY_MS` environment variable

```bash
DISCORD_DELAY_MS=3000 npm run sync-archives
```

### Sync Interrupted

The sync tracks progress in `.discord-sent.json`. Just run `npm run sync-archives` again to continue from where you left off.

### Reset Sync Tracking

To re-send all archives, delete the tracking file:

```bash
rm .discord-sent.json
npm run sync-archives
```

## 📁 File Structure

```
awesome-idea-of-the-day-archive/
├── .env                    # Your webhook URL (gitignored)
├── .env.example            # Environment template
├── .discord-sent.json      # Tracks sent files (gitignored)
├── screenshot.js           # Main capture script
├── src/
│   ├── discord.js          # Discord integration module
│   └── sync-archives.js    # Archive sync script
└── archives/               # Screenshot storage
    └── 2025/
        └── December/
            └── 9 December 2025.png
```

## 🎨 Customization

### Embed Appearance

Edit `src/discord.js` to customize the Discord embed:

```javascript
const embed = {
  title: '💡 Idea of the Day',           // Change title
  color: 0x5865F2,                        // Change color (hex)
  // ...
};
```

### Bot Name & Avatar

```javascript
const payload = {
  username: 'Idea Bot',                   // Change bot name
  avatar_url: 'https://...',              // Change bot avatar
  // ...
};
```

## 🤝 Need Help?

If you encounter any issues, please [open an issue](https://github.com/yourusername/awesome-idea-of-the-day-archive/issues) on GitHub.
