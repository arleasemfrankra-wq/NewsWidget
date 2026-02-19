const path = require('path');
const fs = require('fs');

// 复用 morning-briefing 的数据源
const sourcesPath = path.join(__dirname, '../../morning-briefing/sources');

async function fetchNews() {
  try {
    const results = {
      weather: null,
      reminders: [],
      holidays: [],
      rates: null,
      quote: null,
      news: {
        '热点': [],
        '科技': [],
        '财经': [],
        '西班牙': [],
        '国际': []
      }
    };

    // 检查数据源目录是否存在
    if (!fs.existsSync(sourcesPath)) {
      throw new Error('数据源目录不存在，请先运行 morning-briefing');
    }

    // 加载天气
    try {
      const weatherModule = await import(path.join(sourcesPath, 'weather.js'));
      results.weather = await weatherModule.default();
    } catch (err) {
      console.error('天气加载失败:', err.message);
    }

    // 加载提醒
    try {
      const remindersModule = await import(path.join(sourcesPath, 'reminders.js'));
      results.reminders = await remindersModule.default();
    } catch (err) {
      console.error('提醒加载失败:', err.message);
    }

    // 加载增强信息（节假日、汇率、每日一言）
    try {
      const enhancedModule = await import(path.join(sourcesPath, 'enhanced-info.js'));
      const enhanced = await enhancedModule.default({
        includeHolidays: true,
        includeRates: true,
        includeQuote: true,
        countryCode: 'ES', // 西班牙节假日
        baseCurrency: 'EUR' // 欧元汇率
      });
      
      if (enhanced.holidays) results.holidays = enhanced.holidays;
      if (enhanced.rates) results.rates = enhanced.rates;
      if (enhanced.quote) results.quote = enhanced.quote;
    } catch (err) {
      console.error('增强信息加载失败:', err.message);
    }

    // 加载新闻数据源（带来源标记）
    const sources = [
      { file: 'weibo.js', category: '热点', source: '微博' },
      { file: 'zhihu.js', category: '热点', source: '知乎' },
      { file: 'baidu.js', category: '热点', source: '百度' },
      { file: 'bilibili.js', category: '热点', source: 'B站' },
      { file: 'douyin.js', category: '热点', source: '抖音' },
      { file: 'hupu.js', category: '热点', source: '虎扑' },
      { file: 'ithome.js', category: '科技', source: 'IT之家' },
      { file: '36kr.js', category: '科技', source: '36氪' },
      { file: 'juejin.js', category: '科技', source: '掘金' },
      { file: 'github.js', category: '科技', source: 'GitHub' },
      { file: 'sina-finance.js', category: '财经', source: '新浪财经' },
      { file: 'elpais.js', category: '西班牙', source: 'El País' },
      { file: 'bbc.js', category: '国际', source: 'BBC' }
    ];

    // 并发加载所有数据源
    const promises = sources.map(async ({ file, category, source }) => {
      try {
        const modulePath = path.join(sourcesPath, file);
        if (!fs.existsSync(modulePath)) {
          console.warn(`数据源不存在: ${file}`);
          return;
        }
        
        const module = await import(modulePath);
        const items = await module.default();
        
        if (items && items.length > 0) {
          // 给每个新闻项添加 source 标记
          const itemsWithSource = items.map(item => ({
            ...item,
            source: item.source || source
          }));
          results.news[category].push(...itemsWithSource);
        }
      } catch (err) {
        console.error(`${file} 加载失败:`, err.message);
      }
    });

    await Promise.all(promises);

    // 限制每个分类的新闻数量
    for (const category in results.news) {
      results.news[category] = results.news[category].slice(0, 20);
    }

    return results;

  } catch (error) {
    console.error('获取新闻失败:', error);
    throw error;
  }
}

module.exports = fetchNews;
