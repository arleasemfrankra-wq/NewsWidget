#!/bin/bash

# 原生 macOS 小组件启动脚本

cd "$(dirname "$0")"

echo "📰 启动原生新闻小组件..."
echo ""

# 检查是否已编译
if [ ! -f "NewsWidget" ]; then
    echo "🔨 首次运行，正在编译..."
    swiftc -o NewsWidget widget.swift -framework Cocoa -framework WebKit
    
    if [ $? -ne 0 ]; then
        echo "❌ 编译失败"
        exit 1
    fi
    echo "✅ 编译成功"
    echo ""
fi

# 检查端口是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 3000 已被占用，尝试关闭..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# 启动原生应用（内置服务器启动）
echo "🚀 启动小组件..."
./NewsWidget

echo ""
echo "👋 小组件已关闭"
