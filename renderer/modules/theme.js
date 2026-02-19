// 主题模块
export class ThemeModule {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
  }

  // 初始化主题
  init() {
    this.applyTheme(this.currentTheme);
    
    // 监听主题选择变化
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      themeSelect.value = this.currentTheme;
      themeSelect.addEventListener('change', (e) => {
        this.setTheme(e.target.value);
      });
    }
  }

  // 设置主题
  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
    
    // 触发主题变化事件
    const event = new CustomEvent('themeChanged', { 
      detail: { theme } 
    });
    document.dispatchEvent(event);
    
    return theme;
  }

  // 应用主题
  applyTheme(theme) {
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

  // 获取当前主题
  getCurrentTheme() {
    return this.currentTheme;
  }

  // 获取实际应用的主题（考虑 auto 模式）
  getAppliedTheme() {
    if (this.currentTheme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.currentTheme;
  }
}
