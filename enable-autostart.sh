#!/bin/bash

# 桌面新闻小组件 - 开机自启动配置脚本

echo "⚙️  配置开机自启动..."
echo ""

cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"

# 1. 创建 LaunchAgent plist
PLIST_NAME="com.openclaw.newswidget.plist"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_NAME}"

echo "1️⃣ 创建 LaunchAgent 配置..."

mkdir -p "$HOME/Library/LaunchAgents"

cat > "${PLIST_PATH}" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.openclaw.newswidget</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>${SCRIPT_DIR}/start.sh</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <false/>
    
    <key>StandardOutPath</key>
    <string>/tmp/widget.log</string>
    
    <key>StandardErrorPath</key>
    <string>/tmp/widget-error.log</string>
    
    <key>WorkingDirectory</key>
    <string>${SCRIPT_DIR}</string>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
EOF

echo "✅ 配置文件已创建: ${PLIST_PATH}"
echo ""

# 2. 不立即加载，避免和当前运行的实例冲突
echo "2️⃣ 配置已保存，下次开机时自动生效"
echo ""

# 3. 验证
echo "3️⃣ 验证配置..."
if [ -f "${PLIST_PATH}" ]; then
    echo "✅ 开机自启动配置成功！"
else
    echo "⚠️  配置文件创建失败"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 配置完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 配置信息："
echo "   • 配置文件: ${PLIST_PATH}"
echo "   • 启动脚本: ${SCRIPT_DIR}/start.sh"
echo "   • 日志文件: /tmp/widget.log"
echo "   • 错误日志: /tmp/widget-error.log"
echo ""
echo "💡 提示："
echo "   • 下次开机会自动启动"
echo "   • 当前运行的应用不受影响"
echo "   • 如需取消自启动，运行: ./disable-autostart.sh"
echo ""
