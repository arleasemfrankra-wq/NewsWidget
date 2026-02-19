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
  '百度热搜': { icon: '🔍' },
  'B站热门': { icon: '📺' },
  '抖音热点': { icon: '🎵' },
  '虎扑热帖': { icon: '🏀' },
  '百度贴吧': { icon: '💬' },
  '掘金': { icon: '⚡' },
  'V2EX': { icon: '💻' },
  'GitHub': { icon: '⭐' },
  'Stack Overflow': { icon: '📚' },
  'Hacker News': { icon: '🔶' },
  '少数派': { icon: '🔧' },
  '36氪': { icon: '💼' },
  '新浪财经': { icon: '💹' },
  '东方财富': { icon: '💰' },
  '雪球': { icon: '📈' },
  '财联社': { icon: '💼' },
  '今日头条': { icon: '📰' },
  '腾讯网': { icon: '🌐' },
  '豆瓣': { icon: '📖' }
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

// 渲染内容 - 垂直列表布局
function renderContent(data) {
  const container = document.getElementById('contentContainer');
  
  let filteredNews = {};
  
  if (currentTab === 'hot') {
    filteredNews = {
      '知乎热榜': data.news['热点']?.filter(n => n.source === '知乎热榜') || [],
      '微博热搜': data.news['热点']?.filter(n => n.source === '微博热搜') || [],
      '百度热搜': data.news['热点']?.filter(n => n.source === '百度热搜') || [],
      'B站热门': data.news['热点']?.filter(n => n.source === 'B站热门') || [],
      '抖音热点': data.news['热点']?.filter(n => n.source === '抖音热点') || [],
      '虎扑热帖': data.news['热点']?.filter(n => n.source === '虎扑热帖') || [],
      '百度贴吧': data.news['热点']?.filter(n => n.source === '百度贴吧') || []
    };
  } else if (currentTab === 'realtime') {
    filteredNews = {
      '今日头条': data.news['综合']?.filter(n => n.source === '今日头条') || [],
      '腾讯网': data.news['综合']?.filter(n => n.source === '腾讯网') || [],
      '豆瓣': data.news['综合']?.filter(n => n.source === '豆瓣') || [],
      '知乎热榜': data.news['热点']?.filter(n => n.source === '知乎热榜') || [],
      '微博热搜': data.news['热点']?.filter(n => n.source === '微博热搜') || []
    };
  } else if (currentTab === 'tech') {
    filteredNews = {
      '掘金': data.news['科技']?.filter(n => n.source === '掘金') || [],
      'V2EX': data.news['科技']?.filter(n => n.source === 'V2EX') || [],
      'GitHub': data.news['科技']?.filter(n => n.source === 'GitHub') || [],
      'Stack Overflow': data.news['科技']?.filter(n => n.source === 'Stack Overflow') || [],
      'Hacker News': data.news['科技']?.filter(n => n.source === 'Hacker News') || [],
      '少数派': data.news['科技']?.filter(n => n.source === '少数派') || [],
      '36氪': data.news['科技']?.filter(n => n.source === '36氪') || []
    };
  }
  
  let html = '';
  
  for (const [sourceName, items] of Object.entries(filteredNews)) {
    if (!items || items.length === 0) continue;
    
    // 按 rank 排序（从小到大，1 最热）
    const sortedItems = items.sort((a, b) => (a.rank || 999) - (b.rank || 999));
    
    const config = sourceConfig[sourceName] || { icon: '📰' };
    
    html += `
      <div class="source-card">
        <div class="source-header">
          <div class="source-title">
            <span class="source-icon">${config.icon}</span>
            <span>${sourceName}</span>
          </div>
          <span class="source-count">${sortedItems.length}</span>
        </div>
        <div class="news-list">
          ${sortedItems.map(item => renderNewsItem(item)).join('')}
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
  
  container.querySelectorAll('.news-item').forEach(item => {
    item.addEventListener('click', () => {
      const url = item.dataset.url;
      if (url) window.open(url, '_blank');
    });
  });
}

// 渲染新闻项
function renderNewsItem(item) {
  const rank = item.rank || 0;
  const rankClass = rank <= 3 ? `top-${rank}` : '';
  
  let hotBadge = '';
  if (item.score) {
    // 如果 score 是数字，格式化显示
    const scoreText = typeof item.score === 'number' ? 
      (item.score > 10000 ? `${(item.score / 10000).toFixed(1)}万` : item.score) : 
      item.score.substring(0, 50);
    hotBadge = `<span class="news-hot">${escapeHtml(scoreText)}</span>`;
  }
  
  let timeText = '';
  if (item.time) {
    timeText = `<span class="news-time">${escapeHtml(item.time)}</span>`;
  }
  
  return `
    <div class="news-item" data-url="${escapeHtml(item.url || '')}">
      <span class="news-rank ${rankClass}">${rank}</span>
      <div class="news-content">
        <div class="news-title">${escapeHtml(item.title)}</div>
        <div class="news-meta">
          ${hotBadge}
          ${timeText}
        </div>
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
    toast.style.animation = 'slideUp 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
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
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);
