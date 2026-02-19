#!/bin/bash

# 停止新闻小组件服务

echo "🛑 停止新闻小组件..."

# 从 PID 文件读取进程 ID
if [ -f /tmp/news-widget.pid ]; then
    PID=$(cat /tmp/news-widget.pid)
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID
        echo "✅ 服务已停止 (PID: $PID)"
    else
        echo "⚠️  进程不存在 (PID: $PID)"
    fi
    rm /tmp/news-widget.pid
else
    # 尝试通过端口查找进程
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        PID=$(lsof -ti:3000)
        kill $PID
        echo "✅ 服务已停止 (PID: $PID)"
    else
        echo "⚠️  没有找到运行中的服务"
    fi
fi

# 清理日志
if [ -f /tmp/news-widget.log ]; then
    rm /tmp/news-widget.log
    echo "🗑️  日志已清理"
fi

echo ""
echo "👋 新闻小组件已完全停止"
