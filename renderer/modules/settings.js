// 设置模块
export class SettingsModule {
  constructor() {
    this.refreshInterval = parseInt(localStorage.getItem('refreshInterval') || '600');
    this.autostartEnabled = localStorage.getItem('autostartEnabled') === 'true';
    this.app = null;
  }

  // 初始化设置
  init(app) {
    this.app = app;
    
    // 刷新间隔
    const refreshIntervalSelect = document.getElementById('refreshInterval');
    if (refreshIntervalSelect) {
      refreshIntervalSelect.value = this.refreshInterval;
      refreshIntervalSelect.addEventListener('change', (e) => {
        const interval = parseInt(e.target.value);
        this.setRefreshInterval(interval);
        if (this.app) {
          this.app.countdownSeconds = interval;
          this.app.resetCountdown();
        }
        this.showToast('刷新间隔已更新', 'success');
      });
    }
    
    // 开机自启动
    const autostartToggle = document.getElementById('autostartToggle');
    if (autostartToggle) {
      autostartToggle.checked = this.autostartEnabled;
      autostartToggle.addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        try {
          await this.setAutostart(enabled);
          this.showToast(enabled ? '✅ 开机自启动已启用' : '✅ 开机自启动已取消', 'success');
        } catch (error) {
          this.showToast('❌ 设置失败: ' + error.message, 'error');
        }
      });
    }
    
    // 导出收藏
    const exportFavBtn = document.getElementById('exportFavBtn');
    if (exportFavBtn) {
      exportFavBtn.addEventListener('click', () => {
        if (this.app && this.app.favorites) {
          const count = this.app.favorites.getCount();
          if (count === 0) {
            this.showToast('没有收藏可以导出', 'error');
            return;
          }
          this.app.favorites.export();
          this.showToast(`已导出 ${count} 条收藏`, 'success');
        }
      });
    }
    
    // 清除数据
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => {
        if (!confirm('确定要清除所有收藏和浏览记录吗？此操作不可恢复！')) {
          return;
        }
        
        if (this.app) {
          if (this.app.favorites) {
            this.app.favorites.clear();
          }
          if (this.app.stats) {
            this.app.stats.viewStats = {};
            localStorage.removeItem('viewStats');
          }
          this.showToast('数据已清除', 'success');
        }
      });
    }
  }

  // 设置刷新间隔
  setRefreshInterval(interval) {
    this.refreshInterval = interval;
    localStorage.setItem('refreshInterval', interval);
    return interval;
  }

  // 获取刷新间隔
  getRefreshInterval() {
    return this.refreshInterval;
  }

  // 设置开机自启动
  async setAutostart(enabled) {
    const action = enabled ? 'enable' : 'disable';
    
    try {
      const response = await fetch(`/api/autostart?action=${action}`);
      const result = await response.json();
      
      if (result.success) {
        this.autostartEnabled = enabled;
        localStorage.setItem('autostartEnabled', enabled);
        return { success: true, enabled };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('设置自启动失败:', error);
      // 恢复开关状态
      const autostartToggle = document.getElementById('autostartToggle');
      if (autostartToggle) {
        autostartToggle.checked = !enabled;
      }
      throw error;
    }
  }

  // 获取自启动状态
  getAutostartEnabled() {
    return this.autostartEnabled;
  }

  // Toast 提示
  showToast(message, type = 'info') {
    if (this.app && this.app.utils) {
      this.app.utils.showToast(message, type);
    }
  }
}
