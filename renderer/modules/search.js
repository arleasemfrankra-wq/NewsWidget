// 搜索模块
export class SearchModule {
  constructor() {
    this.searchQuery = '';
    this.app = null;
  }

  // 初始化搜索功能
  init(app) {
    this.app = app;
    
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    // 防抖函数
    const debounce = (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };
    
    // 防抖搜索
    const debouncedSearch = debounce(() => {
      this.performSearch();
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim();
      if (this.searchQuery) {
        clearSearchBtn.style.display = 'block';
      } else {
        clearSearchBtn.style.display = 'none';
      }
      // 自动搜索（防抖）
      debouncedSearch();
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch();
      }
    });
    
    searchBtn.addEventListener('click', () => {
      this.performSearch();
    });
    
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      this.searchQuery = '';
      clearSearchBtn.style.display = 'none';
      this.performSearch();
    });
    
    // 快捷键 ⌘F
    document.addEventListener('keydown', (e) => {
      if (document.activeElement === searchInput) return;
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // 执行搜索
  performSearch() {
    if (this.app) {
      this.app.performSearch();
    }
  }

  // 获取当前搜索关键词
  getQuery() {
    return this.searchQuery;
  }

  // 高亮关键词
  highlightText(text) {
    if (!this.searchQuery) return this.escapeHtml(text);
    
    const escapedText = this.escapeHtml(text);
    const escapedQuery = this.escapeHtml(this.searchQuery);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // HTML 转义
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
