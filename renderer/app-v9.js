// 全局状态
let currentIndex = 0;
let currentTab = 'hot';
let allSources = [];
let filteredSources = [];
let newsData = null;
let countdownTimer;
let countdownSeconds = 600;
let isLoading = false;
let searchQuery = ''; // 搜索关键词

// 本地存储
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let viewStats = JSON.parse(localStorage.getItem('viewStats') || '{}');

// 分类映射
const categoryMap = {
  'hot': '热点',
  'tech': '科技',
  'finance': '财经',
  'general': '综合',
  'favorites': '收藏',
  'stats': '统计',
  'settings': '设置'
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
  '吾爱破解': { icon: '🔓', type: 'hot', category: 'tech' },
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
  updateFavBadge();
  initSettings();
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
  
  // 全局刷新按钮
  document.getElementById('refreshAllBtn').addEventListener('click', () => {
    if (!isLoading) {
      loadNews(true); // 强制刷新
    }
  });
  
  // 搜索功能
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  
  // 防抖搜索
  const debouncedSearch = debounce(() => {
    performSearch();
  }, 300);
  
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    if (searchQuery) {
      clearSearchBtn.style.display = 'block';
    } else {
      clearSearchBtn.style.display = 'none';
    }
    // 自动搜索（防抖）
    debouncedSearch();
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  searchBtn.addEventListener('click', () => {
    performSearch();
  });
  
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    performSearch(); // 清空搜索，显示全部
  });
  
  // 键盘导航
  document.addEventListener('keydown', (e) => {
    // 如果焦点在搜索框，不响应其他快捷键
    if (document.activeElement === searchInput) return;
    
    // ⌘F 或 Ctrl+F 聚焦搜索框
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault();
      searchInput.focus();
      return;
    }
    
    // ⌘R 刷新（所有页面都支持）
    if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
      e.preventDefault();
      loadNews(true); // 强制刷新
      return;
    }
    
    // 方向键导航（统计页面不响应）
    if (currentTab === 'stats') return;
    
    if (e.key === 'ArrowLeft') prevCard();
    if (e.key === 'ArrowRight') nextCard();
  });
  
  // 触控板滑动（wheel 事件）
  const cardWrapper = document.getElementById('cardWrapper');
  let wheelDeltaX = 0;
  let lastSwipeTime = 0;
  
  cardWrapper.addEventListener('wheel', (e) => {
    if (currentTab === 'stats') return;
    
    // 检测横向滑动
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      
      const now = Date.now();
      if (now - lastSwipeTime < 500) return;
      
      wheelDeltaX += e.deltaX;
      
      if (Math.abs(wheelDeltaX) > 50) {
        if (wheelDeltaX > 0) {
          nextCard();
        } else {
          prevCard();
        }
        wheelDeltaX = 0;
        lastSwipeTime = now;
      }
    }
  }, { passive: false });
  
  // 鼠标拖拽滑动
  let startX = 0;
  let isDragging = false;
  
  cardWrapper.addEventListener('mousedown', (e) => {
    if (currentTab === 'stats') return;
    if (e.target.closest('.news-item')) return;
    startX = e.clientX;
    isDragging = true;
    cardWrapper.style.cursor = 'grabbing';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
  });
  
  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    cardWrapper.style.cursor = 'grab';
    
    const endX = e.clientX;
    const diff = endX - startX;
    
    if (diff > 80) prevCard();
    if (diff < -80) nextCard();
  });
  
  // 触摸滑动
  let touchStartX = 0;
  
  cardWrapper.addEventListener('touchstart', (e) => {
    if (currentTab === 'stats') return;
    touchStartX = e.changedTouches[0].clientX;
  });
  
  cardWrapper.addEventListener('touchend', (e) => {
    if (currentTab === 'stats') return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    
    if (diff > 50) prevCard();
    if (diff < -50) nextCard();
  });
}

// 切换标签
function switchTab(tabName) {
  currentTab = tabName;
  currentIndex = 0;
  
  // 更新标签样式
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  const carouselContainer = document.getElementById('carouselContainer');
  const statsPanel = document.getElementById('statsPanel');
  const settingsPanel = document.getElementById('settingsPanel');
  const footer = document.querySelector('.footer');
  const searchBar = document.querySelector('.search-bar');
  
  // 隐藏所有面板
  carouselContainer.style.display = 'none';
  statsPanel.style.display = 'none';
  settingsPanel.style.display = 'none';
  footer.style.display = 'none';
  searchBar.style.display = 'none';
  
  if (tabName === 'stats') {
    // 显示统计面板
    statsPanel.style.display = 'block';
    renderStats();
  } else if (tabName === 'settings') {
    // 显示设置面板
    settingsPanel.style.display = 'block';
  } else if (tabName === 'favorites') {
    // 显示收藏
    carouselContainer.style.display = 'flex';
    footer.style.display = 'flex';
    searchBar.style.display = 'flex';
    renderFavorites();
  } else {
    // 显示新闻卡片
    carouselContainer.style.display = 'flex';
    footer.style.display = 'flex';
    searchBar.style.display = 'flex';
    filterSources();
    renderCards();
    renderIndicators();
  }
}

// 加载新闻
async function loadNews(forceRefresh = false) {
  if (isLoading) return;
  
  const loadingState = document.getElementById('loadingState');
  const cardContainer = document.getElementById('cardContainer');
  const refreshBtn = document.getElementById('refreshAllBtn');
  
  isLoading = true;
  if (refreshBtn) refreshBtn.classList.add('loading');
  loadingState.style.display = 'flex';
  cardContainer.style.display = 'none';
  
  // 显示加载进度
  loadingState.innerHTML = `
    <div class="spinner"></div>
    <div class="loading-text">${forceRefresh ? '强制刷新中...' : '正在加载 22 个数据源...'}</div>
  `;
  
  try {
    const url = forceRefresh ? '/api/news?force=true' : '/api/news';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    // 检查是否使用了缓存
    const cacheStatus = response.headers.get('X-Cache');
    const cacheAge = response.headers.get('X-Cache-Age');
    
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
    if (currentTab !== 'stats' && currentTab !== 'favorites' && currentTab !== 'settings') {
      filterSources();
      renderCards();
      renderIndicators();
    }
    
    const now = new Date();
    document.getElementById('updateTime').textContent = 
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    loadingState.style.display = 'none';
    cardContainer.style.display = 'block';
    
    // 显示成功和失败信息
    const successCount = allSources.length;
    const failedCount = newsData.failed ? newsData.failed.length : 0;
    
    let toastMessage = '';
    if (cacheStatus === 'HIT') {
      toastMessage = `✅ 加载成功 (缓存 ${cacheAge}秒前)`;
    } else if (failedCount > 0) {
      toastMessage = `✅ 加载成功 ${successCount} 个，失败 ${failedCount} 个`;
    } else {
      toastMessage = '✅ 刷新成功';
    }
    
    showToast(toastMessage, failedCount > 0 ? 'warning' : 'success');
    
  } catch (error) {
    console.error('加载失败:', error);
    loadingState.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❌</div>
        <div class="empty-text">加载失败</div>
        <div class="empty-desc">${error.message}</div>
      </div>
    `;
    showToast('❌ 加载失败', 'error');
  } finally {
    isLoading = false;
    const refreshBtn = document.getElementById('refreshAllBtn');
    if (refreshBtn) refreshBtn.classList.remove('loading');
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
  
  // 如果有搜索关键词，进一步过滤
  if (searchQuery) {
    filteredSources = filteredSources.map(source => {
      const filteredItems = source.items.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return {
        ...source,
        items: filteredItems
      };
    }).filter(source => source.items.length > 0);
  }
}

// 执行搜索
function performSearch() {
  if (currentTab === 'stats' || currentTab === 'settings') {
    showToast('统计和设置页面不支持搜索', 'info');
    return;
  }
  
  if (currentTab === 'favorites') {
    renderFavorites();
  } else {
    filterSources();
    renderCards();
    renderIndicators();
  }
  
  if (searchQuery) {
    const totalResults = filteredSources.reduce((sum, source) => sum + source.items.length, 0);
    showToast(`🔍 找到 ${totalResults} 条结果`, 'success');
  }
}

// 渲染卡片
function renderCards() {
  const container = document.getElementById('cardContainer');
  container.innerHTML = '';
  
  const sources = filteredSources;
  
  if (sources.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">暂无内容</div>
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
    card.className = `source-card ${index === currentIndex ? 'active' : ''}`;
    card.innerHTML = `
      <div class="card-header">
        <div class="source-info">
          <span class="source-icon">${config.icon}</span>
          <span class="source-name">${source.name}</span>
          <span class="source-count">${sortedItems.length}条</span>
        </div>
        <button class="refresh-btn" onclick="refreshSource(${index})">
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
      const favBtn = newsItem.querySelector('.fav-btn');
      const newsId = newsItem.dataset.id;
      
      // 收藏按钮事件
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFavorite(newsId);
        });
      }
      
      // 新闻项点击事件
      newsItem.addEventListener('click', () => {
        const url = newsItem.dataset.url;
        if (url) {
          window.open(url, '_blank');
          recordView(newsId);
        }
      });
    });
  });
}

// 渲染新闻项
function renderNewsItem(item, isHotType) {
  const rank = item.rank || 0;
  const rankClass = rank <= 3 ? `top-${rank}` : '';
  const newsId = generateNewsId(item);
  const isFavorited = favorites.some(fav => fav.id === newsId);
  
  let leftContent = `<span class="news-rank ${rankClass}">${rank}</span>`;
  
  let metaContent = '';
  
  // 只显示热度，不显示时间（因为 API 返回的时间都是抓取时间，不是发布时间）
  if (item.score) {
    const scoreText = typeof item.score === 'number' ? 
      (item.score > 10000 ? `${(item.score / 10000).toFixed(1)}万` : item.score) : 
      (item.score.length > 15 ? item.score.substring(0, 15) : item.score);
    metaContent += `<span class="news-hot">${escapeHtml(scoreText)}</span>`;
  }
  
  // 高亮搜索关键词
  let titleHtml = escapeHtml(item.title);
  if (searchQuery) {
    const regex = new RegExp(`(${escapeHtml(searchQuery)})`, 'gi');
    titleHtml = titleHtml.replace(regex, '<mark class="search-highlight">$1</mark>');
  }
  
  return `
    <div class="news-item" data-url="${escapeHtml(item.url || '')}" data-id="${newsId}">
      ${leftContent}
      <div class="news-content">
        <div class="news-title">${titleHtml}</div>
        ${metaContent ? `<div class="news-meta">${metaContent}</div>` : ''}
      </div>
      <button class="fav-btn ${isFavorited ? 'favorited' : ''}" title="${isFavorited ? '取消收藏' : '收藏'}">
        ${isFavorited ? '★' : '☆'}
      </button>
    </div>
  `;
}

// 生成新闻ID（使用 source + title + url 避免冲突）
function generateNewsId(item) {
  const base = `${item.source}_${item.title}_${item.url || ''}`;
  // 使用简单的哈希函数生成唯一ID
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `news_${Math.abs(hash).toString(36)}`;
}

// 切换收藏
function toggleFavorite(newsId) {
  const index = favorites.findIndex(fav => fav.id === newsId);
  
  if (index > -1) {
    // 取消收藏
    favorites.splice(index, 1);
    showToast('已取消收藏', 'info');
  } else {
    // 添加收藏
    const newsItem = findNewsById(newsId);
    if (newsItem) {
      favorites.push({
        id: newsId,
        ...newsItem,
        favTime: new Date().toISOString()
      });
      showToast('已添加到收藏', 'success');
    }
  }
  
  // 保存到本地存储
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavBadge();
  
  // 重新渲染当前视图
  if (currentTab === 'favorites') {
    renderFavorites();
  } else {
    renderCards();
  }
}

// 查找新闻
function findNewsById(newsId) {
  for (const source of allSources) {
    for (const item of source.items) {
      if (generateNewsId(item) === newsId) {
        return item;
      }
    }
  }
  return null;
}

// 更新收藏徽章
function updateFavBadge() {
  const badge = document.getElementById('favBadge');
  if (badge) {
    badge.textContent = favorites.length;
  }
}

// 渲染收藏
function renderFavorites() {
  const container = document.getElementById('cardContainer');
  container.innerHTML = '';
  
  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⭐</div>
        <div class="empty-text">还没有收藏任何新闻</div>
      </div>
    `;
    document.getElementById('indicators').innerHTML = '';
    return;
  }
  
  // 按收藏时间倒序
  let sortedFavs = [...favorites].sort((a, b) => 
    new Date(b.favTime) - new Date(a.favTime)
  );
  
  // 如果有搜索关键词，过滤收藏
  if (searchQuery) {
    sortedFavs = sortedFavs.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (sortedFavs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">没有找到匹配的收藏</div>
          <div class="empty-desc">关键词: "${escapeHtml(searchQuery)}"</div>
        </div>
      `;
      document.getElementById('indicators').innerHTML = '';
      return;
    }
  }
  
  const card = document.createElement('div');
  card.className = 'source-card active';
  card.innerHTML = `
    <div class="card-header">
      <div class="source-info">
        <span class="source-icon">⭐</span>
        <span class="source-name">我的收藏</span>
        <span class="source-count">${sortedFavs.length}条${searchQuery ? ' (已过滤)' : ''}</span>
      </div>
    </div>
    <div class="news-list">
      ${sortedFavs.map((item, index) => {
        const newsId = item.id;
        // 高亮搜索关键词
        let titleHtml = escapeHtml(item.title);
        if (searchQuery) {
          const regex = new RegExp(`(${escapeHtml(searchQuery)})`, 'gi');
          titleHtml = titleHtml.replace(regex, '<mark class="search-highlight">$1</mark>');
        }
        return `
          <div class="news-item" data-url="${escapeHtml(item.url || '')}" data-id="${newsId}">
            <span class="news-rank">${index + 1}</span>
            <div class="news-content">
              <div class="news-title">${titleHtml}</div>
              <div class="news-meta">
                <span class="news-time">${escapeHtml(item.source)}</span>
                <span class="news-time">${getRelativeTime(item.favTime)}</span>
              </div>
            </div>
            <button class="fav-btn favorited" title="取消收藏">★</button>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  container.appendChild(card);
  
  // 添加事件
  card.querySelectorAll('.news-item').forEach(newsItem => {
    const favBtn = newsItem.querySelector('.fav-btn');
    const newsId = newsItem.dataset.id;
    
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(newsId);
      });
    }
    
    newsItem.addEventListener('click', () => {
      const url = newsItem.dataset.url;
      if (url) {
        window.open(url, '_blank');
        recordView(newsId);
      }
    });
  });
  
  document.getElementById('indicators').innerHTML = '';
}

// 记录浏览
function recordView(newsId) {
  if (!viewStats[newsId]) {
    viewStats[newsId] = 0;
  }
  viewStats[newsId]++;
  localStorage.setItem('viewStats', JSON.stringify(viewStats));
}

// 渲染统计
function renderStats() {
  // 更新时间
  const now = new Date();
  document.getElementById('statsTime').textContent = 
    `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // 统计总数
  let totalNews = 0;
  const categoryCount = { '热点': 0, '科技': 0, '财经': 0, '综合': 0 };
  const sourceCount = {};
  
  allSources.forEach(source => {
    totalNews += source.items.length;
    categoryCount[source.category] = (categoryCount[source.category] || 0) + source.items.length;
    sourceCount[source.name] = source.items.length;
  });
  
  const totalViews = Object.values(viewStats).reduce((sum, count) => sum + count, 0);
  const successCount = allSources.length;
  const failedCount = newsData && newsData.failed ? newsData.failed.length : 0;
  
  document.getElementById('totalNews').textContent = totalNews;
  document.getElementById('totalSources').textContent = `${successCount}/${successCount + failedCount}`;
  document.getElementById('totalFavorites').textContent = favorites.length;
  document.getElementById('totalViews').textContent = totalViews;
  
  // 显示失败的数据源（如果有）
  const statsHeader = document.querySelector('.stats-header');
  const existingWarning = statsHeader.querySelector('.stats-warning');
  if (existingWarning) existingWarning.remove();
  
  if (failedCount > 0 && newsData.failed) {
    const warning = document.createElement('div');
    warning.className = 'stats-warning';
    warning.innerHTML = `⚠️ ${failedCount} 个数据源加载失败: ${newsData.failed.join('、')}`;
    statsHeader.appendChild(warning);
  }
  
  // 热词云图
  renderWordCloud();
  
  // 分类分布
  renderCategoryChart(categoryCount, totalNews);
  
  // 数据源活跃度
  renderSourceChart(sourceCount);
}

// 渲染热词云图
function renderWordCloud() {
  const container = document.getElementById('wordCloud');
  
  // 常见技术术语白名单（保留这些英文词）
  const techTerms = new Set([
    'AI', 'API', 'GitHub', 'Claude', 'GPT', 'ChatGPT', 'OpenAI', 'Google',
    'Apple', 'Microsoft', 'Meta', 'Tesla', 'Amazon', 'Netflix', 'Twitter',
    'iOS', 'Android', 'macOS', 'Windows', 'Linux', 'Docker', 'Kubernetes',
    'React', 'Vue', 'Angular', 'Node', 'Python', 'Java', 'JavaScript',
    'TypeScript', 'Go', 'Rust', 'Swift', 'Flutter', 'Electron', 'VS',
    'Code', 'Git', 'CI', 'CD', 'DevOps', 'AWS', 'Azure', 'GCP',
    'ML', 'DL', 'NLP', 'LLM', 'Transformer', 'BERT', 'Stable', 'Diffusion',
    'Midjourney', 'Copilot', 'Gemini', 'Bard', 'Llama', 'Mistral',
    'iPhone', 'iPad', 'Mac', 'MacBook', 'AirPods', 'Vision', 'Pro',
    'ChatGLM', 'Kimi', 'DeepSeek', 'Qwen', 'Baichuan', 'Spark'
  ]);
  
  // 提取所有标题的关键词
  const words = {};
  allSources.forEach(source => {
    source.items.forEach(item => {
      const title = item.title;
      // 简单分词（按空格和标点）
      const tokens = title.split(/[\s，。！？、；：""''（）《》【】\[\]]+/);
      tokens.forEach(token => {
        if (token.length < 2 || token.length > 15) return;
        
        // 包含中文字符的词，直接保留
        if (/[\u4e00-\u9fa5]/.test(token)) {
          words[token] = (words[token] || 0) + 1;
        }
        // 纯英文词，检查是否在白名单中
        else if (/^[a-zA-Z]+$/.test(token) && techTerms.has(token)) {
          words[token] = (words[token] || 0) + 1;
        }
      });
    });
  });
  
  // 排序取前30
  const sortedWords = Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);
  
  if (sortedWords.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">暂无热词数据</div>';
    return;
  }
  
  container.innerHTML = sortedWords.map(([word, count]) => {
    const size = 12 + Math.min(count * 2, 20);
    return `<span class="word-item" style="font-size: ${size}px">${escapeHtml(word)}</span>`;
  }).join('');
}

// 渲染分类图表
function renderCategoryChart(categoryCount, total) {
  const container = document.getElementById('categoryChart');
  
  const categories = ['热点', '科技', '财经', '综合'];
  const icons = { '热点': '🔥', '科技': '💻', '财经': '💹', '综合': '📰' };
  
  container.innerHTML = categories.map(cat => {
    const count = categoryCount[cat] || 0;
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    
    return `
      <div class="chart-bar">
        <div class="chart-label">${icons[cat]} ${cat}</div>
        <div class="chart-track">
          <div class="chart-fill" style="width: ${percent}%">
            <span class="chart-value">${count}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 渲染数据源图表
function renderSourceChart(sourceCount) {
  const container = document.getElementById('sourceChart');
  
  // 排序取前10
  const sortedSources = Object.entries(sourceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  const maxCount = sortedSources[0]?.[1] || 1;
  
  container.innerHTML = sortedSources.map(([source, count]) => {
    const percent = Math.round((count / maxCount) * 100);
    const config = sourceConfig[source] || { icon: '📰' };
    
    return `
      <div class="source-bar">
        <div class="source-label">
          <span>${config.icon}</span>
          <span>${escapeHtml(source)}</span>
        </div>
        <div class="source-track">
          <div class="source-fill" style="width: ${percent}%">
            <span class="source-value">${count}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 转换为相对时间
function getRelativeTime(timeStr) {
  if (!timeStr) return '';
  
  try {
    const time = new Date(timeStr);
    const now = new Date();
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
    
    return timeStr.substring(5, 10);
  } catch (e) {
    return timeStr;
  }
}

// 渲染指示器
function renderIndicators() {
  const container = document.getElementById('indicators');
  container.innerHTML = '';
  
  const sources = filteredSources;
  
  sources.forEach((_, index) => {
    const indicator = document.createElement('div');
    indicator.className = `indicator ${index === currentIndex ? 'active' : ''}`;
    indicator.addEventListener('click', () => goToCard(index));
    container.appendChild(indicator);
  });
}

// 切换卡片
function goToCard(index) {
  const sources = filteredSources;
  if (index < 0 || index >= sources.length || index === currentIndex) return;
  
  const cards = document.querySelectorAll('.source-card');
  const indicators = document.querySelectorAll('.indicator');
  
  cards[currentIndex].classList.remove('active');
  cards[currentIndex].classList.add('prev');
  
  cards[index].classList.remove('prev');
  cards[index].classList.add('active');
  
  indicators[currentIndex].classList.remove('active');
  indicators[index].classList.add('active');
  
  currentIndex = index;
}

function prevCard() {
  const sources = filteredSources;
  const newIndex = currentIndex > 0 ? currentIndex - 1 : sources.length - 1;
  goToCard(newIndex);
}

function nextCard() {
  const sources = filteredSources;
  const newIndex = currentIndex < sources.length - 1 ? currentIndex + 1 : 0;
  goToCard(newIndex);
}

// 刷新单个数据源
async function refreshSource(index) {
  const btn = document.querySelectorAll('.refresh-btn')[index];
  if (!btn || btn.classList.contains('loading')) return;
  
  btn.classList.add('loading');
  await loadNews(true); // 强制刷新
  btn.classList.remove('loading');
  goToCard(index);
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
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

// ========== 设置功能 ==========

// 应用主题
function applyTheme(theme) {
  const html = document.documentElement;
  
  if (theme === 'auto') {
    // 跟随系统
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('theme') === 'auto') {
        html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  } else {
    // 手动设置
    html.setAttribute('data-theme', theme);
  }
}

// 初始化设置
function initSettings() {
  // 主题设置
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.getElementById('themeSelect').value = savedTheme;
  applyTheme(savedTheme);
  
  document.getElementById('themeSelect').addEventListener('change', (e) => {
    const theme = e.target.value;
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    showToast(`✅ 主题已切换为${theme === 'dark' ? '暗色' : theme === 'light' ? '亮色' : '跟随系统'}`, 'success');
  });
  
  // 刷新间隔
  const savedInterval = localStorage.getItem('refreshInterval') || '600';
  document.getElementById('refreshInterval').value = savedInterval;
  countdownSeconds = parseInt(savedInterval);
  
  document.getElementById('refreshInterval').addEventListener('change', (e) => {
    const interval = parseInt(e.target.value);
    localStorage.setItem('refreshInterval', interval);
    countdownSeconds = interval;
    resetCountdown();
    showToast('刷新间隔已更新', 'success');
  });
  
  // 开机自启动（调用后端 API）
  const autostartToggle = document.getElementById('autostartToggle');
  const autostartEnabled = localStorage.getItem('autostartEnabled') === 'true';
  autostartToggle.checked = autostartEnabled;
  
  autostartToggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    const action = enabled ? 'enable' : 'disable';
    
    try {
      const response = await fetch(`/api/autostart?action=${action}`);
      const result = await response.json();
      
      if (result.success) {
        localStorage.setItem('autostartEnabled', enabled);
        showToast(enabled ? '✅ 开机自启动已启用' : '✅ 开机自启动已取消', 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('设置自启动失败:', error);
      showToast('❌ 设置失败: ' + error.message, 'error');
      // 恢复开关状态
      autostartToggle.checked = !enabled;
    }
  });
  
  // 导出收藏
  document.getElementById('exportFavBtn').addEventListener('click', () => {
    if (favorites.length === 0) {
      showToast('没有收藏可以导出', 'error');
      return;
    }
    
    const data = JSON.stringify(favorites, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `favorites-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`已导出 ${favorites.length} 条收藏`, 'success');
  });
  
  // 清除数据
  document.getElementById('clearDataBtn').addEventListener('click', () => {
    if (!confirm('确定要清除所有收藏和浏览记录吗？此操作不可恢复！')) {
      return;
    }
    
    localStorage.removeItem('favorites');
    localStorage.removeItem('viewStats');
    favorites = [];
    viewStats = {};
    updateFavBadge();
    
    showToast('数据已清除', 'success');
  });
}
