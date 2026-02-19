#!/bin/bash

# 打包 v11.0 版本（使用现有的可执行文件）

set -e

echo "📦 开始打包 v11.0 版本..."
echo ""

cd "$(dirname "$0")"

# 1. 检查 NewsWidget-Server 是否存在
if [ ! -f "NewsWidget-Server" ]; then
    echo "❌ NewsWidget-Server 不存在，需要先打包后端"
    echo "运行: npx pkg server.js --targets node18-macos-arm64 --output NewsWidget-Server"
    exit 1
fi

echo "✅ 后端文件已存在"
echo ""

# 2. 使用现有的 NewsWidget 可执行文件
echo "2️⃣ 使用现有的 Swift 应用..."
if [ ! -f "NewsWidget" ]; then
    echo "❌ NewsWidget 不存在"
    exit 1
fi
echo "✅ Swift 应用已存在"
echo ""

# 3. 创建 .app 包
echo "3️⃣ 创建 v11.0 .app 包..."

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
cp NewsWidget "${MACOS_DIR}/${APP_NAME}"
cp NewsWidget-Server "${MACOS_DIR}/"

# 复制资源文件
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
chmod +x "${MACOS_DIR}/${APP_NAME}"
chmod +x "${MACOS_DIR}/NewsWidget-Server"

# 创建 Info.plist
cat > "${CONTENTS_DIR}/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>${APP_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>com.openclaw.newswidget</string>
    <key>CFBundleName</key>
    <string>NewsWidget</string>
    <key>CFBundleDisplayName</key>
    <string>NewsWidget</string>
    <key>CFBundleVersion</key>
    <string>11.0</string>
    <key>CFBundleShortVersionString</key>
    <string>11.0</string>
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

DIST_NAME="NewsWidget-v11.0-macOS"
DIST_DIR="${DIST_NAME}"

rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}"

# 只复制 .app
cp -r "${APP_DIR}" "${DIST_DIR}/"

# 创建 README
cat > "${DIST_DIR}/README.txt" << 'READMEEOF'
📰 NewsWidget v11.0 (增强版)

🚀 安装方法：

直接将 NewsWidget.app 拖到「应用程序」文件夹，双击打开即可！

✨ v11.0 新功能：

- 💱 实时汇率信息（前3个货币对）
- 💬 每日一言（励志语录）
- 🎉 节假日提醒（未来7天）
- 📊 底部滚动信息条
- 🔧 IP 查询升级（支持中文，信息更详细）
- 🎓 大学信息查询

💡 核心功能：

- 22个数据源，400+条新闻
- 热点/科技/财经/综合 4个分类
- ⭐ 新闻收藏功能
- 📊 数据可视化统计
- 🔍 全局搜索（⌘F）
- 🎨 主题切换（暗色/亮色/跟随系统）
- ⚙️ 设置面板（开机自启动、刷新间隔等）
- 智能缓存（2分钟）
- 模块化架构

⚙️ 开机自启动：

在应用内「设置」标签页，打开「开机自启动」开关即可

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
v11.0 - 2026-02-19
READMEEOF

# 打包成 zip
echo "📦 压缩分发包..."
zip -r "${DIST_NAME}.zip" "${DIST_DIR}" > /dev/null

echo "✅ 分发包创建完成: ${DIST_NAME}.zip"
echo ""

# 移动到桌面
if [ -d ~/Desktop ]; then
    mv "${DIST_NAME}.zip" ~/Desktop/
    echo "📤 已移动到桌面: ~/Desktop/${DIST_NAME}.zip"
fi

# 显示文件大小
APP_SIZE=$(du -sh "${APP_DIR}" | cut -f1)
ZIP_SIZE=$(du -sh ~/Desktop/"${DIST_NAME}.zip" | cut -f1)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ v11.0 版本打包完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 生成的文件："
echo "   • NewsWidget.app/ - macOS 应用包 (${APP_SIZE})"
echo "   • ~/Desktop/${DIST_NAME}.zip - 分发包 (${ZIP_SIZE})"
echo ""
echo "🚀 本地测试："
echo "   open NewsWidget.app"
echo ""
echo "📤 分发给别人："
echo "   1. 发送 ~/Desktop/${DIST_NAME}.zip"
echo "   2. 对方解压后，将 NewsWidget.app 拖到「应用程序」文件夹"
echo "   3. 双击打开即可使用"
echo ""
echo "✨ v11.0 特点："
echo "   • ✅ 增强信息模块（汇率、每日一言、节假日）"
echo "   • ✅ IP 查询升级（支持中文）"
echo "   • ✅ 大学信息查询"
echo "   • ✅ 无需安装 Node.js"
echo "   • ✅ 开箱即用"
echo ""
