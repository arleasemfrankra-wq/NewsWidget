import Cocoa
import WebKit

class WidgetWindow: NSWindow {
    override var canBecomeKey: Bool { return true }
    override var canBecomeMain: Bool { return true }
    
    // 支持拖动
    override func mouseDragged(with event: NSEvent) {
        let location = NSEvent.mouseLocation
        let origin = NSPoint(
            x: location.x - frame.width / 2,
            y: location.y - frame.height / 2
        )
        setFrameOrigin(origin)
    }
}

class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    var serverProcess: Process?
    var statusItem: NSStatusItem?
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        print("🚀 应用启动中...")
        
        // 启动后端服务
        startServer()
        
        // 等待服务启动
        print("⏳ 等待服务启动...")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            print("📱 创建窗口...")
            self.createWindow()
            self.createMenuBar()
            print("✅ 初始化完成")
        }
    }
    
    func createWindow() {
        print("📐 计算窗口位置...")
        // 创建窗口
        let screenFrame = NSScreen.main?.visibleFrame ?? NSRect.zero
        let x = screenFrame.maxX - 420 - 20  // 右上角，留 20px 边距
        let y = screenFrame.maxY - 800 - 20
        let frame = NSRect(x: x, y: y, width: 420, height: 800)
        
        print("🪟 创建窗口: \(frame)")
        window = WidgetWindow(
            contentRect: frame,
            styleMask: [.borderless, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        
        print("⚙️ 配置窗口属性...")
        // 窗口设置
        window.isOpaque = false
        window.backgroundColor = .clear
        window.level = .floating  // 始终置顶
        window.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
        window.hasShadow = true
        window.isMovableByWindowBackground = true
        window.ignoresMouseEvents = false
        
        print("🌐 创建 WebView...")
        // 创建 WebView
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        
        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.setValue(false, forKey: "drawsBackground")
        webView.navigationDelegate = self
        
        // 设置透明背景
        webView.underPageBackgroundColor = .clear
        
        window.contentView?.addSubview(webView)
        
        print("🔗 加载页面: http://localhost:3000")
        // 加载页面
        if let url = URL(string: "http://localhost:3000") {
            webView.load(URLRequest(url: url))
        }
        
        print("👁️ 显示窗口...")
        window.makeKeyAndOrderFront(nil)
        
        print("✅ 小组件窗口已创建")
    }
    
    func createMenuBar() {
        // 创建菜单栏图标
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        
        if let button = statusItem?.button {
            button.title = "📰"
            button.toolTip = "NewsWidget"
        }
        
        // 创建菜单
        let menu = NSMenu()
        
        menu.addItem(NSMenuItem(title: "显示/隐藏", action: #selector(toggleWindow), keyEquivalent: "w"))
        menu.addItem(NSMenuItem(title: "刷新", action: #selector(refreshWidget), keyEquivalent: "r"))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "退出", action: #selector(quitApp), keyEquivalent: "q"))
        
        statusItem?.menu = menu
    }
    
    @objc func toggleWindow() {
        if window.isVisible {
            window.orderOut(nil)
        } else {
            window.makeKeyAndOrderFront(nil)
        }
    }
    
    @objc func refreshWidget() {
        webView.reload()
    }
    
    @objc func quitApp() {
        NSApplication.shared.terminate(nil)
    }
    
    func startServer() {
        let task = Process()
        
        // 尝试多个可能的 node 路径
        let nodePaths = [
            "/usr/local/bin/node",
            "/opt/homebrew/bin/node",
            "/usr/bin/node"
        ]
        
        var nodeFound = false
        for path in nodePaths {
            if FileManager.default.fileExists(atPath: path) {
                task.launchPath = path
                nodeFound = true
                break
            }
        }
        
        if !nodeFound {
            print("❌ 未找到 Node.js，请确保已安装")
            return
        }
        
        // 获取资源路径
        var serverPath: String
        var workingDir: String
        
        if let resourcePath = Bundle.main.resourcePath {
            // 在 .app 中运行
            serverPath = "\(resourcePath)/server.js"
            workingDir = resourcePath
        } else {
            // 直接运行可执行文件
            serverPath = "\(NSHomeDirectory())/clawd/skills/morning-briefing-desktop/server.js"
            workingDir = "\(NSHomeDirectory())/clawd/skills/morning-briefing-desktop"
        }
        
        task.arguments = [serverPath]
        task.currentDirectoryPath = workingDir
        
        // 重定向输出
        let pipe = Pipe()
        task.standardOutput = pipe
        task.standardError = pipe
        
        do {
            try task.run()
            serverProcess = task
            print("✅ 后端服务已启动")
            print("📁 工作目录: \(workingDir)")
        } catch {
            print("❌ 启动服务失败: \(error)")
        }
    }
    
    func applicationWillTerminate(_ notification: Notification) {
        // 停止服务
        serverProcess?.terminate()
        print("👋 服务已停止")
    }
    
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return false  // 关闭窗口不退出应用
    }
    
    // WebView 加载完成
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("✅ 页面加载完成")
    }
    
    // WebView 加载失败
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("❌ 页面加载失败: \(error.localizedDescription)")
    }
}

// 启动应用
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)  // 不显示在 Dock
app.run()

