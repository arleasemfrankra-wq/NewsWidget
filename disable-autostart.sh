#!/bin/bash

# 桌面新闻小组件 - 取消开机自启动

echo "⚙️  取消开机自启动..."
echo ""

PLIST_NAME="com.openclaw.newswidget.plist"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_NAME}"

if [ ! -f "${PLIST_PATH}" ]; then
    echo "⚠️  未找到配置文件，可能未配置过自启动"
    exit 0
fi

# 1. 卸载 LaunchAgent
echo "1️⃣ 卸载 LaunchAgent..."
launchctl unload "${PLIST_PATH}" 2>/dev/null || true
echo "✅ LaunchAgent 已卸载"
echo ""

# 2. 删除配置文件
echo "2️⃣ 删除配置文件..."
rm -f "${PLIST_PATH}"
echo "✅ 配置文件已删除"
echo ""

# 3. 验证
echo "3️⃣ 验证..."
if launchctl list | grep -q "com.openclaw.newswidget"; then
    echo "⚠️  服务可能仍在运行，请重启系统"
else
    echo "✅ 开机自启动已取消"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示："
echo "   • 下次开机不会自动启动"
echo "   • 如需重新启用，运行: ./enable-autostart.sh"
echo "   • 当前运行的实例不受影响"
echo ""
