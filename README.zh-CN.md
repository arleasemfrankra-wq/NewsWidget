# 📰 NewsWidget

<div align="center">

![Version](https://img.shields.io/badge/版本-11.0-blue.svg)
![Platform](https://img.shields.io/badge/平台-macOS-lightgrey.svg)
![License](https://img.shields.io/badge/许可证-MIT-green.svg)
![Swift](https://img.shields.io/badge/Swift-5.0-orange.svg)
![Node](https://img.shields.io/badge/Node.js-18+-green.svg)

**一款精美的 macOS 桌面新闻小组件，聚合 22+ 新闻源**

[English](README.md) | 简体中文

[功能特性](#-功能特性) • [安装](#-安装) • [使用](#-使用) • [开发](#-开发) • [贡献](#-贡献)

</div>

---

## ✨ 功能特性

### 📰 新闻聚合
- **22 个新闻源** 来自中国顶级平台
- **400+ 条新闻** 实时更新
- **4 大分类**：热点、科技、财经、综合
- **智能缓存**：2 分钟缓存，性能优化

### 🎨 精美界面
- **现代设计**：毛玻璃效果，macOS 风格
- **主题支持**：暗色、亮色、跟随系统
- **流畅动画**：卡片悬停、加载、过渡效果
- **响应式布局**：可调整窗口大小（320×480 ~ 600×1200）

### ⭐ 核心功能
- **收藏功能**：保存和管理你喜欢的新闻
- **全局搜索**：关键词高亮显示（⌘F）
- **数据统计**：
  - 新闻数量和来源分析
  - 热词云图可视化
  - 分类分布图表
  - 数据源活跃度排名
- **增强信息**（v11.0）：
  - 💱 实时汇率
  - 💬 每日一言
  - 🎉 节假日提醒
  - 📊 底部滚动信息条

### ⚙️ 设置
- **开机自启**：一键设置开机启动
- **刷新间隔**：5/10/30/60 分钟可选
- **导出收藏**：保存为 JSON 格式
- **数据管理**：清除所有数据

### 🚀 性能
- **快速加载**：22 个数据源 3-4 秒
- **缓存命中**：<0.1 秒响应
- **低资源占用**：~100MB 内存，<1% CPU（空闲时）
- **模块化架构**：ES6 模块，易于维护

---

## 📸 截图

<div align="center">

### 暗色主题
![暗色主题](docs/screenshots/dark-theme.png)

### 亮色主题
![亮色主题](docs/screenshots/light-theme.png)

### 新闻列表
![新闻列表](docs/screenshots/news-list.png)

</div>

---

## 📥 安装

### 下载

从 [Releases](https://github.com/YOUR_USERNAME/NewsWidget/releases) 下载最新版本：

```
NewsWidget-v11.0-macOS.zip (16MB)
```

### 安装步骤

1. **解压** zip 文件
2. **拖动** `NewsWidget.app` 到应用程序文件夹
3. **双击** 打开

### 首次运行

如果看到"无法验证开发者"提示：
1. 打开 **系统偏好设置** → **安全性与隐私**
2. 点击 **"仍要打开"**

---

## 🎯 使用

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `⌘R` | 刷新新闻 |
| `⌘F` | 搜索 |
| `⌘W` | 显示/隐藏窗口 |
| `⌘Q` | 退出 |

### 新闻源

**热点类（7个）**：
- 知乎、微博、百度、B站、抖音、虎扑、贴吧

**科技类（8个）**：
- 掘金、V2EX、GitHub、Stack Overflow、Hacker News、少数派、36氪、吾爱破解

**财经类（4个）**：
- 新浪财经、东方财富、雪球、财联社

**综合类（3个）**：
- 今日头条、腾讯网、豆瓣

### 增强信息（v11.0）

底部滚动条显示：
- 💱 **实时汇率**：前 3 个货币对（EUR → CNY, GBP, JPY）
- 💬 **每日一言**：励志语录
- 🎉 **节假日**：未来 7 天的节假日提醒

---

## 🛠️ 开发

### 环境要求

- macOS 10.15+
- Node.js 18+
- Swift 5.0+
- Xcode（用于编译）

### 设置

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/NewsWidget.git
cd NewsWidget

# 安装依赖
npm install

# 启动服务器
node server.js

# 在另一个终端运行 Swift 应用
swift run
```

### 项目结构

```
NewsWidget/
├── renderer/                 # 前端（网页）
│   ├── index-v10.html       # 主 HTML（ES6 模块）
│   ├── app-v10.js           # 主应用逻辑（293 行）
│   ├── style-v9.css         # 样式
│   └── modules/             # ES6 模块
│       ├── search.js        # 搜索（防抖）
│       ├── favorites.js     # 收藏管理
│       ├── stats.js         # 统计
│       ├── theme.js         # 主题切换
│       ├── settings.js      # 设置面板
│       ├── utils.js         # 工具函数
│       └── enhanced-info.js # 增强信息（v11）
├── backend/                 # 后端
│   └── fetch-news-v2.js    # 新闻获取（22 个数据源）
├── widget-desktop.swift     # Swift 桌面应用
├── server.js                # Node.js 服务器
└── package-v11.sh          # 打包脚本
```

### 架构

**前端**：HTML + CSS + ES6 模块  
**后端**：Node.js + Express + 22 个新闻源  
**桌面**：Swift + WebKit  
**打包**：pkg（Node.js）+ shell 脚本

### 构建

```bash
# 打包分发版本
./package-v11.sh

# 输出：NewsWidget-v11.0-macOS.zip (16MB)
```

---

## 🔧 配置

### 添加新闻源

编辑 `backend/fetch-news-v2.js`：

```javascript
{
  id: 'your-source',
  name: '你的数据源',
  category: 'tech',
  url: 'https://api.example.com/news',
  parser: (data) => {
    // 解析并返回新闻项
    return data.map(item => ({
      title: item.title,
      url: item.url,
      score: item.score
    }));
  }
}
```

### 自定义界面

- **样式**：编辑 `renderer/style-v9.css`
- **布局**：编辑 `renderer/index-v10.html`
- **逻辑**：编辑 `renderer/app-v10.js` 或模块

---

## 📊 性能数据

| 指标 | 数值 |
|------|------|
| 首次加载 | 3-4 秒 |
| 缓存命中 | <0.1 秒 |
| 内存占用 | ~100MB |
| CPU（空闲） | <1% |
| 应用大小 | 45MB |
| 分发包 | 16MB（zip） |

---

## 🤝 贡献

欢迎贡献！请先阅读我们的[贡献指南](CONTRIBUTING.md)。

### 如何贡献

1. **Fork** 本仓库
2. **创建** 功能分支（`git checkout -b feature/amazing-feature`）
3. **提交** 更改（`git commit -m 'Add amazing feature'`）
4. **推送** 到分支（`git push origin feature/amazing-feature`）
5. **打开** Pull Request

### 开发指南

- 遵循现有代码风格
- 编写清晰的提交信息
- 为新功能添加测试
- 更新文档

---

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本历史。

### 最新版本（v11.0 - 2026-02-19）

**新功能**：
- 💱 实时汇率
- 💬 每日一言
- 🎉 节假日提醒（未来 7 天）
- 📊 底部滚动信息条

**改进**：
- 增强 IP 查询 API（支持中文）
- 大学信息查询
- 更好的错误处理

---

## 🐛 已知问题

- 窗口标题显示中文（需要 Xcode 重新编译）
- 首次运行可能显示安全警告（未签名应用的正常现象）

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

- **[NewsNow](https://github.com/ourongxing/newsnow)**：灵感来源于这个优秀的新闻聚合项目
- **新闻 API**：感谢所有免费新闻 API 提供商
- **图标**：Apple 的 SF Symbols
- **灵感**：macOS 原生设计指南

---

## 📮 联系方式

- **问题反馈**：[GitHub Issues](https://github.com/YOUR_USERNAME/NewsWidget/issues)
- **讨论交流**：[GitHub Discussions](https://github.com/YOUR_USERNAME/NewsWidget/discussions)

---

## ⭐ Star 历史

如果你觉得这个项目有用，请给它一个 star！⭐

---

<div align="center">

**用 ❤️ 制作 by OpenClaw AI Assistant**

[⬆ 回到顶部](#-newswidget)

</div>
