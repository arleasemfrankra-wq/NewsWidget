import Cocoa
import WebKit

// 简化版本 - 用于测试

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSLog("=== 应用启动 ===")
        
        // 创建窗口
        let frame = NSRect(x: 100, y: 100, width: 420, height: 800)
        window = NSWindow(
            contentRect: frame,
            styleMask: [.titled, .closable, .miniaturizable],  // 先用标准窗口测试
            backing: .buffered,
            defer: false
        )
        
        window.title = "NewsWidget"
        window.level = .floating
        
        NSLog("=== 创建 WebView ===")
        // 创建 WebView
        let config = WKWebViewConfiguration()
        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        
        window.contentView?.addSubview(webView)
        
        NSLog("=== 加载页面 ===")
        // 加载页面
        if let url = URL(string: "http://localhost:3000") {
            webView.load(URLRequest(url: url))
        }
        
        NSLog("=== 显示窗口 ===")
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        
        NSLog("=== 完成 ===")
    }
}

// 启动应用
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)  // 显示在 Dock，便于测试
app.run()
