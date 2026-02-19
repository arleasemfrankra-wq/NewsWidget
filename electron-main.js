const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const fetchNews = require('./backend/fetch-news-v2');

let mainWindow;
let tray;
let server;

// 新闻缓存
let newsCache = null;
let cacheTime = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2分钟

// 创建 HTTP 服务器
function createServer() {
  server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const urlPath = url.pathname;
    
    console.log(`📥 请求: ${urlPath}`);
    
    // API 路由
    if (urlPath === '/api/news') {
      const forceRefresh = url.searchParams.get('force') === 'true';
      const now = Date.now();
      
      // 检查缓存
      if (!forceRefresh && newsCache && cacheTime && (now - cacheTime < CACHE_DURATION)) {
        const cacheAge = Math.floor((now - cacheTime) / 1000);
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Cache': 'HIT',
          'X-Cache-Age': cacheAge.toString()
        });
        res.end(JSON.stringify(newsCache));
        console.log(`✅ 返回缓存数据 (${cacheAge}秒前)`);
        return;
      }
      
      // 获取新数据
      try {
        console.log('🔄 获取新闻数据...');
        const newsData = await fetchNews();
        newsCache = newsData;
        cacheTime = now;
        
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Cache': 'MISS',
          'X-Cache-Age': '0'
        });
        res.end(JSON.stringify(newsData));
        console.log('✅ 返回新数据');
      } catch (error) {
        console.error('❌ 获取新闻失败:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }
    
    // 自启动 API
    if (urlPath === '/api/autostart') {
      const action = url.searchParams.get('action');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      
      if (action === 'enable') {
        app.setLoginItemSettings({ openAtLogin: true });
        res.end(JSON.stringify({ success: true }));
      } else if (action === 'disable') {
        app.setLoginItemSettings({ openAtLogin: false });
        res.end(JSON.stringify({ success: true }));
      } else {
        res.end(JSON.stringify({ success: false, error: 'Invalid action' }));
      }
      return;
    }
    
    // 静态文件路由
    let filePath = urlPath.substring(1);
    
    if (urlPath === '/' || urlPath === '/index.html') {
      filePath = 'renderer/index-v10.html';
    } else if (urlPath === '/v9' || urlPath === '/v9.html') {
      filePath = 'renderer/index-v9.html';
    } else if (urlPath.startsWith('/app')) {
      if (urlPath.includes('v10')) {
        filePath = 'renderer/app-v10.js';
      } else if (urlPath.includes('v9')) {
        filePath = 'renderer/app-v9.js';
      } else {
        filePath = 'renderer/app-v10.js';
      }
    }
    
    const fullPath = path.join(__dirname, filePath);
    
    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      res.writeHead(404);
      res.end('404 Not Found');
      return;
    }
    
    // 读取文件
    const ext = path.extname(fullPath);
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
  
  server.listen(3000, () => {
    console.log('🚀 服务器启动在 http://localhost:3000');
  });
}

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 820,
    minWidth: 320,
    minHeight: 480,
    maxWidth: 600,
    maxHeight: 1200,
    title: '📰 新闻小组件',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'NewsWidget.icns')
  });
  
  mainWindow.loadURL('http://localhost:3000');
  
  // 开发时打开开发者工具
  // mainWindow.webContents.openDevTools();
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 创建托盘图标
function createTray() {
  // 这里需要一个托盘图标，暂时使用应用图标
  tray = new Tray(path.join(__dirname, 'NewsWidget.icns'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
          }
        }
      }
    },
    {
      label: '刷新新闻',
      click: () => {
        if (mainWindow) {
          mainWindow.reload();
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('桌面新闻小组件');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });
}

// 应用准备就绪
app.whenReady().then(() => {
  createServer();
  createWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用退出前清理
app.on('before-quit', () => {
  if (server) {
    server.close();
  }
});
