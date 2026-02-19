// 全局状态
let currentTab = 'hot';
let countdownTimer;
let countdownSeconds = 600; // 10分钟
let isLoading = false;
let newsData = null;

// 数据源配置
const sourceConfig = {
  '知乎热榜': { icon: '🔥', color: '#0084ff' },
  '微博热搜': { icon: '🔥', color: '#ff8200' },
  'IT之家': { icon: '💻', color: '#d81e06' },
  '36氪': { icon: '💼', color: '#2e6be6' },
  'GitHub': { icon: '⭐', color: '#24292e' },
  '新浪财经': { icon: '💹', color: '#e6162d' },
  '华尔街见闻': { icon: '📈', color: '#1a1a1a' },
  'BBC': { icon: '🌍', color: '#bb1919' },
  'El País': { icon: '🇪🇸', color: '#0c6ebd' }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadNews();
  startCountdown();
});

// 事件监听
function initEventListeners() {
  // 刷新按钮
  document.getElementById('refreshBtn').addEventListener('click', () => {
    if (!isLoading) {
      loadNews();
      resetCountdown();
    }
  });

  // 标签页切换
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });

  // 回到顶部
  document.getElementById('topBtn').addEventListener('click', () => {
    document.getElementById('mainContent').scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
      e.preventDefault();
      if (!isLoading) {
        loadNews();
        resetCountdown();
      }
    }
  });
}

// 切换标签页
function switchTab(tabName) {
  currentTab = tabName;
  
  // 更新标签页状态
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // 重新渲染内容
  if (newsData) {
    renderContent(newsData);
  }
}

// 加载新闻
async function loadNews() {
  if (isLoading) return;
  
  const refreshBtn = document.getElementById('refreshBtn');
  const loadingState = document.getElementById('loadingState');
  const contentContainer = document.getElementById('contentContainer');
  
  isLoading = true;
  refreshBtn.classList.add('loading');
  loadingState.style.display = 'flex';
  contentContainer.style.display = 'none';
  
  try {
    const response = await fetch('/api/news');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    newsData = await response.json();
    
    // 更新时间
    const now = new Date();
    document.getElementById('updateTime').textContent = 
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 渲染内容
    renderContent(newsData);
    
    // 显示内容
    loadingState.style.display = 'none';
    contentContainer.style.display = 'block';
    
    showToast('✅ 刷新成功', 'success');
    
  } catch (error) {
    console.error('加载失败:', error);
    loadingState.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❌</div>
        <div class="empty-text">加载失败</div>
        <div class="empty-text" style="font-size: 10px; opacity: 0.6;">${error.message}</div>
      </div>
    `;
    showToast('❌ 加载失败', 'error');
  } finally {
    isLoading = false;
    refreshBtn.classList.remove('loading');
  }
}

// 渲染内容
function renderContent(data) {
  const container = document.getElementById('contentContainer');
  
  // 根据标签页过滤数据
  let filteredNews = {};
  
  if (currentTab === 'hot') {
    // 最热：显示所有热点新闻
    filteredNews = {
      '知乎热榜': data.news['热点']?.filter(n => n.source === '知乎') || [],
      '微博热搜': data.news['热点']?.filter(n => n.source === '微博') || [],
      '华尔街见闻': data.news['财经'] || []
    };
  } else if (currentTab === 'realtime') {
    // 实时：显示所有分类
    filteredNews = {
      '知乎热榜': data.news['热点']?.filter(n => n.source === '知乎') || [],
      '微博热搜': data.news['热点']?.filter(n => n.source === '微博') || [],
      'IT之家': data.news['科技']?.filter(n => n.source === 'IT之家') || [],
      '36氪': data.news['科技']?.filter(n => n.source === '36氪') || [],
      '新浪财经': data.news['财经']?.filter(n => n.source === '新浪财经') || []
    };
  } else if (currentTab === 'tech') {
    // 科技：只显示科技类
    filteredNews = {
      'IT之家': data.news['科技']?.filter(n => n.source === 'IT之家') || [],
      '36氪': data.news['科技']?.filter(n => n.source === '36氪') || [],
      'GitHub': data.news['科技']?.filter(n => n.source === 'GitHub') || []
    };
  }
  
  // 渲染数据源卡片
  let html = '';
  
  for (const [sourceName, items] of Object.entries(filteredNews)) {
    if (!items || items.length === 0) continue;
    
    const config = sourceConfig[sourceName] || { icon: '📰', color: '#007aff' };
    
    html += `
      <div class="source-card">
        <div class="source-header">
          <div class="source-title">
            <span class="source-icon">${config.icon}</span>
            <span>${sourceName}</span>
          </div>
          <span class="source-count">${items.length}</span>
        </div>
        <div class="source-content">
          <div class="news-scroll">
            ${items.map((item, index) => renderNewsCard(item, index + 1)).join('')}
          </div>
        </div>
      </div>
    `;
  }
  
  if (html === '') {
    html = `
      <div class="empty-state">
        <div class="empty-icon">📰</div>
        <div class="empty-text">暂无新闻</div>
      </div>
    `;
  }
  
  container.innerHTML = html;
  
  // 添加点击事件
  container.querySelectorAll('.news-card').forEach(card => {
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      if (url) {
        window.open(url, '_blank');
      }
    });
  });
}

// 渲染新闻卡片
function renderNewsCard(item, rank) {
  const rankClass = rank <= 3 ? `top-${rank}` : '';
  
  // 热度标签
  let hotBadge = '';
  if (item.hot) {
    const hotValue = parseFloat(item.hot);
    let hotClass = '';
    let hotText = item.hot;
    
    if (hotValue >= 100) {
      hotClass = 'hot-high';
      hotText = `🔥 ${item.hot}`;
    } else if (hotValue >= 50) {
      hotClass = 'hot-medium';
      hotText = `🔥 ${item.hot}`;
    }
    
    hotBadge = `<span class="news-hot ${hotClass}">${hotText}</span>`;
  }
  
  // 时间标签
  let timeText = '';
  if (item.time) {
    timeText = `<span class="news-time">${escapeHtml(item.time)}</span>`;
  }
  
  return `
    <div class="news-card" data-url="${escapeHtml(item.url || '')}">
      <div class="news-card-header">
        <span class="news-rank ${rankClass}">${rank}</span>
        ${hotBadge}
      </div>
      <div class="news-title">${escapeHtml(item.title)}</div>
      <div class="news-meta">
        <span class="news-source">${escapeHtml(item.source || '未知')}</span>
        ${timeText}
      </div>
    </div>
  `;
}

// HTML 转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 倒计时
function startCountdown() {
  updateCountdown();
  countdownTimer = setInterval(() => {
    countdownSeconds--;
    if (countdownSeconds <= 0) {
      loadNews();
      resetCountdown();
    }
    updateCountdown();
  }, 1000);
}

function updateCountdown() {
  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  document.getElementById('countdown').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function resetCountdown() {
  countdownSeconds = 600;
  updateCountdown();
}

// Toast 提示
function showToast(message, type = 'info') {
  // 移除旧的 toast
  const oldToast = document.querySelector('.toast');
  if (oldToast) {
    oldToast.remove();
  }
  
  // 创建新的 toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // 3秒后移除
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 添加 slideUp 动画
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);
