# 🚀 快速发布指南

## 现在就做这3件事：

### 1️⃣ 创建 GitHub 仓库
👉 https://github.com/new
- 名称: `NewsWidget`
- 描述: `A beautiful desktop news widget for macOS with 22+ news sources`
- Public ✅
- 不要勾选任何初始化选项

### 2️⃣ 推送代码
```bash
cd /Users/mrying/clawd/skills/morning-briefing-desktop

# 替换 YOUR_USERNAME 为你的 GitHub 用户名
git remote add origin https://github.com/YOUR_USERNAME/NewsWidget.git
git push -u origin main
```

### 3️⃣ 添加截图
```bash
# 启动应用
npm install
node server.js

# 打开 http://localhost:3000
# 截图保存到 docs/screenshots/
# 需要: dark-theme.png, light-theme.png, statistics.png, search.png

# 提交截图
git add docs/screenshots/*.png
git commit -m "Add screenshots"
git push
```

---

## 📋 完整步骤

详细说明请查看: [GITHUB_SETUP.md](GITHUB_SETUP.md)

---

## ✅ 已完成

- ✅ 代码清理
- ✅ 文档完善
- ✅ Git 初始化
- ✅ 初始提交

## ⏳ 待完成

- [ ] 创建 GitHub 仓库
- [ ] 推送代码
- [ ] 添加截图
- [ ] 创建 Release
- [ ] 配置仓库

---

**准备好了！开始发布吧！** 🎉
