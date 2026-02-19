import Cocoa
import WebKit

class WidgetWindow: NSWindow {
    override var canBecomeKey: Bool { return true }
    override var canBecomeMain: Bool { return false }
}

class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    var serverProcess: Process?
    var statusItem: NSStatusItem?
    var windowPosition: NSPoint?
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSLog("🚀 桌面小组件启动中...")
        
        // 设置应用图标
        if let iconPath = Bundle.main.path(forResource: "NewsWidget", ofType: "icns"),
           let icon = NSImage(contentsOfFile: iconPath) {
            NSApp.applicationIconImage = icon
            NSLog("✅ 应用图标已设置")
        } else {
            let iconPath = FileManager.default.currentDirectoryPath + "/NewsWidget.icns"
            if FileManager.default.fileExists(atPath: iconPath),
               let icon = NSImage(contentsOfFile: iconPath) {
                NSApp.applicationIconImage = icon
                NSLog("✅ 应用图标已设置（从当前目录）")
            } else {
                NSLog("⚠️  未找到图标文件")
            }
        }
        
        // 显示在 Dock 中（方便用户重新打开）
        NSApp.setActivationPolicy(.regular)
        
        // 启动后端服务
        startServer()
        
        // 等待服务启动
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            self.createWindow()
            self.createMenuBar()
            self.loadSavedPosition()
            NSLog("✅ 桌面小组件已就绪")
        }
    }
    
    func createWindow() {
        // 获取屏幕尺寸
        guard let screen = NSScreen.main else { return }
        let screenFrame = screen.visibleFrame
        
        // 默认放在右上角
        let x = screenFrame.maxX - 440 - 20
        let y = screenFrame.maxY - 820 - 20
        let frame = NSRect(x: x, y: y, width: 440, height: 820)
        
        NSLog("📐 窗口位置: x=\(x), y=\(y)")
        
        // 创建标准窗口
        window = WidgetWindow(
            contentRect: frame,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        
        // 窗口设置
        window.title = "📰 NewsWidget"
        window.isOpaque = false
        window.backgroundColor = .clear
        window.hasShadow = true
        window.minSize = NSSize(width: 320, height: 480)
        window.maxSize = NSSize(width: 600, height: 1200)
        
        // 设置暗色标题栏
        window.appearance = NSAppearance(named: .darkAqua)
        window.titlebarAppearsTransparent = false
        
        // 普通窗口层级
        window.level = .normal
        
        window.collectionBehavior = [
            .canJoinAllSpaces
        ]
        
        // 监听窗口移动，保存位置
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(windowDidMove),
            name: NSWindow.didMoveNotification,
            object: window
        )
        
        // 创建 WebView
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        config.preferences.javaScriptCanOpenWindowsAutomatically = true
        
        // 禁用缓存
        config.websiteDataStore = WKWebsiteDataStore.nonPersistent()
        
        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.setValue(false, forKey: "drawsBackground")
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.underPageBackgroundColor = .clear
        
        window.contentView?.addSubview(webView)
        
        // 加载页面（禁用缓存）
        if let url = URL(string: "http://localhost:3000") {
            var request = URLRequest(url: url)
            request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
            webView.load(request)
        }
        
        window.orderFront(nil)
        
        NSLog("✅ 窗口已创建")
    }
    
    func createMenuBar() {
        NSLog("📰 创建菜单栏图标...")
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        
        if let button = statusItem?.button {
            button.title = "📰"
            button.toolTip = "NewsWidget - 点击查看菜单"
            NSLog("✅ 菜单栏按钮已设置")
        } else {
            NSLog("❌ 无法获取菜单栏按钮")
        }
        
        let menu = NSMenu()
        
        menu.addItem(NSMenuItem(title: "显示/隐藏", action: #selector(toggleWindow), keyEquivalent: "w"))
        menu.addItem(NSMenuItem(title: "刷新新闻", action: #selector(refreshWidget), keyEquivalent: "r"))
        menu.addItem(NSMenuItem(title: "置于顶层", action: #selector(bringToFront), keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())
        
        // 窗口大小预设
        let sizeMenu = NSMenu()
        sizeMenu.addItem(NSMenuItem(title: "小 (320×480)", action: #selector(setSmallSize), keyEquivalent: ""))
        sizeMenu.addItem(NSMenuItem(title: "中 (420×800)", action: #selector(setMediumSize), keyEquivalent: ""))
        sizeMenu.addItem(NSMenuItem(title: "大 (520×1000)", action: #selector(setLargeSize), keyEquivalent: ""))
        
        let sizeMenuItem = NSMenuItem(title: "窗口大小", action: nil, keyEquivalent: "")
        sizeMenuItem.submenu = sizeMenu
        menu.addItem(sizeMenuItem)
        
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "重置位置", action: #selector(resetPosition), keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "退出", action: #selector(quitApp), keyEquivalent: "q"))
        
        statusItem?.menu = menu
    }
    
    @objc func toggleWindow() {
        if window.isVisible {
            window.orderOut(nil)
        } else {
            window.orderFront(nil)
        }
    }
    
    @objc func refreshWidget() {
        // 重新加载首页，而不是 reload 当前 URL
        if let url = URL(string: "http://localhost:3000") {
            var request = URLRequest(url: url)
            request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
            webView.load(request)
        }
        showNotification(title: "刷新中", message: "正在获取最新新闻...")
    }
    
    @objc func bringToFront() {
        window.orderFront(nil)
        window.makeKey()
    }
    
    @objc func setSmallSize() {
        window.setContentSize(NSSize(width: 320, height: 480))
    }
    
    @objc func setMediumSize() {
        window.setContentSize(NSSize(width: 420, height: 800))
    }
    
    @objc func setLargeSize() {
        window.setContentSize(NSSize(width: 520, height: 1000))
    }
    
    @objc func resetPosition() {
        guard let screen = NSScreen.main else { return }
        let screenFrame = screen.visibleFrame
        let x = screenFrame.maxX - window.frame.width - 20
        let y = screenFrame.maxY - window.frame.height - 20
        window.setFrameOrigin(NSPoint(x: x, y: y))
        savePosition()
    }
    
    @objc func windowDidMove() {
        savePosition()
    }
    
    func savePosition() {
        let origin = window.frame.origin
        UserDefaults.standard.set(origin.x, forKey: "windowX")
        UserDefaults.standard.set(origin.y, forKey: "windowY")
        UserDefaults.standard.set(window.frame.width, forKey: "windowWidth")
        UserDefaults.standard.set(window.frame.height, forKey: "windowHeight")
    }
    
    func loadSavedPosition() {
        let x = UserDefaults.standard.double(forKey: "windowX")
        let y = UserDefaults.standard.double(forKey: "windowY")
        let width = UserDefaults.standard.double(forKey: "windowWidth")
        let height = UserDefaults.standard.double(forKey: "windowHeight")
        
        if x != 0 && y != 0 {
            var frame = window.frame
            frame.origin = NSPoint(x: x, y: y)
            if width > 0 && height > 0 {
                frame.size = NSSize(width: width, height: height)
            }
            window.setFrame(frame, display: true)
            NSLog("✅ 已恢复窗口位置: (\(x), \(y)) 大小: \(width)×\(height)")
        }
    }
    
    func showNotification(title: String, message: String) {
        let notification = NSUserNotification()
        notification.title = title
        notification.informativeText = message
        notification.soundName = nil
        NSUserNotificationCenter.default.deliver(notification)
    }
    
    @objc func quitApp() {
        NSApplication.shared.terminate(nil)
    }
    
    func startServer() {
        let task = Process()
        
        // 查找打包的服务器可执行文件
        var serverPath: String
        var workingDir: String
        
        // 优先使用 .app 包内的服务器
        if let executablePath = Bundle.main.executablePath {
            let macosDir = (executablePath as NSString).deletingLastPathComponent
            serverPath = "\(macosDir)/NewsWidget-Server"
            workingDir = macosDir
            NSLog("📂 使用打包的服务器: \(serverPath)")
        } else {
            // 开发环境回退
            let homeDir = NSHomeDirectory()
            serverPath = "\(homeDir)/dist/NewsWidget-Server"
            workingDir = homeDir
            NSLog("📂 使用开发环境服务器: \(serverPath)")
        }
        
        // 检查文件是否存在
        if !FileManager.default.fileExists(atPath: serverPath) {
            NSLog("❌ 服务器文件不存在: \(serverPath)")
            return
        }
        
        task.launchPath = serverPath
        task.currentDirectoryPath = workingDir
        
        // 重定向输出到日志文件
        let logPath = "/tmp/widget-standalone.log"
        if let logFile = FileHandle(forWritingAtPath: logPath) ?? {
            FileManager.default.createFile(atPath: logPath, contents: nil)
            return FileHandle(forWritingAtPath: logPath)
        }() {
            task.standardOutput = logFile
            task.standardError = logFile
        }
        
        do {
            try task.run()
            serverProcess = task
            NSLog("✅ 后端服务已启动 (PID: \(task.processIdentifier))")
        } catch {
            NSLog("❌ 启动服务失败: \(error)")
        }
    }
    
    func applicationWillTerminate(_ notification: Notification) {
        serverProcess?.terminate()
        NSLog("👋 服务已停止")
    }
    
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return false
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        NSLog("✅ 页面加载完成")
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        NSLog("❌ 页面加载失败: \(error.localizedDescription)")
    }
    
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url {
            NSWorkspace.shared.open(url)
        }
        return nil
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
