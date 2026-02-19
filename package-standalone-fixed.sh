#!/bin/bash

# 使用修复后的 pkg 打包，生成独立可执行文件

set -e

echo "📦 开始打包独立版本（修复版）..."
echo ""

cd "$(dirname "$0")"

# 1. 使用 pkg 打包 server-pkg.js
echo "1️⃣ 打包 Node.js 后端..."
npx pkg server-pkg.js --targets node18-macos-arm64 --output NewsWidget-Server

echo "✅ 后端打包完成"
echo ""

# 2. 编译 Swift 应用
echo "2️⃣ 编译 Swift 应用..."
if [ ! -f "NewsWidget-Desktop" ]; then
    swiftc -o NewsWidget-Desktop widget-desktop.swift -framework Cocoa -framework WebKit
    chmod +x NewsWidget-Desktop
fi
echo "✅ Swift 应用编译完成"
echo ""

# 3. 创建 .app 包
echo "3️⃣ 创建独立 .app 包..."

APP_NAME="NewsWidget"
APP_DIR="${APP_NAME}.app"
CONTENTS_DIR="${APP_DIR}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"

# 清理旧的
rm -rf "${APP_DIR}"

# 创建目录结构
mkdir -p "${MACOS_DIR}"
mkdir -p "${RESOURCES_DIR}"

# 复制可执行文件
cp NewsWidget-Desktop "${MACOS_DIR}/${APP_NAME}"
cp NewsWidget-Server "${MACOS_DIR}/"

# 复制资源文件（pkg 需要这些文件在同级目录）
cp -r renderer "${MACOS_DIR}/"
cp -r backend "${MACOS_DIR}/"

# 创建启动脚本
cat > "${MACOS_DIR}/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
./NewsWidget-Server > /tmp/widget-standalone.log 2>&1 &
sleep 1
./NewsWidget
EOF

chmod +x "${MACOS_DIR}/start.sh"

# 创建 Info.plist
cat > "${CONTENTS_DIR}/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>start.sh</string>
    <key>CFBundleIdentifier</key>
    <string>com.openclaw.newswidget</string>
    <key>CFBundleName</key>
    <string>NewsWidget</string>
    <key>CFBundleDisplayName</key>
    <string>桌面新闻小组件</string>
    <key>CFBundleVersion</key>
    <string>10.0</string>
    <key>CFBundleShortVersionString</key>
    <string>10.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleIconFile</key>
    <string>NewsWidget</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSUIElement</key>
    <false/>
</dict>
</plist>
EOF

# 复制图标文件
if [ -f "NewsWidget.icns" ]; then
    cp NewsWidget.icns "${RESOURCES_DIR}/"
fi

echo "✅ .app 包创建完成: ${APP_DIR}"
echo ""

# 4. 创建分发包
echo "4️⃣ 创建分发包..."

DIST_NAME="NewsWidget-v10.0-Standalone-macOS"
DIST_DIR="${DIST_NAME}"

rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}"

# 只复制 .app
cp -r "${APP_DIR}" "${DIST_DIR}/"

# 创建 README
cat > "${DIST_DIR}/README.txt" << 'READMEEOF'
📰 桌面新闻小组件 v10.0 (独立版)

🚀 安装方法：

直接将 NewsWidget.app 拖到「应用程序」文件夹，双击打开即可！

💡 功能特性：

- 22个数据源，400+条新闻
- 热点/科技/财经/综合 4个分类
- ⭐ 新闻收藏功能
- 📊 数据可视化统计
- 🔍 全局搜索（⌘F）
- 🎨 主题切换（暗色/亮色/跟随系统）
- ⚙️ 设置面板（刷新间隔等）
- 智能缓存（2分钟）
- 模块化架构（v10.0）

📝 系统要求：

- macOS 10.15 或更高版本
- ✅ 无需安装 Node.js！

🐛 首次运行：

如果提示"无法验证开发者"：
  系统偏好设置 → 安全性与隐私 → 点击"仍要打开"

🔒 隐私说明：

- 所有数据存储在本地
- 只访问公开免费 API
- 不上传任何个人信息

---
OpenClaw AI Assistant
2026-02-18
READMEEOF

# 打包成 zip
echo "📦 压缩分发包..."
zip -r "${DIST_NAME}.zip" "${DIST_DIR}" > /dev/null

echo "✅ 分发包创建完成: ${DIST_NAME}.zip"
echo ""

# 显示文件大小
APP_SIZE=$(du -sh "${APP_DIR}" | cut -f1)
ZIP_SIZE=$(du -sh "${DIST_NAME}.zip" | cut -f1)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 独立版本打包完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 生成的文件："
echo "   • NewsWidget.app/ - macOS 应用包 (${APP_SIZE})"
echo "   • ${DIST_NAME}.zip - 分发包 (${ZIP_SIZE})"
echo ""
echo "🚀 本地测试："
echo "   open NewsWidget.app"
echo ""
echo "📤 分发给别人："
echo "   1. 发送 ${DIST_NAME}.zip"
echo "   2. 对方解压后，将 NewsWidget.app 拖到「应用程序」文件夹"
echo "   3. 双击打开即可使用"
echo ""
echo "✨ 特点："
echo "   • ✅ 无需安装 Node.js"
echo "   • ✅ 开箱即用"
echo "   • ✅ 包含所有依赖"
echo "   • ✅ 路径问题已修复"
echo ""
