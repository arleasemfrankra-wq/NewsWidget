// 收藏模块
export class FavoritesModule {
  constructor() {
    this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  }

  // 生成新闻ID
  generateNewsId(item) {
    const base = `${item.source}_${item.title}_${item.url || ''}`;
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
      const char = base.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `news_${Math.abs(hash).toString(36)}`;
  }

  // 切换收藏
  toggle(newsId, newsItem) {
    const index = this.favorites.findIndex(fav => fav.id === newsId);
    
    if (index > -1) {
      // 取消收藏
      this.favorites.splice(index, 1);
      this.save();
      return { added: false, message: '已取消收藏' };
    } else {
      // 添加收藏
      if (newsItem) {
        this.favorites.push({
          id: newsId,
          ...newsItem,
          favTime: new Date().toISOString()
        });
        this.save();
        return { added: true, message: '已添加到收藏' };
      }
      return { added: false, message: '新闻不存在' };
    }
  }

  // 检查是否已收藏
  isFavorited(newsId) {
    return this.favorites.some(fav => fav.id === newsId);
  }

  // 获取所有收藏
  getAll() {
    return [...this.favorites];
  }

  // 获取收藏数量
  getCount() {
    return this.favorites.length;
  }

  // 更新徽章
  updateBadge() {
    const badge = document.getElementById('favBadge');
    if (badge) {
      badge.textContent = this.favorites.length;
    }
  }

  // 导出收藏
  export() {
    const data = JSON.stringify(this.favorites, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `favorites-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return this.favorites.length;
  }

  // 清除所有收藏
  clear() {
    this.favorites = [];
    this.save();
  }

  // 保存到 localStorage
  save() {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
    this.updateBadge();
  }
}
