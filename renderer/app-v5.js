// 全局状态
let currentTab = 'hot';
let countdownTimer;
let countdownSeconds = 600;
let isLoading = false;
let newsData = null;

// 数据源配置
const sourceConfig = {
  '知乎热榜': { icon: '🔥' },
  '微博热搜': { icon: '🔥' },
  'IT之家': { icon: '💻' },
  '36氪': { icon: '💼' },
  'GitHub': { icon: '⭐' },
  '新浪财经': { icon: '💹' },
  '华尔街见闻': { icon: '📈' },
  'BBC': { icon: '🌍' },
  'El País': { icon: '🇪🇸' }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadNews();
  startCountdown();
});

// 事件监听
function initEventListeners() {
  document.getElementById('refreshBtn').addEventListener('click', () => {
    if (!isLoading) {
      loadNews();
      resetCountdown();
    }
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  document.getElementById('topBtn').addEventListener('click', () => {
    document.getElementById('mainContent').scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

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

// 切换标签
function switchTab(tabName) {
  currentTab = tabName;
  
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
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
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    newsData = await response.json();
    
    const now = new Date();
    document.getElementById('updateTime').textContent = 
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    renderContent(newsData);
    
    loadingState.style.display = 'none';
    contentContainer.style.display = 'block';
    
    showToast('✅ 刷新成功', 'success');
    
  } catch (error) {
    console.error('加载失败:', error);
    loadingState.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❌</div>
        <div class="empty-text">加载失败</div>
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
  
  let filteredNews = {};
  
  if (currentTab === 'hot') {
    filteredNews = {
      '知乎热榜': data.news['热点']?.filter(n => n.source === '知乎') || [],
      '微博热搜': data.news['热点']?.filter(n => n.source === '微博') || [],
      '华尔街见闻': data.news['财经'] || []
    };
  } else if (currentTab === 'realtime') {
    filteredNews = {
      '知乎热榜': data.news['热点']?.filter(n => n.source === '知乎') || [],
      '微博热搜': data.news['热点']?.filter(n => n.source === '微博') || [],
      'IT之家': data.news['科技']?.filter(n => n.source === 'IT之家') || [],
      '36氪': data.news['科技']?.filter(n => n.source === '36氪') || [],
      '新浪财经': data.news['财经']?.filter(n => n.source === '新浪财经') || []
    };
  } else if (currentTab === 'tech') {
    filteredNews = {
      'IT之家': data.news['科技']?.filter(n => n.source === 'IT之家') || [],
      '36氪': data.news['科技']?.filter(n => n.source === '36氪') || [],
      'GitHub': data.news['科技']?.filter(n => n.source === 'GitHub') || []
    };
  }
  
  let html = '';
  
  for (const [sourceName, items] of Object.entries(filteredNews)) {
    if (!items || items.length === 0) continue;
    
    const config = sourceConfig[sourceName] || { icon: '📰' };
    
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
            ${items.slice(0, 20).map((item, index) => renderNewsCard(item, index + 1)).join('')}
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
  
  container.querySelectorAll('.news-card').forEach(card => {
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      if (url) window.open(url, '_blank');
    });
  });
}

// 渲染新闻卡片
function renderNewsCard(item, rank) {
  const rankClass = rank <= 3 ? `top-${rank}` : '';
  
  let hotBadge = '';
  if (item.hot) {
    const hotValue = parseFloat(item.hot);
    let hotClass = '';
    
    if (hotValue >= 100) {
      hotClass = 'hot-high';
    } else if (hotValue >= 50) {
      hotClass = 'hot-medium';
    }
    
    hotBadge = `<span class="news-hot ${hotClass}">${item.hot}</span>`;
  }
  
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
  const oldToast = document.querySelector('.toast');
  if (oldToast) oldToast.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.2s ease-out';
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
  }
`;
document.head.appendChild(style);
