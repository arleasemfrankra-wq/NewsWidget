const http = require('http');
const fs = require('fs');
const path = require('path');
const fetchNews = require('./backend/fetch-news-v2');

const PORT = 3000;
const CACHE_DURATION = 2 * 60 * 1000; // 2分钟缓存

// 处理 pkg 打包后的路径
const isPkg = typeof process.pkg !== 'undefined';
const basePath = isPkg ? path.dirname(process.execPath) : __dirname;

// 缓存对象
let newsCache = {
  data: null,
  timestamp: 0
};

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json'
};

// 创建服务器
const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // API: 获取新闻数据
  if (req.url === '/api/news' || req.url === '/api/news?force=true') {
    try {
      const now = Date.now();
      const cacheAge = now - newsCache.timestamp;
      const forceRefresh = req.url.includes('force=true');
      
      // 检查缓存是否有效（除非强制刷新）
      if (!forceRefresh && newsCache.data && cacheAge < CACHE_DURATION) {
        console.log(`✅ 使用缓存数据 (${Math.round(cacheAge / 1000)}秒前)`);
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Cache': 'HIT',
          'X-Cache-Age': Math.round(cacheAge / 1000)
        });
        res.end(JSON.stringify(newsCache.data));
        return;
      }
      
      // 缓存过期或强制刷新，重新获取
      if (forceRefresh) {
        console.log('🔄 强制刷新，重新获取数据...');
      } else {
        console.log('🔄 缓存过期，重新获取数据...');
      }
      
      const data = await fetchNews();
      
      // 更新缓存
      newsCache.data = data;
      newsCache.timestamp = now;
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Cache': 'MISS'
      });
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error('获取新闻失败:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // API: 开机自启动控制
  if (req.url.startsWith('/api/autostart')) {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const action = url.searchParams.get('action'); // enable 或 disable
    
    try {
      const { exec } = require('child_process');
      const scriptPath = path.join(basePath, action === 'enable' ? 'enable-autostart.sh' : 'disable-autostart.sh');
      
      exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('自启动脚本执行失败:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: error.message }));
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: stdout }));
      });
    } catch (error) {
      console.error('自启动控制失败:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }

  // 静态文件服务
  let filePath = req.url;
  
  // 移除查询参数
  const urlPath = filePath.split('?')[0];
  
  console.log(`  原始路径: ${urlPath}`);
  
  // 路由映射
  if (urlPath === '/' || urlPath === '/index.html') {
    // 默认使用最新版本
    filePath = 'renderer/index.html';
  } else if (urlPath.startsWith('/renderer/')) {
    // 直接访问 renderer 目录下的文件
    filePath = urlPath.substring(1);
  } else if (urlPath === '/web' || urlPath === '/web.html') {
    // 网页版（三列网格）
    filePath = 'renderer/index-web.html';
  } else if (urlPath.startsWith('/style')) {
    // CSS 文件
    if (urlPath.includes('web')) {
      filePath = 'renderer/style-web.css';
    } else if (urlPath.includes('v8')) {
      filePath = 'renderer/style-v8.css';
    } else if (urlPath.includes('v9')) {
      filePath = 'renderer/style-v9.css';
    } else {
      filePath = 'renderer/style.css'; // 默认使用 style.css
    }
  } else if (urlPath.startsWith('/app')) {
    // JS 文件
    if (urlPath.includes('v10')) {
      filePath = 'renderer/app-v10.js';
    } else if (urlPath.includes('web')) {
      filePath = 'renderer/app-web.js';
    } else if (urlPath.includes('v9')) {
      filePath = 'renderer/app-v9.js';
    } else if (urlPath.includes('v8')) {
      filePath = 'renderer/app-v8.js';
    } else {
      filePath = 'renderer/app.js'; // 默认使用 app.js
    }
  } else {
    // 其他文件保持原路径
    filePath = urlPath.substring(1); // 移除开头的 /
  }
  
  console.log(`  映射后路径: ${filePath}`);
  
  // 安全检查
  if (filePath.includes('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  filePath = path.join(basePath, filePath);
  
  // 如果没有扩展名，默认为 HTML
  let ext = path.extname(filePath);
  if (!ext && !filePath.includes('.')) {
    ext = '.html';
  }
  
  const contentType = mimeTypes[ext] || 'text/plain';
  
  console.log(`  -> 文件路径: ${filePath}, 扩展名: ${ext}, MIME: ${contentType}`);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   📰 实时新闻看板服务已启动            ║
╚════════════════════════════════════════╝

🌐 访问地址: http://localhost:${PORT}
🔄 自动刷新: 每 10 分钟
⚡ 数据源: 21 个（免费聚合 API）

💡 提示:
   - 在浏览器中打开上述地址
   - 使用 Cmd+W 关闭标签页
   - 使用 Ctrl+C 停止服务

🚀 Chrome 应用模式:
   open -a "Google Chrome" --args --app=http://localhost:${PORT}
  `);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n\n👋 服务已停止');
  process.exit(0);
});
