#!/bin/bash

# 桌面小组件 - 启动脚本 v2.0

cd "$(dirname "$0")"

echo "🚀 启动桌面新闻小组件..."
echo ""

# 停止旧进程
if pgrep -f "NewsWidget-Desktop" > /dev/null; then
    echo "⚠️  检测到旧进程，正在停止..."
    killall NewsWidget-Desktop 2>/dev/null
    sleep 1
fi

# 检查是否已编译
if [ ! -f "NewsWidget-Desktop" ]; then
    echo "🔨 首次运行，正在编译..."
    swiftc -o NewsWidget-Desktop widget-desktop.swift -framework Cocoa -framework WebKit
    
    if [ $? -ne 0 ]; then
        echo "❌ 编译失败"
        exit 1
    fi
    chmod +x NewsWidget-Desktop
    echo "✅ 编译成功"
    echo ""
fi

# 启动小组件
echo "✅ 启动中..."
./NewsWidget-Desktop > /tmp/widget.log 2>&1 &

sleep 2

# 检查是否启动成功
if pgrep -f "NewsWidget-Desktop" > /dev/null; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ 桌面小组件已启动！"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 使用说明："
    echo ""
    echo "  🖱️  窗口操作："
    echo "     • 拖动标题栏 - 移动位置"
    echo "     • 拖动边缘 - 调整大小"
    echo "     • 红色按钮 - 关闭窗口"
    echo "     • 黄色按钮 - 最小化"
    echo ""
    echo "  📰 菜单栏控制（点击 📰 图标）："
    echo "     • 显示/隐藏 (⌘W)"
    echo "     • 刷新新闻 (⌘R)"
    echo "     • 置于顶层"
    echo "     • 窗口大小预设（小/中/大）"
    echo "     • 重置位置"
    echo "     • 退出 (⌘Q)"
    echo ""
    echo "  ⚡ 快捷键："
    echo "     • ⌘R - 刷新新闻"
    echo "     • ⌘W - 显示/隐藏窗口"
    echo "     • ⌘Q - 退出应用"
    echo ""
    echo "  🔄 自动功能："
    echo "     • 每 10 分钟自动刷新"
    echo "     • 自动保存窗口位置和大小"
    echo "     • 下次启动恢复上次位置"
    echo ""
    echo "  💡 特性："
    echo "     • 固定在桌面层（不遮挡工作窗口）"
    echo "     • 点击新闻在浏览器打开"
    echo "     • 支持暗色模式"
    echo "     • 毛玻璃背景效果"
    echo ""
    echo "📊 查看日志："
    echo "   tail -f /tmp/widget.log"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo "❌ 启动失败，查看日志："
    cat /tmp/widget.log
    exit 1
fi
