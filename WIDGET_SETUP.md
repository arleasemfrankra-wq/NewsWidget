# 新闻小组件 - WidgetKit 版本

## 为什么需要 Xcode？

macOS 桌面小组件（WidgetKit）是 Apple 的官方框架，必须满足：
- 使用 Xcode 构建
- 需要代码签名
- 需要 Widget Extension
- 需要 App Group 配置

## 快速开始

### 方法 1：使用 Xcode（推荐）

1. **打开 Xcode**
2. **创建新项目**
   - File > New > Project
   - macOS > App
   - 名称: NewsWidgetApp
   - Interface: SwiftUI
   - 保存到当前目录

3. **添加 Widget Extension**
   - File > New > Target
   - macOS > Widget Extension
   - 名称: NewsWidgetExtension
   - 勾选 "Include Configuration Intent"

4. **替换代码**
   - 复制 `NewsWidgetApp/NewsWidgetApp.swift` 到主应用
   - 复制 `NewsWidgetExtension/NewsWidget.swift` 到 Widget Extension

5. **运行**
   - Cmd+R 运行
   - 在桌面上添加小组件

### 方法 2：使用现有的浮动窗口版本

如果你想要一个更简单的方案（不需要 Xcode）：

```bash
./start-widget.sh
```

这会启动一个浮动窗口版本，虽然不是真正的桌面小组件，但功能完整。

## 功能对比

| 特性 | WidgetKit 小组件 | 浮动窗口 |
|------|-----------------|---------|
| 固定在桌面 | ✅ | ❌ |
| 长按编辑 | ✅ | ❌ |
| 实时更新 | ⚠️ 有限制 | ✅ |
| 交互性 | ⚠️ 有限 | ✅ |
| 需要 Xcode | ✅ | ❌ |
| 代码签名 | ✅ | ❌ |

## 技术限制

WidgetKit 小组件的限制：
- 更新频率：最快 5 分钟
- 不支持完整的 WebView
- 交互有限（只能打开链接）
- 必须通过 Xcode 构建

## 推荐方案

如果你需要：
- ✅ 真正的桌面小组件体验 → 使用 WidgetKit（需要 Xcode）
- ✅ 实时更新、完整交互 → 使用浮动窗口版本（./start-widget.sh）
- ✅ 两者结合 → 同时使用两个版本

## 支持

如有问题，请查看：
- Apple WidgetKit 文档
- Xcode 帮助文档
