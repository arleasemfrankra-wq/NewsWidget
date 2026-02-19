#!/bin/bash

# 打包成 macOS .app 应用

cd "$(dirname "$0")"

APP_NAME="NewsWidget"
APP_DIR="${APP_NAME}.app"

echo "📦 打包 ${APP_NAME}.app..."
echo ""

# 1. 编译可执行文件
echo "🔨 编译可执行文件..."
swiftc -o ${APP_NAME} widget.swift -framework Cocoa -framework WebKit

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi

# 2. 创建 .app 目录结构
echo "📁 创建应用结构..."
rm -rf ${APP_DIR}
mkdir -p ${APP_DIR}/Contents/MacOS
mkdir -p ${APP_DIR}/Contents/Resources
mkdir -p ${APP_DIR}/Contents/Resources/backend
mkdir -p ${APP_DIR}/Contents/Resources/renderer

# 3. 复制可执行文件
cp ${APP_NAME} ${APP_DIR}/Contents/MacOS/

# 4. 复制资源文件
cp server.js ${APP_DIR}/Contents/Resources/
cp -r backend ${APP_DIR}/Contents/Resources/
cp -r renderer ${APP_DIR}/Contents/Resources/
cp package.json ${APP_DIR}/Contents/Resources/

# 5. 创建 Info.plist
cat > ${APP_DIR}/Contents/Info.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>zh_CN</string>
    <key>CFBundleExecutable</key>
    <string>NewsWidget</string>
    <key>CFBundleIdentifier</key>
    <string>com.openclaw.newswidget</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>新闻小组件</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>LSUIElement</key>
    <true/>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

# 6. 设置权限
chmod +x ${APP_DIR}/Contents/MacOS/${APP_NAME}

echo ""
echo "✅ 打包完成！"
echo ""
echo "📱 应用位置: ${APP_DIR}"
echo ""
echo "🚀 使用方式："
echo "   1. 双击打开: open ${APP_DIR}"
echo "   2. 拖到应用程序文件夹"
echo "   3. 从启动台启动"
echo ""
