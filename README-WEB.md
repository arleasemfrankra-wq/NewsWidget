# Morning Briefing Desktop - Web 版本

由于 Electron 环境问题，改用 Web 本地服务方案。

## 快速启动

```bash
cd ~/clawd/skills/morning-briefing-desktop
node server.js
```

然后在浏览器打开：http://localhost:3000

## 特性

- ✅ 实时新闻更新
- ✅ 自动刷新（10分钟）
- ✅ 响应式设计
- ✅ 暗色主题
- ✅ 点击新闻直接跳转

## 使用建议

1. 启动服务后，在浏览器中打开
2. 可以固定浏览器窗口在桌面
3. 使用浏览器的"应用模式"获得更好体验：
   ```bash
   # Chrome 应用模式
   open -a "Google Chrome" --args --app=http://localhost:3000
   ```

## 下一步优化

如果需要真正的桌面应用，可以考虑：
1. 使用 Tauri（Rust + Web，更轻量）
2. 使用 NW.js（类似 Electron）
3. 打包成 PWA（渐进式 Web 应用）
