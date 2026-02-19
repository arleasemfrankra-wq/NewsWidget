#!/bin/bash

echo "📦 安装桌面新闻小组件..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 复制到应用程序目录
APP_NAME="NewsWidget.app"
TARGET_DIR="/Applications/${APP_NAME}"

if [ -d "${TARGET_DIR}" ]; then
    echo "⚠️  检测到已安装的版本，正在删除..."
    rm -rf "${TARGET_DIR}"
fi

echo "📋 复制应用到 /Applications..."
cp -r "${APP_NAME}" /Applications/

echo "✅ 安装完成！"
echo ""
echo "🚀 启动方式："
echo "   1. 在启动台找到「桌面新闻小组件」"
echo "   2. 或在终端运行: open /Applications/${APP_NAME}"
echo ""
echo "💡 设置开机自启动："
echo "   系统偏好设置 → 用户与群组 → 登录项 → 添加 NewsWidget"
echo ""
