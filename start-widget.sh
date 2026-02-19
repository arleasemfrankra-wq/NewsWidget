#!/bin/bash

# 新闻小组件启动脚本
# 使用 Chrome 应用模式模拟桌面小组件效果

cd "$(dirname "$0")"

echo "📰 启动新闻小组件..."
echo ""

# 检查端口是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 3000 已被占用，尝试关闭..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# 启动后端服务
echo "🚀 启动后端服务..."
node server.js > /tmp/news-widget.log 2>&1 &
SERVER_PID=$!

# 保存 PID 以便后续关闭
echo $SERVER_PID > /tmp/news-widget.pid

# 等待服务启动
sleep 2

# 检查服务是否启动成功
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ 服务启动失败，请查看日志: /tmp/news-widget.log"
    exit 1
fi

echo "✅ 服务启动成功"
echo ""

# 使用 Chrome 应用模式打开（类似桌面小组件）
echo "📱 打开小组件窗口..."

# 尝试使用 Chrome
if [ -d "/Applications/Google Chrome.app" ]; then
    open -a "Google Chrome" --args \
        --app=http://localhost:3000 \
        --window-size=420,800 \
        --window-position=50,50 \
        --disable-features=TranslateUI \
        --disable-infobars \
        --no-first-run \
        --no-default-browser-check
elif [ -d "/Applications/Chromium.app" ]; then
    open -a "Chromium" --args \
        --app=http://localhost:3000 \
        --window-size=420,800 \
        --window-position=50,50
else
    # 使用默认浏览器
    open http://localhost:3000
fi

echo ""
echo "✅ 新闻小组件已启动"
echo ""
echo "💡 使用提示："
echo "   - 拖动窗口到你喜欢的位置"
echo "   - 使用 Cmd+Q 关闭窗口"
echo "   - 运行 ./stop-widget.sh 停止后台服务"
echo ""
echo "📊 服务信息："
echo "   - 地址: http://localhost:3000"
echo "   - PID: $SERVER_PID"
echo "   - 日志: /tmp/news-widget.log"
echo ""
