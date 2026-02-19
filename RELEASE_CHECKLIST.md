# Open Source Release Checklist

Use this checklist to prepare NewsWidget for open source release on GitHub.

---

## 📋 Pre-Release Checklist

### Documentation
- [x] README.md (English) - Complete with badges, features, installation
- [x] README.zh-CN.md (Chinese) - Translated version
- [x] LICENSE - MIT License
- [x] CONTRIBUTING.md - Contribution guidelines
- [x] CODE_OF_CONDUCT.md - Community standards
- [x] CHANGELOG.md - Version history
- [x] docs/INSTALLATION.md - Installation guide
- [x] docs/DEVELOPMENT.md - Development guide
- [ ] docs/screenshots/ - Add actual screenshots

### GitHub Configuration
- [x] .gitignore - Ignore build artifacts and sensitive files
- [x] .github/ISSUE_TEMPLATE/bug_report.md - Bug report template
- [x] .github/ISSUE_TEMPLATE/feature_request.md - Feature request template
- [x] .github/pull_request_template.md - PR template

### Code Quality
- [ ] Remove all personal information (run clean-for-release.sh)
- [ ] Remove temporary files and build artifacts
- [ ] Test all features work correctly
- [ ] Verify no API keys or secrets in code
- [ ] Check all links in documentation

### Repository Setup
- [ ] Create GitHub repository
- [ ] Initialize git: `git init`
- [ ] Add remote: `git remote add origin <URL>`
- [ ] Create initial commit
- [ ] Push to GitHub
- [ ] Add repository description
- [ ] Add topics/tags
- [ ] Enable Issues
- [ ] Enable Discussions

### Release Preparation
- [ ] Create v11.0.0 release
- [ ] Upload NewsWidget-v11.0-macOS.zip
- [ ] Write release notes
- [ ] Add screenshots to release

---

## 🚀 Release Steps

### 1. Clean the Repository

```bash
# Run cleanup script
./clean-for-release.sh

# Verify no personal info
grep -r "mrying" . --exclude-dir=node_modules --exclude-dir=.git
```

### 2. Add Screenshots

Take screenshots and add to `docs/screenshots/`:
- dark-theme.png
- light-theme.png
- statistics.png
- search.png

### 3. Update README

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
# In README.md and README.zh-CN.md
sed -i '' 's/YOUR_USERNAME/your-actual-username/g' README.md
sed -i '' 's/YOUR_USERNAME/your-actual-username/g' README.zh-CN.md
```

### 4. Initialize Git

```bash
# Initialize repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: NewsWidget v11.0

- 22 news sources with 400+ news items
- Favorites, search, statistics, themes
- Enhanced info: exchange rates, quotes, holidays
- Modular ES6 architecture
- Complete documentation"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/NewsWidget.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 5. Create GitHub Release

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Tag: `v11.0.0`
4. Title: `NewsWidget v11.0 - Enhanced Information`
5. Description:

```markdown
## 🎉 NewsWidget v11.0 - Enhanced Information

### ✨ New Features

- 💱 **Real-time Exchange Rates**: Display top 3 currency pairs
- 💬 **Daily Quotes**: Inspirational quotes from Hitokoto
- 🎉 **Holiday Reminders**: Upcoming holidays in the next 7 days
- 📊 **Scrolling Info Bar**: Bottom scrolling bar for enhanced info

### 🔧 Improvements

- Enhanced IP query API with Chinese support
- University information query
- Better error handling

### 📦 Download

- **NewsWidget-v11.0-macOS.zip** (16MB)
- Requires macOS 10.15+
- No Node.js installation needed

### 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Contributing](CONTRIBUTING.md)

### 🙏 Acknowledgments

Thanks to all the free API providers and the open source community!
```

6. Upload `NewsWidget-v11.0-macOS.zip`
7. Publish release

### 6. Configure Repository

**Settings → General**:
- Description: "A beautiful desktop news widget for macOS with 22+ news sources"
- Website: (your website or demo URL)
- Topics: `macos`, `news`, `swift`, `nodejs`, `electron`, `desktop-app`, `news-aggregator`

**Settings → Features**:
- ✅ Issues
- ✅ Discussions
- ✅ Projects (optional)
- ✅ Wiki (optional)

**Settings → Security**:
- Enable Dependabot alerts
- Enable security advisories

### 7. Create Initial Issues (Optional)

Create some "good first issue" labels:
- Documentation improvements
- Add new news sources
- UI enhancements
- Bug fixes

---

## 📣 Promotion

### Share on Social Media

- Twitter/X
- Reddit (r/macapps, r/opensource)
- Hacker News
- Product Hunt
- Chinese communities (V2EX, Juejin)

### Example Post

```
🎉 Just open-sourced NewsWidget - a beautiful macOS desktop news widget!

✨ Features:
- 22 news sources, 400+ items
- Dark/Light themes
- Search, favorites, statistics
- Real-time exchange rates & daily quotes

Built with Swift + Node.js + ES6 modules
MIT License | macOS 10.15+

⭐ Star on GitHub: [your-repo-url]
```

---

## 🔄 Post-Release

### Monitor

- [ ] Watch for issues
- [ ] Respond to questions
- [ ] Review pull requests
- [ ] Update documentation as needed

### Maintain

- [ ] Fix bugs promptly
- [ ] Consider feature requests
- [ ] Keep dependencies updated
- [ ] Release updates regularly

### Engage

- [ ] Thank contributors
- [ ] Help new users
- [ ] Build community
- [ ] Have fun! 🎉

---

## 📊 Success Metrics

Track these metrics:
- ⭐ GitHub stars
- 🍴 Forks
- 📥 Downloads
- 🐛 Issues opened/closed
- 🔀 Pull requests
- 💬 Discussions

---

## ✅ Final Checklist

Before announcing:
- [ ] All documentation is complete
- [ ] Screenshots are added
- [ ] Code is clean and tested
- [ ] Release is published
- [ ] Repository is configured
- [ ] README looks good on GitHub
- [ ] All links work

---

## 🎉 You're Ready!

Once all items are checked, your project is ready for the world!

**Good luck with your open source project!** 🚀

---

**Questions?** Review the documentation or create an issue.
