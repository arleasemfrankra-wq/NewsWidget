#!/bin/bash

echo "🔨 编译 Swift 小组件..."

cd "$(dirname "$0")"

# 编译 Swift 应用
swiftc -o widget-app widget.swift -framework Cocoa -framework WebKit

if [ $? -eq 0 ]; then
    echo "✅ 编译成功"
    echo ""
    echo "🚀 启动小组件..."
    
    # 启动后端服务
    node server.js > /tmp/news-widget.log 2>&1 &
    SERVER_PID=$!
    
    # 等待服务启动
    sleep 2
    
    # 启动小组件
    ./widget-app
    
    # 清理
    kill $SERVER_PID 2>/dev/null
    echo "👋 服务已停止"
else
    echo "❌ 编译失败"
    exit 1
fi
