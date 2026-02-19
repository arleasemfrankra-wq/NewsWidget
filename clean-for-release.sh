#!/bin/bash

# Clean up script for preparing NewsWidget for open source release
# This script removes temporary files, build artifacts, and sensitive data

set -e

echo "🧹 Cleaning NewsWidget for open source release..."
echo ""

cd "$(dirname "$0")"

# 1. Remove build artifacts
echo "1️⃣ Removing build artifacts..."
rm -f NewsWidget
rm -f NewsWidget-Desktop
rm -f NewsWidget-Simple
rm -f NewsWidget-new
rm -f NewsWidget-Server
rm -f NewsWidget-Server-Fixed
rm -rf NewsWidget.app
rm -f *.zip
rm -f *.dmg
rm -f *.pkg
echo "   ✅ Build artifacts removed"
echo ""

# 2. Remove node_modules (will be reinstalled)
echo "2️⃣ Removing node_modules..."
rm -rf node_modules
echo "   ✅ node_modules removed"
echo ""

# 3. Remove logs and temporary files
echo "3️⃣ Removing logs and temporary files..."
rm -f *.log
rm -f *~
rm -f *.tmp
rm -f *.bak
rm -f *.swp
rm -f .DS_Store
find . -name ".DS_Store" -delete
echo "   ✅ Temporary files removed"
echo ""

# 4. Remove backup files
echo "4️⃣ Removing backup files..."
rm -f *-backup.*
rm -f *.backup
rm -f index-v9.html.backup
rm -f app-v9.js.backup
echo "   ✅ Backup files removed"
echo ""

# 5. Remove test files
echo "5️⃣ Removing test files..."
rm -f test-*.js
rm -f *-test.js
echo "   ✅ Test files removed"
echo ""

# 6. Remove sensitive/private files
echo "6️⃣ Removing sensitive files..."
rm -f PRIVACY-CHECK.md
rm -f .env
rm -f .env.local
echo "   ✅ Sensitive files removed"
echo ""

# 7. Clean Xcode build artifacts
echo "7️⃣ Cleaning Xcode artifacts..."
rm -rf DerivedData
rm -rf NewsWidgetApp.xcodeproj/xcuserdata
rm -rf NewsWidgetApp.xcworkspace/xcuserdata
echo "   ✅ Xcode artifacts cleaned"
echo ""

# 8. Verify no personal information in files
echo "8️⃣ Checking for personal information..."
if grep -r "mrying" . --exclude-dir=node_modules --exclude-dir=.git --exclude="clean-for-release.sh" 2>/dev/null; then
    echo "   ⚠️  Warning: Found 'mrying' in files above"
    echo "   Please review and replace with generic placeholders"
else
    echo "   ✅ No personal information found"
fi
echo ""

# 9. Create .gitignore if not exists
if [ ! -f .gitignore ]; then
    echo "9️⃣ Creating .gitignore..."
    cat > .gitignore << 'EOF'
# macOS
.DS_Store

# Node.js
node_modules/
*.log

# Build
*.app
NewsWidget
NewsWidget-*
dist/
build/

# Distribution
*.zip
*.dmg
*.pkg

# Xcode
xcuserdata/
DerivedData/

# Temporary
*~
*.tmp
*.bak
*.swp

# Environment
.env
.env.local

# Private
PRIVACY-CHECK.md
EOF
    echo "   ✅ .gitignore created"
else
    echo "9️⃣ .gitignore already exists"
fi
echo ""

# 10. Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Cleanup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo "   1. Review files for any remaining personal information"
echo "   2. Add screenshots to docs/screenshots/"
echo "   3. Update README.md with your GitHub username"
echo "   4. Run: npm install"
echo "   5. Test the app: node server.js"
echo "   6. Initialize git: git init"
echo "   7. Add files: git add ."
echo "   8. Commit: git commit -m 'Initial commit'"
echo "   9. Push to GitHub"
echo ""
echo "🎉 Ready for open source release!"
