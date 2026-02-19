// 主应用模块 - v10.0 模块化版本
import { SearchModule } from '/renderer/modules/search.js';
import { FavoritesModule } from '/renderer/modules/favorites.js';
import { StatsModule } from '/renderer/modules/stats.js';
import { ThemeModule } from '/renderer/modules/theme.js';
import { SettingsModule } from '/renderer/modules/settings.js';
import { UtilsModule } from '/renderer/modules/utils.js';

class NewsApp {
  constructor() {
    // 初始化模块
    this.utils = UtilsModule;
    this.search = new SearchModule();
    this.favorites = new FavoritesModule();
    this.stats = new StatsModule();
    this.theme = new ThemeModule();
    this.settings = new SettingsModule();
    
    // 全局状态
    this.currentIndex = 0;
    this.currentTab = 'hot';
    this.allSources = [];
    this.filteredSources = [];
    this.newsData = null;
    this.countdownTimer = null;
    this.countdownSeconds = this.settings.getRefreshInterval();
    this.isLoading = false;
    
    // 数据源配置
    this.sourceConfig = {
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
  }

  // 初始化应用
  init() {
    this.initEventListeners();
    this.loadNews();
    this.startCountdown();
    this.favorites.updateBadge();
    this.theme.init();
    this.settings.init(this);
    this.search.init(this);
  }

  // 事件监听
  initEventListeners() {
    // 标签页切换
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
      });
    });
    
    // 全局刷新按钮
    document.getElementById('refreshAllBtn').addEventListener('click', () => {
      if (!this.isLoading) {
        this.loadNews(true);
      }
    });
    
    // 键盘导航
    document.addEventListener('keydown', (e) => {
      const searchInput = document.getElementById('searchInput');
      if (document.activeElement === searchInput) return;
      
      // ⌘R 刷新
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        this.loadNews(true);
        return;
      }
      
      // 方向键导航
      if (this.currentTab === 'stats' || this.currentTab === 'settings') return;
      
      if (e.key === 'ArrowLeft') this.prevCard();
      if (e.key === 'ArrowRight') this.nextCard();
    });
    
    // 触控板滑动
    const cardWrapper = document.getElementById('cardWrapper');
    let wheelDeltaX = 0;
    let lastSwipeTime = 0;
    
    cardWrapper.addEventListener('wheel', (e) => {
      if (this.currentTab === 'stats' || this.currentTab === 'settings') return;
      
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        
        const now = Date.now();
        if (now - lastSwipeTime < 500) return;
        
        wheelDeltaX += e.deltaX;
        
        if (Math.abs(wheelDeltaX) > 50) {
          if (wheelDeltaX > 0) {
            this.nextCard();
          } else {
            this.prevCard();
          }
          wheelDeltaX = 0;
          lastSwipeTime = now;
        }
      }
    }, { passive: false });
    
    // 鼠标拖拽
    let startX = 0;
    let isDragging = false;
    
    cardWrapper.addEventListener('mousedown', (e) => {
      if (this.currentTab === 'stats' || this.currentTab === 'settings') return;
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
      
      if (diff > 80) this.prevCard();
      if (diff < -80) this.nextCard();
    });
    
    // 触摸滑动
    let touchStartX = 0;
    
    cardWrapper.addEventListener('touchstart', (e) => {
      if (this.currentTab === 'stats' || this.currentTab === 'settings') return;
      touchStartX = e.changedTouches[0].clientX;
    });
    
    cardWrapper.addEventListener('touchend', (e) => {
      if (this.currentTab === 'stats' || this.currentTab === 'settings') return;
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      
      if (diff > 50) this.prevCard();
      if (diff < -50) this.nextCard();
    });
  }

  // 切换标签
  switchTab(tabName) {
    this.currentTab = tabName;
    this.currentIndex = 0;
    
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    const carouselContainer = document.getElementById('carouselContainer');
    const statsPanel = document.getElementById('statsPanel');
    const settingsPanel = document.getElementById('settingsPanel');
    const footer = document.querySelector('.footer');
    const searchBar = document.querySelector('.search-bar');
    
    carouselContainer.style.display = 'none';
    statsPanel.style.display = 'none';
    settingsPanel.style.display = 'none';
    footer.style.display = 'none';
    searchBar.style.display = 'none';
    
    if (tabName === 'stats') {
      statsPanel.style.display = 'block';
      this.stats.renderStats(this.allSources, this.newsData, this.favorites.getCount());
    } else if (tabName === 'settings') {
      settingsPanel.style.display = 'block';
    } else if (tabName === 'favorites') {
      carouselContainer.style.display = 'flex';
      footer.style.display = 'flex';
      searchBar.style.display = 'flex';
      this.renderFavorites();
    } else {
      carouselContainer.style.display = 'flex';
      footer.style.display = 'flex';
      searchBar.style.display = 'flex';
      this.filterSources();
      this.renderCards();
      this.renderIndicators();
    }
  }

  // 加载新闻
  async loadNews(forceRefresh = false) {
    if (this.isLoading) return;
    
    const loadingState = document.getElementById('loadingState');
    const cardContainer = document.getElementById('cardContainer');
    const refreshBtn = document.getElementById('refreshAllBtn');
    
    this.isLoading = true;
    if (refreshBtn) refreshBtn.classList.add('loading');
    loadingState.style.display = 'flex';
    cardContainer.style.display = 'none';
    
    loadingState.innerHTML = `
      <div class="spinner"></div>
      <div class="loading-text">${forceRefresh ? '强制刷新中...' : '正在加载 22 个数据源...'}</div>
    `;
    
    try {
      const url = forceRefresh ? '/api/news?force=true' : '/api/news';
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const cacheStatus = response.headers.get('X-Cache');
      const cacheAge = response.headers.get('X-Cache-Age');
      
      this.newsData = await response.json();
      
      this.allSources = [];
      for (const category in this.newsData.news) {
        const items = this.newsData.news[category];
        
        const grouped = {};
        items.forEach(item => {
          const source = item.source;
          if (!grouped[source]) grouped[source] = [];
          grouped[source].push(item);
        });
        
        for (const source in grouped) {
          this.allSources.push({
            name: source,
            items: grouped[source],
            category: category
          });
        }
      }
      
      if (this.currentTab !== 'stats' && this.currentTab !== 'favorites' && this.currentTab !== 'settings') {
        this.filterSources();
        this.renderCards();
        this.renderIndicators();
      }
      
      const now = new Date();
      document.getElementById('updateTime').textContent = 
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      loadingState.style.display = 'none';
      cardContainer.style.display = 'block';
      
      const successCount = this.allSources.length;
      const failedCount = this.newsData.failed ? this.newsData.failed.length : 0;
      
      let toastMessage = '';
      if (cacheStatus === 'HIT') {
        toastMessage = `✅ 加载成功 (缓存 ${cacheAge}秒前)`;
      } else if (failedCount > 0) {
        toastMessage = `✅ 加载成功 ${successCount} 个，失败 ${failedCount} 个`;
      } else {
        toastMessage = '✅ 刷新成功';
      }
      
      this.utils.showToast(toastMessage, failedCount > 0 ? 'warning' : 'success');
      
    } catch (error) {
      console.error('加载失败:', error);
      loadingState.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">❌</div>
          <div class="empty-text">加载失败</div>
          <div class="empty-desc">${error.message}</div>
        </div>
      `;
      this.utils.showToast('❌ 加载失败', 'error');
    } finally {
      this.isLoading = false;
      if (refreshBtn) refreshBtn.classList.remove('loading');
    }
  }

  // 过滤数据源
  filterSources() {
    this.filteredSources = this.allSources.filter(source => {
      const sourceConf = this.sourceConfig[source.name];
      if (!sourceConf) return false;
      return sourceConf.category === this.currentTab;
    });
    
    const searchQuery = this.search.getQuery();
    if (searchQuery) {
      this.filteredSources = this.filteredSources.map(source => {
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

  // 渲染卡片
  renderCards() {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';
    
    const sources = this.filteredSources;
    
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
      const config = this.sourceConfig[source.name] || { icon: '📰', type: 'hot' };
      const isHotType = config.type === 'hot';
      
      let sortedItems = [...source.items];
      if (isHotType) {
        sortedItems.sort((a, b) => (a.rank || 999) - (b.rank || 999));
      }
      
      const card = document.createElement('div');
      card.className = `source-card ${index === this.currentIndex ? 'active' : ''}`;
      card.innerHTML = `
        <div class="card-header">
          <div class="source-info">
            <span class="source-icon">${config.icon}</span>
            <span class="source-name">${source.name}</span>
            <span class="source-count">${sortedItems.length}条</span>
          </div>
          <button class="refresh-btn" data-index="${index}">
            <span>↻</span>
          </button>
        </div>
        <div class="news-list">
          ${sortedItems.map(item => this.renderNewsItem(item, isHotType)).join('')}
        </div>
      `;
      
      container.appendChild(card);
      
      // 刷新按钮事件
      card.querySelector('.refresh-btn').addEventListener('click', () => {
        this.refreshSource(index);
      });
      
      // 新闻项事件
      card.querySelectorAll('.news-item').forEach(newsItem => {
        const favBtn = newsItem.querySelector('.fav-btn');
        const newsId = newsItem.dataset.id;
        
        if (favBtn) {
          favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(newsId);
          });
        }
        
        newsItem.addEventListener('click', () => {
          const url = newsItem.dataset.url;
          if (url) {
            window.open(url, '_blank');
            this.stats.recordView(newsId);
          }
        });
      });
    });
  }

  // 渲染新闻项
  renderNewsItem(item, isHotType) {
    const rank = item.rank || 0;
    const rankClass = rank <= 3 ? `top-${rank}` : '';
    const newsId = this.favorites.generateNewsId(item);
    const isFavorited = this.favorites.isFavorited(newsId);
    
    let leftContent = `<span class="news-rank ${rankClass}">${rank}</span>`;
    
    let metaContent = '';
    if (item.score) {
      const scoreText = typeof item.score === 'number' ? 
        (item.score > 10000 ? `${(item.score / 10000).toFixed(1)}万` : item.score) : 
        (item.score.length > 15 ? item.score.substring(0, 15) : item.score);
      metaContent += `<span class="news-hot">${this.utils.escapeHtml(scoreText)}</span>`;
    }
    
    let titleHtml = this.utils.escapeHtml(item.title);
    const searchQuery = this.search.getQuery();
    if (searchQuery) {
      const regex = new RegExp(`(${this.utils.escapeHtml(searchQuery)})`, 'gi');
      titleHtml = titleHtml.replace(regex, '<mark class="search-highlight">$1</mark>');
    }
    
    return `
      <div class="news-item" data-url="${this.utils.escapeHtml(item.url || '')}" data-id="${newsId}">
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

  // 切换收藏
  toggleFavorite(newsId) {
    const newsItem = this.findNewsById(newsId);
    if (!newsItem) return;
    
    const result = this.favorites.toggle(newsId, newsItem);
    this.utils.showToast(result.message, result.added ? 'success' : 'info');
    
    if (this.currentTab === 'favorites') {
      this.renderFavorites();
    } else {
      this.renderCards();
    }
  }

  // 查找新闻
  findNewsById(newsId) {
    for (const source of this.allSources) {
      for (const item of source.items) {
        if (this.favorites.generateNewsId(item) === newsId) {
          return item;
        }
      }
    }
    return null;
  }

  // 渲染收藏
  renderFavorites() {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';
    
    const favList = this.favorites.getAll();
    
    if (favList.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⭐</div>
          <div class="empty-text">还没有收藏任何新闻</div>
        </div>
      `;
      document.getElementById('indicators').innerHTML = '';
      return;
    }
    
    let sortedFavs = [...favList].sort((a, b) => 
      new Date(b.favTime) - new Date(a.favTime)
    );
    
    const searchQuery = this.search.getQuery();
    if (searchQuery) {
      sortedFavs = sortedFavs.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (sortedFavs.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <div class="empty-text">没有找到匹配的收藏</div>
            <div class="empty-desc">关键词: "${this.utils.escapeHtml(searchQuery)}"</div>
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
          let titleHtml = this.utils.escapeHtml(item.title);
          if (searchQuery) {
            const regex = new RegExp(`(${this.utils.escapeHtml(searchQuery)})`, 'gi');
            titleHtml = titleHtml.replace(regex, '<mark class="search-highlight">$1</mark>');
          }
          return `
            <div class="news-item" data-url="${this.utils.escapeHtml(item.url || '')}" data-id="${newsId}">
              <span class="news-rank">${index + 1}</span>
              <div class="news-content">
                <div class="news-title">${titleHtml}</div>
                <div class="news-meta">
                  <span class="news-time">${this.utils.escapeHtml(item.source)}</span>
                  <span class="news-time">${this.utils.getRelativeTime(item.favTime)}</span>
                </div>
              </div>
              <button class="fav-btn favorited" title="取消收藏">★</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    container.appendChild(card);
    
    card.querySelectorAll('.news-item').forEach(newsItem => {
      const favBtn = newsItem.querySelector('.fav-btn');
      const newsId = newsItem.dataset.id;
      
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleFavorite(newsId);
        });
      }
      
      newsItem.addEventListener('click', () => {
        const url = newsItem.dataset.url;
        if (url) {
          window.open(url, '_blank');
          this.stats.recordView(newsId);
        }
      });
    });
    
    document.getElementById('indicators').innerHTML = '';
  }

  // 渲染指示器
  renderIndicators() {
    const container = document.getElementById('indicators');
    container.innerHTML = '';
    
    const sources = this.filteredSources;
    
    sources.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `indicator ${index === this.currentIndex ? 'active' : ''}`;
      indicator.addEventListener('click', () => this.goToCard(index));
      container.appendChild(indicator);
    });
  }

  // 切换卡片
  goToCard(index) {
    const sources = this.filteredSources;
    if (index < 0 || index >= sources.length || index === this.currentIndex) return;
    
    const cards = document.querySelectorAll('.source-card');
    const indicators = document.querySelectorAll('.indicator');
    
    cards[this.currentIndex].classList.remove('active');
    cards[this.currentIndex].classList.add('prev');
    
    cards[index].classList.remove('prev');
    cards[index].classList.add('active');
    
    indicators[this.currentIndex].classList.remove('active');
    indicators[index].classList.add('active');
    
    this.currentIndex = index;
  }

  prevCard() {
    const sources = this.filteredSources;
    const newIndex = this.currentIndex > 0 ? this.currentIndex - 1 : sources.length - 1;
    this.goToCard(newIndex);
  }

  nextCard() {
    const sources = this.filteredSources;
    const newIndex = this.currentIndex < sources.length - 1 ? this.currentIndex + 1 : 0;
    this.goToCard(newIndex);
  }

  // 刷新单个数据源
  async refreshSource(index) {
    const btn = document.querySelectorAll('.refresh-btn')[index];
    if (!btn || btn.classList.contains('loading')) return;
    
    btn.classList.add('loading');
    await this.loadNews(true);
    btn.classList.remove('loading');
    this.goToCard(index);
  }

  // 倒计时
  startCountdown() {
    this.updateCountdown();
    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        this.loadNews();
        this.resetCountdown();
      }
      this.updateCountdown();
    }, 1000);
  }

  updateCountdown() {
    const minutes = Math.floor(this.countdownSeconds / 60);
    const seconds = this.countdownSeconds % 60;
    document.getElementById('countdown').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  resetCountdown() {
    this.countdownSeconds = this.settings.getRefreshInterval();
    this.updateCountdown();
  }

  // 执行搜索（由 SearchModule 调用）
  performSearch() {
    if (this.currentTab === 'stats' || this.currentTab === 'settings') {
      this.utils.showToast('统计和设置页面不支持搜索', 'info');
      return;
    }
    
    if (this.currentTab === 'favorites') {
      this.renderFavorites();
    } else {
      this.filterSources();
      this.renderCards();
      this.renderIndicators();
    }
    
    const searchQuery = this.search.getQuery();
    if (searchQuery) {
      const totalResults = this.filteredSources.reduce((sum, source) => sum + source.items.length, 0);
      this.utils.showToast(`🔍 找到 ${totalResults} 条结果`, 'success');
    }
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new NewsApp();
  window.app.init();
});
