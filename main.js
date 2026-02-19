const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const fetchNews = require('./backend/fetch-news');

let mainWindow;
let server;
const PORT = 3000;

// 创建 HTTP 服务器
function createServer() {
  server = http.createServer(async (req, res) => {
    // API: 获取新闻数据
    if (req.url === '/api/news') {
      try {
        const data = await fetchNews();
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(data));
      } catch (error) {
        console.error('获取新闻失败:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    // 静态文件服务
    const fs = require('fs');
    let filePath = req.url;
    
    if (filePath === '/') {
      filePath = '/renderer/index.html';
    } else if (filePath === '/style.css') {
      filePath = '/renderer/style.css';
    } else if (filePath === '/app.js') {
      filePath = '/renderer/app.js';
    }
    
    filePath = path.join(__dirname, filePath);
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json'
    };
    const contentType = mimeTypes[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`📰 新闻小组件服务已启动: http://localhost:${PORT}`);
  });
}

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 800,
    x: 50,
    y: 50,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 加载页面
  mainWindow.loadURL(`http://localhost:${PORT}`);

  // 窗口关闭
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  console.log('✅ 小组件窗口已创建');
}

// 应用准备就绪
app.whenReady().then(() => {
  createServer();
  
  // 等待服务器启动
  setTimeout(() => {
    createWindow();
  }, 1000);

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

// 应用退出
app.on('quit', () => {
  if (server) {
    server.close();
    console.log('👋 服务已停止');
  }
});
