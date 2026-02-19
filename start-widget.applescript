#!/usr/bin/osascript

-- 启动后端服务
do shell script "cd ~/clawd/skills/morning-briefing-desktop && node server.js > /tmp/news-widget.log 2>&1 &"

-- 等待服务启动
delay 2

-- 使用 Chrome 打开小组件（无边框、固定大小）
do shell script "open -a 'Google Chrome' --args --app='http://localhost:3000' --window-size=420,800 --window-position=50,50"

-- 提示
display notification "新闻小组件已启动" with title "📰 Morning Briefing"
