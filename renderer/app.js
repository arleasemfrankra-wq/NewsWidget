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
  refreshBtn.textContent = '加载中...';
  
  try {
    // 显示加载状态
    container.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>正在加载新闻...</p>
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
    showToast('✅ 刷新成功', 'success');
    
  } catch (error) {
    console.error('加载失败:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <p>加载失败</p>
        <p>${error.message}</p>
      </div>
    `;
    showToast('❌ 加载失败', 'error');
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
    <div class="weather-details">
      <div class="weather-main">${weather.location} ${weather.temp}°C</div>
      <div class="weather-sub">${weather.condition} · 湿度 ${weather.humidity}% · ${weather.wind}</div>
    </div>
  `;
}

// 渲染提醒
function renderReminders(reminders) {
  const remindersEl = document.getElementById('reminders');
  if (!reminders || reminders.length === 0) {
    remindersEl.innerHTML = `
      <span class="reminder-icon">📋</span>
      <div class="reminder-details">
        <div class="weather-main">暂无待办</div>
      </div>
    `;
    return;
  }
  
  const urgent = reminders.filter(r => r.urgent).length;
  const urgentText = urgent > 0 
    ? `<span class="reminder-urgent">⚠️ ${urgent} 个紧急</span>` 
    : '';
  
  remindersEl.innerHTML = `
    <span class="reminder-icon">📋</span>
    <div class="reminder-details">
      <div class="weather-main">
        <span class="reminder-count">${reminders.length}</span> 个待办
        ${urgentText}
      </div>
    </div>
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
  
  // 分类图标映射
  const categoryIcons = {
    '热点': '🔥',
    '科技': '💻',
    '财经': '💹',
    '西班牙': '🇪🇸',
    '国际': '🌍'
  };
  
  // 渲染每个分类
  for (const [category, items] of Object.entries(newsData)) {
    if (!items || items.length === 0) continue;
    
    const icon = categoryIcons[category] || '📰';
    html += `
      <div class="news-category">
        <div class="category-title">
          <span class="category-icon">${icon}</span>
          <span>${category}</span>
          <span class="category-count">${items.length}</span>
        </div>
    `;
    
    items.forEach((item, index) => {
      html += `
        <div class="news-item" onclick="openLink('${item.url}')" style="animation-delay: ${index * 0.05}s">
          <div class="news-title">${escapeHtml(item.title)}</div>
          <div class="news-meta">
            <span class="news-source">📰 ${escapeHtml(item.source)}</span>
            ${item.time ? `<span class="news-time">🕐 ${escapeHtml(item.time)}</span>` : ''}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
  }
  
  container.innerHTML = html;
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
  
  // 添加样式
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    background: type === 'success' ? 'rgba(52, 199, 89, 0.95)' : 'rgba(255, 59, 48, 0.95)',
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    zIndex: '10000',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(10px)',
    animation: 'slideDown 0.3s ease-out'
  });
  
  document.body.appendChild(toast);
  
  // 3秒后移除
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
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
