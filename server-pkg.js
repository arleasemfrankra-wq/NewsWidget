const http = require('http');
const fs = require('fs');
const path = require('path');

// pkg 打包后的路径处理
const isPkg = typeof process.pkg !== 'undefined';
const basePath = isPkg ? path.dirname(process.execPath) : __dirname;

console.log('🚀 启动服务器...');
console.log('📁 基础路径:', basePath);
console.log('📦 是否为 pkg 打包:', isPkg);

// 动态加载 fetch-news-v2
let fetchNews;
try {
  if (isPkg) {
    // pkg 打包后，backend 目录在可执行文件同级
    fetchNews = require(path.join(basePath, 'backend', 'fetch-news-v2.js'));
  } else {
    fetchNews = require('./backend/fetch-news-v2');
  }
  console.log('✅ fetch-news-v2 加载成功');
} catch (error) {
  console.error('❌ fetch-news-v2 加载失败:', error.message);
  process.exit(1);
}

// 新闻缓存
let newsCache = null;
let cacheTime = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2分钟

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
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
  
  // 自启动 API（pkg 版本不支持，返回成功但不执行）
  if (urlPath === '/api/autostart') {
    const action = url.searchParams.get('action');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    if (isPkg) {
      // pkg 版本不支持自启动脚本
      res.end(JSON.stringify({ success: true, message: 'Autostart not supported in standalone version' }));
    } else {
      // 原版本执行脚本
      const { exec } = require('child_process');
      const scriptPath = action === 'enable' ? './enable-autostart.sh' : './disable-autostart.sh';
      
      exec(`bash ${scriptPath}`, (error) => {
        if (error) {
          res.end(JSON.stringify({ success: false, error: error.message }));
        } else {
          res.end(JSON.stringify({ success: true }));
        }
      });
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
  } else if (urlPath.startsWith('/style')) {
    // CSS 文件在 renderer 目录下
    filePath = 'renderer' + urlPath;
  } else if (urlPath.startsWith('/renderer/')) {
    // 已经包含 renderer 前缀，直接使用
    filePath = urlPath.substring(1);
  } else if (!urlPath.startsWith('/api/')) {
    // 其他文件尝试在 renderer 目录下查找
    const rendererPath = 'renderer' + urlPath;
    const fullRendererPath = path.join(basePath, rendererPath);
    if (fs.existsSync(fullRendererPath)) {
      filePath = rendererPath;
    }
  }
  
  // 确定文件完整路径
  const fullPath = path.join(basePath, filePath);
  
  console.log(`📄 尝试读取: ${fullPath}`);
  
  // 检查文件是否存在
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ 文件不存在: ${fullPath}`);
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
      console.error(`❌ 读取文件失败: ${err.message}`);
      res.writeHead(500);
      res.end('Error loading file');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
    console.log(`✅ 返回文件: ${filePath}`);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ 服务器启动成功: http://localhost:${PORT}`);
});

// 错误处理
server.on('error', (error) => {
  console.error('❌ 服务器错误:', error);
  process.exit(1);
});
