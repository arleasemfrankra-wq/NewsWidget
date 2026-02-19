// 统计模块
export class StatsModule {
  constructor() {
    this.viewStats = JSON.parse(localStorage.getItem('viewStats') || '{}');
  }

  // 记录浏览
  recordView(newsId) {
    if (!this.viewStats[newsId]) {
      this.viewStats[newsId] = 0;
    }
    this.viewStats[newsId]++;
    localStorage.setItem('viewStats', JSON.stringify(this.viewStats));
  }

  // 获取总浏览量
  getTotalViews() {
    return Object.values(this.viewStats).reduce((sum, count) => sum + count, 0);
  }

  // 渲染统计页面
  renderStats(allSources, newsData, favoritesCount) {
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
    
    const totalViews = this.getTotalViews();
    const successCount = allSources.length;
    const failedCount = newsData && newsData.failed ? newsData.failed.length : 0;
    
    document.getElementById('totalNews').textContent = totalNews;
    document.getElementById('totalSources').textContent = `${successCount}/${successCount + failedCount}`;
    document.getElementById('totalFavorites').textContent = favoritesCount;
    document.getElementById('totalViews').textContent = totalViews;
    
    // 显示失败的数据源
    const statsHeader = document.querySelector('.stats-header');
    const existingWarning = statsHeader.querySelector('.stats-warning');
    if (existingWarning) existingWarning.remove();
    
    if (failedCount > 0 && newsData.failed) {
      const warning = document.createElement('div');
      warning.className = 'stats-warning';
      warning.innerHTML = `⚠️ ${failedCount} 个数据源加载失败: ${newsData.failed.join('、')}`;
      statsHeader.appendChild(warning);
    }
    
    // 渲染各个图表
    this.renderWordCloud(allSources);
    this.renderCategoryChart(categoryCount, totalNews);
    this.renderSourceChart(sourceCount);
  }

  // 渲染热词云图
  renderWordCloud(allSources) {
    const container = document.getElementById('wordCloud');
    
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
    
    const words = {};
    allSources.forEach(source => {
      source.items.forEach(item => {
        const title = item.title;
        const tokens = title.split(/[\s，。！？、；：""''（）《》【】\[\]]+/);
        tokens.forEach(token => {
          if (token.length < 2 || token.length > 15) return;
          
          if (/[\u4e00-\u9fa5]/.test(token)) {
            words[token] = (words[token] || 0) + 1;
          } else if (/^[a-zA-Z]+$/.test(token) && techTerms.has(token)) {
            words[token] = (words[token] || 0) + 1;
          }
        });
      });
    });
    
    const sortedWords = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);
    
    if (sortedWords.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">暂无热词数据</div>';
      return;
    }
    
    container.innerHTML = sortedWords.map(([word, count]) => {
      const size = 12 + Math.min(count * 2, 20);
      return `<span class="word-item" style="font-size: ${size}px">${this.escapeHtml(word)}</span>`;
    }).join('');
  }

  // 渲染分类图表
  renderCategoryChart(categoryCount, total) {
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
  renderSourceChart(sourceCount) {
    const container = document.getElementById('sourceChart');
    
    const sortedSources = Object.entries(sourceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    const maxCount = sortedSources[0]?.[1] || 1;
    
    // 需要从外部传入 sourceConfig
    const event = new CustomEvent('getSourceConfig');
    document.dispatchEvent(event);
    
    container.innerHTML = sortedSources.map(([source, count]) => {
      const percent = Math.round((count / maxCount) * 100);
      const icon = '📰'; // 默认图标
      
      return `
        <div class="source-bar">
          <div class="source-label">
            <span>${icon}</span>
            <span>${this.escapeHtml(source)}</span>
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

  // HTML 转义
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
