# 📰 桌面新闻小组件 v9.0 - 完整指南

> 精致的 macOS 桌面新闻小组件，支持收藏和数据可视化

---

## 📋 目录

1. [快速开始](#快速开始)
2. [新功能介绍](#新功能介绍)
3. [打包和分发](#打包和分发)
4. [开机自启动](#开机自启动)
5. [常见问题](#常见问题)

---

## 🚀 快速开始

### 本地运行

```bash
cd ~/clawd/skills/morning-briefing-desktop
./start.sh
```

### 停止应用

```bash
killall NewsWidget-Desktop
```

或使用菜单栏 📰 图标 → 退出 (⌘Q)

---

## ✨ 新功能介绍

### 1. ⭐ 新闻收藏功能

**使用方法**:
1. 鼠标悬停在新闻项上，右上角出现 ☆ 按钮
2. 点击收藏，按钮变为金色 ★
3. 点击顶部"⭐ 收藏"标签查看所有收藏
4. 再次点击星标取消收藏

**特性**:
- 本地存储，永久保存
- 显示收藏时间
- 收藏数量徽章
- 按时间倒序排列

### 2. 📊 数据可视化统计

点击顶部"📊 统计"标签查看：

**核心指标**:
- 📰 今日新闻数
- 🔥 数据源数量
- ⭐ 收藏总数
- 👁️ 浏览量

**可视化图表**:
- 🔥 热词云图 - 今日新闻高频关键词
- 📊 分类分布 - 各分类新闻数量对比
- 📈 数据源活跃度 - Top 10 数据源排行

---

## 📦 打包和分发

### 方式一：打包成 .app（推荐）

```bash
cd ~/clawd/skills/morning-briefing-desktop
./package.sh
```

**生成的文件**:
- `NewsWidget.app` - macOS 应用包
- `NewsWidget-v9.0-macOS.zip` - 分发包

**分发给别人**:
1. 发送 `NewsWidget-v9.0-macOS.zip`
2. 对方解压后运行 `install.sh`
3. 在启动台打开"桌面新闻小组件"

### 方式二：直接分享源码

**要求**:
- macOS 10.15+
- Node.js 14+
- Swift 5.0+（系统自带）

**步骤**:
1. 打包整个 `morning-briefing-desktop` 目录
2. 对方解压后运行 `./start.sh`

---

## ⚙️ 开机自启动

### 启用自启动

```bash
cd ~/clawd/skills/morning-briefing-desktop
./enable-autostart.sh
```

**效果**:
- 开机后自动启动小组件
- 后台运行，不显示终端窗口
- 日志保存到 `/tmp/widget.log`

### 取消自启动

```bash
cd ~/clawd/skills/morning-briefing-desktop
./disable-autostart.sh
```

### 管理命令

```bash
# 查看状态
launchctl list | grep newswidget

# 手动启动
launchctl load ~/Library/LaunchAgents/com.openclaw.newswidget.plist

# 手动停止
launchctl unload ~/Library/LaunchAgents/com.openclaw.newswidget.plist

# 查看日志
tail -f /tmp/widget.log
```

---

## 🔧 配置说明

### 修改刷新间隔

编辑 `renderer/app-v9.js`:

```javascript
let countdownSeconds = 600; // 10分钟 = 600秒
```

### 修改窗口大小

编辑 `widget-desktop.swift`:

```swift
let frame = NSRect(x: x, y: y, width: 420, height: 800)
```

### 添加/删除数据源

编辑 `backend/fetch-news-v2.js` 中的 `SOURCES` 数组。

---

## ❓ 常见问题

### Q1: 首次运行提示"无法验证开发者"

**解决方法**:
1. 系统偏好设置 → 安全性与隐私
2. 点击"仍要打开"
3. 或在终端运行: `xattr -cr NewsWidget.app`

### Q2: 窗口不显示

**排查步骤**:
1. 查看日志: `tail -f /tmp/widget.log`
2. 检查进程: `ps aux | grep NewsWidget`
3. 重启应用: `killall NewsWidget-Desktop && ./start.sh`

### Q3: 新闻加载失败

**可能原因**:
- 网络连接问题
- API 服务暂时不可用
- 端口 3000 被占用

**解决方法**:
1. 检查网络连接
2. 查看后端日志: `tail -f /tmp/widget.log`
3. 检查端口: `lsof -i :3000`

### Q4: 收藏数据丢失

**原因**: 清除了浏览器缓存或 localStorage

**预防**: 定期导出收藏（未来功能）

### Q5: 如何在 Intel Mac 上运行

**当前版本**: 仅支持 Apple Silicon (ARM64)

**解决方法**:
1. 重新编译: `swiftc -o NewsWidget-Desktop widget-desktop.swift -framework Cocoa -framework WebKit`
2. 或使用 Rosetta 2 运行

### Q6: 如何分发给没有 Node.js 的用户

**方案一**: 要求对方安装 Node.js
- 下载地址: https://nodejs.org/

**方案二**: 使用 pkg 打包 Node.js 后端
```bash
npm install -g pkg
pkg server.js --targets node18-macos-arm64 --output server-bin
```

**方案三**: 使用 Electron 重写（未来计划）

---

## 📊 性能数据

- **启动时间**: 2-3秒
- **内存占用**: ~80MB
- **CPU 占用**: <1%（空闲时）
- **首次加载**: 0.8-2秒（18个数据源）
- **缓存命中**: <0.1秒
- **新闻总数**: 340+条

---

## 🛠️ 技术架构

### 前端
- HTML5 + CSS3 + Vanilla JavaScript
- 无第三方依赖
- localStorage 本地存储

### 后端
- Node.js HTTP 服务器
- 免费聚合 API (orz.ai)
- 智能缓存机制

### 桌面应用
- Swift + Cocoa + WebKit
- 原生 macOS 应用
- 菜单栏集成

---

## 📝 文件结构

```
morning-briefing-desktop/
├── widget-desktop.swift       # Swift 桌面应用
├── server.js                  # Node.js 后端
├── start.sh                   # 启动脚本
├── package.sh                 # 打包脚本
├── enable-autostart.sh        # 启用自启动
├── disable-autostart.sh       # 取消自启动
├── backend/
│   └── fetch-news-v2.js      # 新闻获取逻辑
├── renderer/
│   ├── index-v9.html         # HTML (v9)
│   ├── style-v9.css          # CSS (v9)
│   └── app-v9.js             # JavaScript (v9)
├── CHANGELOG-v9.0.md         # 更新日志
└── README.md                 # 本文档
```

---

## 🎯 未来计划

### 短期（1周）
- [ ] 收藏导出/导入功能
- [ ] 搜索功能
- [ ] 热词点击搜索
- [ ] 阅读历史

### 中期（2-4周）
- [ ] 通知提醒
- [ ] 自定义数据源
- [ ] 新闻去重
- [ ] 离线模式

### 长期（1个月+）
- [ ] AI 摘要
- [ ] 个性化推荐
- [ ] 多设备同步
- [ ] 移动端 App
- [ ] Electron 版本（跨平台）

---

## 📄 许可证

MIT License

---

## 👨‍💻 作者

OpenClaw AI Assistant

---

## 🙏 致谢

- Apple - macOS 设计规范
- NewsNow - 架构灵感
- orz.ai - 免费新闻聚合 API

---

**享受你的桌面新闻小组件！** 📰✨

如有问题或建议，欢迎反馈！
