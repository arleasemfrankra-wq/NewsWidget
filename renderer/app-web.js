// 全局状态
let currentTab = 'hot';
let allSources = [];
let filteredSources = [];
let newsData = null;
let countdownTimer;
let countdownSeconds = 600;
let isLoading = false;

// 分类映射
const categoryMap = {
  'hot': '热点',
  'tech': '科技',
  'finance': '财经',
  'general': '综合'
};

// 数据源配置
const sourceConfig = {
  '知乎热榜': { icon: '🔥', type: 'hot', category: 'hot' },
  '微博热搜': { icon: '🔥', type: 'hot', category: 'hot' },
  '百度热搜': { icon: '🔍', type: 'hot', category: 'hot' },
  'B站热门': { icon: '📺', type: 'hot', category: 'hot' },
  '抖音热点': { icon: '🎵', type: 'hot', category: 'hot' },
  '虎扑热帖': { icon: '🏀', type: 'hot', category: 'hot' },
  '百度贴吧': { icon: '💬', type: 'hot', category: 'hot' },
  '掘金': { icon: '⚡', type: 'hot', category: 'tech' },
  'V2EX': { icon: '💻', type: 'hot', category: 'tech' },
  'GitHub': { icon: '⭐', type: 'hot', category: 'tech' },
  'Stack Overflow': { icon: '📚', type: 'hot', category: 'tech' },
  'Hacker News': { icon: '🔶', type: 'hot', category: 'tech' },
  '少数派': { icon: '🔧', type: 'hot', category: 'tech' },
  '36氪': { icon: '💼', type: 'hot', category: 'tech' },
  '新浪财经': { icon: '💹', type: 'news', category: 'finance' },
  '东方财富': { icon: '💰', type: 'news', category: 'finance' },
  '雪球': { icon: '📈', type: 'news', category: 'finance' },
  '财联社': { icon: '💼', type: 'news', category: 'finance' },
  '今日头条': { icon: '📰', type: 'news', category: 'general' },
  '腾讯网': { icon: '🌐', type: 'news', category: 'general' },
  '豆瓣': { icon: '📖', type: 'news', category: 'general' }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadNews();
  startCountdown();
});

// 事件监听
function initEventListeners() {
  // 标签页切换
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
  
  // 刷新按钮
  document.getElementById('refreshBtn').addEventListener('click', () => {
    if (!isLoading) loadNews();
  });
  
  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
      e.preventDefault();
      loadNews();
    }
  });
}

// 切换标签
function switchTab(tabName) {
  currentTab = tabName;
  
  // 更新标签样式
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // 过滤数据源
  filterSources();
  renderCards();
}

// 加载新闻
async function loadNews() {
  if (isLoading) return;
  
  const loadingState = document.getElementById('loadingState');
  const cardContainer = document.getElementById('cardContainer');
  
  isLoading = true;
  loadingState.style.display = 'flex';
  cardContainer.style.display = 'none';
  
  try {
    const response = await fetch('/api/news');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    newsData = await response.json();
    
    // 整理数据源
    allSources = [];
    for (const category in newsData.news) {
      const items = newsData.news[category];
      
      // 按来源分组
      const grouped = {};
      items.forEach(item => {
        const source = item.source;
        if (!grouped[source]) grouped[source] = [];
        grouped[source].push(item);
      });
      
      // 添加到 allSources
      for (const source in grouped) {
        allSources.push({
          name: source,
          items: grouped[source],
          category: category
        });
      }
    }
    
    // 过滤当前标签的数据源
    filterSources();
    renderCards();
    
    const now = new Date();
    document.getElementById('updateTime').textContent = 
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    loadingState.style.display = 'none';
    cardContainer.style.display = 'grid';
    
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
  }
}

// 渲染卡片（网格布局，所有卡片同时显示）
function renderCards() {
  const container = document.getElementById('contentContainer');
  container.innerHTML = '';
  
  const sources = filteredSources;
  
  if (sources.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📰</div>
        <div class="empty-text">暂无数据</div>
      </div>
    `;
    return;
  }
  
  sources.forEach((source, index) => {
    const config = sourceConfig[source.name] || { icon: '📰', type: 'hot' };
    const isHotType = config.type === 'hot';
    
    // 排序
    let sortedItems = [...source.items];
    if (isHotType) {
      sortedItems.sort((a, b) => (a.rank || 999) - (b.rank || 999));
    }
    
    const card = document.createElement('div');
    card.className = 'source-card';
    card.innerHTML = `
      <div class="card-header">
        <div class="source-info">
          <span class="source-icon">${config.icon}</span>
          <span class="source-name">${source.name}</span>
          <span class="source-count">${sortedItems.length}条</span>
        </div>
        <button class="card-refresh-btn" onclick="refreshSource(${index})">
          <span>↻</span>
        </button>
      </div>
      <div class="news-list">
        ${sortedItems.map(item => renderNewsItem(item, isHotType)).join('')}
      </div>
    `;
    
    container.appendChild(card);
    
    // 添加点击事件
    card.querySelectorAll('.news-item').forEach(newsItem => {
      newsItem.addEventListener('click', () => {
        const url = newsItem.dataset.url;
        if (url) window.open(url, '_blank');
      });
    });
  });
}

// 渲染新闻项
function renderNewsItem(item, isHotType) {
  const rank = item.rank || 0;
  const rankClass = rank <= 3 ? `top-${rank}` : '';
  
  // 显示排名
  let leftContent = `<span class="news-rank ${rankClass}">${rank}</span>`;
  
  // 元信息
  let metaContent = '';
  
  // 优先显示时间（如果有）
  if (item.time) {
    const relativeTime = getRelativeTime(item.time);
    metaContent += `<span class="news-time">${escapeHtml(relativeTime)}</span>`;
  }
  
  // 显示热度值
  if (item.score) {
    const scoreText = typeof item.score === 'number' ? 
      (item.score > 10000 ? `${(item.score / 10000).toFixed(1)}万` : item.score) : 
      (item.score.length > 20 ? item.score.substring(0, 20) + '...' : item.score);
    metaContent += `<span class="news-hot">${escapeHtml(scoreText)}</span>`;
  }
  
  return `
    <div class="news-item" data-url="${escapeHtml(item.url || '')}">
      ${leftContent}
      <div class="news-content">
        <div class="news-title">${escapeHtml(item.title)}</div>
        ${metaContent ? `<div class="news-meta">${metaContent}</div>` : ''}
      </div>
    </div>
  `;
}

// 转换为相对时间
function getRelativeTime(timeStr) {
  if (!timeStr) return '';
  
  try {
    const time = new Date(timeStr);
    const now = new Date();
    const diff = Math.floor((now - time) / 1000); // 秒
    
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
    
    // 超过30天显示日期
    return timeStr.substring(5, 10); // MM-DD
  } catch (e) {
    return timeStr;
  }
}

// 过滤数据源
function filterSources() {
  const config = sourceConfig;
  filteredSources = allSources.filter(source => {
    const sourceConf = config[source.name];
    if (!sourceConf) return false;
    return sourceConf.category === currentTab;
  });
}

// 刷新单个数据源
async function refreshSource(index) {
  // 暂时刷新全部
  await loadNews();
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
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2000);
}
