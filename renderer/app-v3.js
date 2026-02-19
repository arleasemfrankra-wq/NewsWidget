let countdownTimer;
let countdownSeconds = 600; // 10分钟
let isLoading = false;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadNews();
  startCountdown();
  
  // 刷新按钮
  document.getElementById('refreshBtn').addEventListener('click', () => {
    if (!isLoading) {
      loadNews();
      resetCountdown();
    }
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
});

// 加载新闻
async function loadNews() {
  if (isLoading) return;
  
  const container = document.getElementById('newsContainer');
  const updateTime = document.getElementById('updateTime');
  const refreshBtn = document.getElementById('refreshBtn');
  
  isLoading = true;
  refreshBtn.classList.add('loading');
  refreshBtn.textContent = '加载中';
  
  try {
    // 显示骨架屏
    container.innerHTML = `
      <div class="skeleton-container">
        <div class="skeleton-category">
          <div class="skeleton-title"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
        </div>
        <div class="skeleton-category">
          <div class="skeleton-title"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
        </div>
        <div class="skeleton-category">
          <div class="skeleton-title"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
        </div>
      </div>
    `;
    
    // 获取数据
    const response = await fetch('/api/news');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    
    // 更新时间
    const now = new Date();
    updateTime.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 渲染天气
    renderWeather(data.weather);
    
    // 渲染提醒
    renderReminders(data.reminders);
    
    // 渲染新闻
    renderNews(data.news);
    
    // 显示成功提示
    showToast('✓ 刷新成功', 'success');
    
  } catch (error) {
    console.error('加载失败:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <p>加载失败</p>
        <p>${error.message}</p>
      </div>
    `;
    showToast('✗ 加载失败', 'error');
  } finally {
    isLoading = false;
    refreshBtn.classList.remove('loading');
    refreshBtn.textContent = '刷新';
  }
}

// 渲染天气
function renderWeather(weather) {
  const weatherEl = document.getElementById('weather');
  if (!weather) {
    weatherEl.innerHTML = '<span class="loading">天气加载失败</span>';
    return;
  }
  
  weatherEl.innerHTML = `
    <span class="weather-icon">🌤️</span>
    <span style="font-weight: 600;">${weather.location}</span>
    <span>${weather.temp}°C</span>
    <span style="color: #86868b;">·</span>
    <span style="color: #86868b;">${weather.condition}</span>
  `;
}

// 渲染提醒
function renderReminders(reminders) {
  const remindersEl = document.getElementById('reminders');
  if (!reminders || reminders.length === 0) {
    remindersEl.innerHTML = `
      <span class="reminder-icon">📋</span>
      <span style="font-weight: 600;">暂无待办</span>
    `;
    return;
  }
  
  const urgent = reminders.filter(r => r.urgent).length;
  remindersEl.innerHTML = `
    <span class="reminder-icon">📋</span>
    <span style="font-weight: 600;">${reminders.length} 个待办</span>
    ${urgent > 0 ? `<span style="color: #ff3b30; font-weight: 700;">⚠️ ${urgent} 紧急</span>` : ''}
  `;
}

// 渲染新闻
function renderNews(newsData) {
  const container = document.getElementById('newsContainer');
  
  if (!newsData || Object.keys(newsData).length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📰</div>
        <p>暂无新闻</p>
        <p>请稍后再试</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  // 分类配置
  const categoryConfig = {
    '热点': { class: 'hot', icon: '🔥' },
    '科技': { class: 'tech', icon: '💻' },
    '财经': { class: 'finance', icon: '💹' },
    '西班牙': { class: 'spain', icon: '🇪🇸' },
    '国际': { class: 'world', icon: '🌍' }
  };
  
  // 渲染每个分类
  for (const [category, items] of Object.entries(newsData)) {
    if (!items || items.length === 0) continue;
    
    const config = categoryConfig[category] || { class: 'default', icon: '📰' };
    
    html += `
      <div class="news-category">
        <div class="category-header">
          <span class="category-label ${config.class}">${config.icon} ${category}</span>
          <span class="category-count">${items.length}</span>
        </div>
    `;
    
    items.forEach((item, index) => {
      const relativeTime = getRelativeTime(item.time);
      
      html += `
        <div class="news-item" onclick="openLink('${item.url}')" style="animation-delay: ${index * 0.03}s">
          <div class="news-header">
            <span class="news-source">${escapeHtml(item.source)}</span>
            <span class="news-time">${relativeTime}</span>
          </div>
          <div class="news-title">${escapeHtml(item.title)}</div>
        </div>
      `;
    });
    
    html += '</div>';
  }
  
  container.innerHTML = html;
}

// 相对时间转换
function getRelativeTime(timeStr) {
  if (!timeStr) return '';
  
  // 如果已经是相对时间格式，直接返回
  if (timeStr.includes('分钟前') || timeStr.includes('小时前') || timeStr.includes('天前')) {
    return timeStr;
  }
  
  // 尝试解析时间
  try {
    const now = new Date();
    let time;
    
    // 处理 "HH:MM" 格式
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      time = new Date();
      time.setHours(hours, minutes, 0, 0);
      
      // 如果时间在未来，说明是昨天的
      if (time > now) {
        time.setDate(time.getDate() - 1);
      }
    } else {
      time = new Date(timeStr);
    }
    
    const diff = Math.floor((now - time) / 1000); // 秒
    
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
    
    return timeStr;
  } catch (e) {
    return timeStr;
  }
}

// 打开链接
function openLink(url) {
  window.open(url, '_blank');
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
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // 3秒后移除
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 添加滑出动画
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
