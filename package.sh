#!/bin/bash

# 桌面新闻小组件 - 打包脚本
# 将应用打包成可分发的格式

set -e

echo "📦 开始打包桌面新闻小组件..."
echo ""

cd "$(dirname "$0")"

# 1. 检查依赖
echo "1️⃣ 检查依赖..."

if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 未找到 npm，请先安装"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"
echo ""

# 2. 安装依赖
echo "2️⃣ 安装 Node.js 依赖..."
npm install
echo ""

# 3. 编译 Swift 应用
echo "3️⃣ 编译 Swift 应用..."
if [ ! -f "NewsWidget-Desktop" ]; then
    swiftc -o NewsWidget-Desktop widget-desktop.swift -framework Cocoa -framework WebKit
    chmod +x NewsWidget-Desktop
fi
echo "✅ Swift 应用编译完成"
echo ""

# 4. 创建 .app 包结构
echo "4️⃣ 创建 .app 包..."

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

# 复制资源文件
cp -r renderer "${RESOURCES_DIR}/"
cp -r backend "${RESOURCES_DIR}/"
cp server.js "${RESOURCES_DIR}/"
cp package.json "${RESOURCES_DIR}/"

# 只复制生产依赖（排除 electron 等开发依赖）
echo "   复制生产依赖（排除 devDependencies）..."
mkdir -p "${RESOURCES_DIR}/node_modules"
cp -r node_modules/axios "${RESOURCES_DIR}/node_modules/" 2>/dev/null || true
cp -r node_modules/cheerio "${RESOURCES_DIR}/node_modules/" 2>/dev/null || true
# 复制这两个包的依赖
for dep in node_modules/axios/node_modules/* node_modules/cheerio/node_modules/*; do
    if [ -d "$dep" ]; then
        cp -r "$dep" "${RESOURCES_DIR}/node_modules/" 2>/dev/null || true
    fi
done
# 复制顶层共享依赖
for pkg in node_modules/*; do
    pkg_name=$(basename "$pkg")
    # 排除 electron 和其他大型开发依赖
    if [[ "$pkg_name" != "electron" && "$pkg_name" != ".bin" && "$pkg_name" != ".package-lock.json" ]]; then
        if [ ! -d "${RESOURCES_DIR}/node_modules/$pkg_name" ]; then
            cp -r "$pkg" "${RESOURCES_DIR}/node_modules/" 2>/dev/null || true
        fi
    fi
done

# 创建启动脚本
cat > "${MACOS_DIR}/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/../Resources"
node server.js > /tmp/widget.log 2>&1 &
sleep 1
cd "$(dirname "$0")"
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
    <string>${APP_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>com.openclaw.newswidget</string>
    <key>CFBundleName</key>
    <string>NewsWidget</string>
    <key>CFBundleDisplayName</key>
    <string>桌面新闻小组件</string>
    <key>CFBundleVersion</key>
    <string>9.4</string>
    <key>CFBundleShortVersionString</key>
    <string>9.4</string>
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
cp NewsWidget.icns "${RESOURCES_DIR}/"

echo "✅ .app 包创建完成: ${APP_DIR}"
echo ""

# 5. 创建分发包
echo "5️⃣ 创建分发包..."

DIST_NAME="NewsWidget-v9.4-macOS"
DIST_DIR="${DIST_NAME}"

rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}"

# 只复制 .app 和说明文件
cp -r "${APP_DIR}" "${DIST_DIR}/"

# 复制更新的 README
if [ -f "README-v9.4.txt" ]; then
    cp README-v9.4.txt "${DIST_DIR}/README.txt"
else
    # 如果没有 README-v9.4.txt，创建一个默认的
    cat > "${DIST_DIR}/README.txt" << 'READMEEOF'
📰 桌面新闻小组件 v9.4

🚀 安装方法：

方法1（推荐）：
  直接将 NewsWidget.app 拖到「应用程序」文件夹

方法2：
  双击 NewsWidget.app 直接运行

💡 功能特性：

- 22个数据源，400+条新闻
- 热点/科技/财经/综合 4个分类
- ⭐ 新闻收藏功能
- 📊 数据可视化统计
- 🔍 全局搜索（⌘F）
- 🎨 主题切换（暗色/亮色/跟随系统）
- ⚙️ 设置面板（开机自启动、刷新间隔等）
- 触控板滑动切换
- 智能缓存（2分钟）

⚙️ 开机自启动：

在应用内「设置」标签页，打开「开机自启动」开关即可

📝 系统要求：

- macOS 10.15 或更高版本
- Node.js 14 或更高版本（https://nodejs.org/）

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
fi

# 打包成 zip
echo "📦 压缩分发包..."
zip -r "${DIST_NAME}.zip" "${DIST_DIR}" > /dev/null

echo "✅ 分发包创建完成: ${DIST_NAME}.zip"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 打包完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 生成的文件："
echo "   • NewsWidget.app/ - macOS 应用包"
echo "   • ${DIST_NAME}.zip - 分发包（可发送给别人）"
echo ""
echo "🚀 本地测试："
echo "   open NewsWidget.app"
echo ""
echo "📤 分发给别人："
echo "   1. 发送 ${DIST_NAME}.zip"
echo "   2. 对方解压后，将 NewsWidget.app 拖到「应用程序」文件夹"
echo "   3. 双击打开即可使用"
echo ""
echo "⚠️  注意："
echo "   • 对方需要先安装 Node.js (https://nodejs.org/)"
echo "   • 首次运行可能需要在「安全性与隐私」中允许"
echo ""
