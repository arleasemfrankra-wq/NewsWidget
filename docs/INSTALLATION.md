# Installation Guide

This guide will help you install and set up NewsWidget on your macOS system.

---

## 📋 System Requirements

- **macOS**: 10.15 (Catalina) or later
- **RAM**: 512MB minimum (1GB recommended)
- **Disk Space**: 50MB
- **Internet**: Required for news fetching

---

## 📥 Download

### Option 1: Download from Releases (Recommended)

1. Go to the [Releases page](https://github.com/YOUR_USERNAME/NewsWidget/releases)
2. Download the latest `NewsWidget-vX.X.X-macOS.zip`
3. The file is about 16MB

### Option 2: Build from Source

See [Development Guide](DEVELOPMENT.md) for building from source.

---

## 🚀 Installation Steps

### Step 1: Extract the Archive

1. Locate the downloaded `NewsWidget-vX.X.X-macOS.zip` in your Downloads folder
2. Double-click to extract it
3. You'll see a folder containing `NewsWidget.app`

### Step 2: Move to Applications

1. Open the extracted folder
2. Drag `NewsWidget.app` to your **Applications** folder
3. You can also keep it anywhere you like, but Applications is recommended

### Step 3: First Launch

1. Open your **Applications** folder
2. Find **NewsWidget**
3. **Right-click** (or Control-click) on NewsWidget.app
4. Select **"Open"** from the menu
5. Click **"Open"** in the security dialog

> **Why right-click?** macOS Gatekeeper requires this for unsigned apps on first launch.

---

## 🔒 Security Warning

### "Cannot verify developer" Message

If you see this message:

1. Go to **System Preferences** → **Security & Privacy**
2. Click the **"General"** tab
3. You'll see a message about NewsWidget being blocked
4. Click **"Open Anyway"**
5. Confirm by clicking **"Open"**

This is normal for apps not distributed through the Mac App Store.

---

## ⚙️ Post-Installation Setup

### Enable Auto-Start (Optional)

1. Open NewsWidget
2. Click the **"Settings"** tab (gear icon)
3. Toggle **"Auto-start at login"** to ON
4. The app will now start automatically when you log in

### Configure Refresh Interval

1. In the **Settings** tab
2. Select your preferred **"Refresh Interval"**:
   - 5 minutes (most frequent)
   - 10 minutes (default)
   - 30 minutes
   - 60 minutes (least frequent)

---

## 🎨 Customization

### Change Theme

1. Open the **Settings** tab
2. Under **"Theme"**, select:
   - **Dark** - Dark background (default)
   - **Light** - Bright, clean look
   - **System** - Follows macOS appearance

### Window Size

- Drag the window corners to resize
- Minimum: 320×480
- Maximum: 600×1200
- Position is saved automatically

---

## 🔄 Updating

### Check for Updates

Currently, updates are manual:

1. Visit the [Releases page](https://github.com/YOUR_USERNAME/NewsWidget/releases)
2. Download the latest version
3. Replace the old app with the new one
4. Your settings and favorites are preserved

> **Note**: Auto-update feature is planned for future releases.

---

## 🗑️ Uninstallation

### Remove the App

1. Quit NewsWidget (⌘Q)
2. Move `NewsWidget.app` to Trash
3. Empty Trash

### Remove Auto-Start (if enabled)

1. Before uninstalling, open NewsWidget
2. Go to **Settings** → Disable **"Auto-start at login"**

Or manually:

```bash
rm ~/Library/LaunchAgents/com.openclaw.newswidget.plist
launchctl unload ~/Library/LaunchAgents/com.openclaw.newswidget.plist
```

### Remove User Data (optional)

NewsWidget stores data in localStorage (browser storage). To completely remove:

1. Open NewsWidget
2. Go to **Settings**
3. Click **"Clear All Data"**

---

## 🐛 Troubleshooting

### App Won't Open

**Problem**: Double-clicking does nothing

**Solution**:
1. Right-click → Open (first time only)
2. Check System Preferences → Security & Privacy
3. Make sure you're running macOS 10.15+

### "Damaged" Error

**Problem**: "NewsWidget is damaged and can't be opened"

**Solution**:
```bash
xattr -cr /Applications/NewsWidget.app
```

This removes the quarantine attribute.

### No News Loading

**Problem**: App opens but no news appears

**Solution**:
1. Check your internet connection
2. Try clicking the refresh button (↻)
3. Check if port 3000 is available
4. Restart the app

### High CPU Usage

**Problem**: App uses too much CPU

**Solution**:
1. Close other browser tabs
2. Increase refresh interval (Settings → 60 minutes)
3. Restart the app

---

## 💡 Tips

### Keyboard Shortcuts

- `⌘R` - Refresh news
- `⌘F` - Search
- `⌘W` - Hide window
- `⌘Q` - Quit app

### Best Practices

1. **Set appropriate refresh interval**: 10-30 minutes is optimal
2. **Use favorites**: Save important news for later
3. **Try different themes**: Find what works best for you
4. **Enable auto-start**: Never miss important news

---

## 📞 Need Help?

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/NewsWidget/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/NewsWidget/discussions)
- **Documentation**: [docs/](.)

---

**Enjoy NewsWidget!** 🎉
