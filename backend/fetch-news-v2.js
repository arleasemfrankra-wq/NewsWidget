const https = require('https');

// 使用免费聚合 API: https://github.com/orz-ai/hot_news
const API_BASE = 'https://orz.ai/api/v1/dailynews';

// 获取增强信息（节假日、汇率、每日一言）
async function fetchEnhancedInfo() {
  const results = {
    holidays: [],
    rates: null,
    quote: null
  };
  
  try {
    // 获取节假日
    const today = new Date();
    const year = today.getFullYear();
    const todayStr = today.toISOString().split('T')[0];
    
    const holidayData = await httpGet(`https://date.nager.at/api/v3/PublicHolidays/${year}/ES`, 5000);
    const upcoming = holidayData.filter(h => {
      const holidayDate = new Date(h.date);
      const diffDays = Math.floor((holidayDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });
    
    results.holidays = upcoming.map(h => ({
      date: h.date,
      name: h.localName || h.name,
      daysUntil: Math.floor((new Date(h.date) - today) / (1000 * 60 * 60 * 24)),
      isToday: h.date === todayStr
    }));
  } catch (err) {
    console.error('节假日获取失败:', err.message);
  }
  
  try {
    // 获取汇率
    const rateData = await httpGet('https://api.frankfurter.app/latest?from=EUR&to=USD,CNY,GBP,JPY', 5000);
    const rates = [];
    for (const [currency, rate] of Object.entries(rateData.rates)) {
      rates.push({
        from: 'EUR',
        to: currency,
        rate: rate.toFixed(4),
        display: `1 EUR = ${rate.toFixed(2)} ${currency}`
      });
    }
    results.rates = {
      base: 'EUR',
      date: rateData.date,
      rates
    };
  } catch (err) {
    console.error('汇率获取失败:', err.message);
  }
  
  try {
    // 获取每日一言
    const quoteData = await httpGet('https://api.adviceslip.com/advice', 3000);
    results.quote = {
      text: quoteData.slip.advice,
      author: 'Anonymous',
      source: 'AdviceSlip'
    };
  } catch (err) {
    console.error('每日一言获取失败:', err.message);
  }
  
  return results;
}

// 数据源配置
const SOURCES = [
  // 热点类
  { platform: 'zhihu', category: '热点', name: '知乎热榜', icon: '🔥' },
  { platform: 'weibo', category: '热点', name: '微博热搜', icon: '🔥' },
  { platform: 'baidu', category: '热点', name: '百度热搜', icon: '🔍' },
  { platform: 'bilibili', category: '热点', name: 'B站热门', icon: '📺' },
  { platform: 'douyin', category: '热点', name: '抖音热点', icon: '🎵' },
  { platform: 'hupu', category: '热点', name: '虎扑热帖', icon: '🏀' },
  { platform: 'tieba', category: '热点', name: '百度贴吧', icon: '💬' },
  
  // 科技类
  { platform: 'juejin', category: '科技', name: '掘金', icon: '⚡' },
  { platform: 'v2ex', category: '科技', name: 'V2EX', icon: '💻' },
  { platform: 'github', category: '科技', name: 'GitHub', icon: '⭐' },
  { platform: 'stackoverflow', category: '科技', name: 'Stack Overflow', icon: '📚' },
  { platform: 'hackernews', category: '科技', name: 'Hacker News', icon: '🔶' },
  { platform: 'shaoshupai', category: '科技', name: '少数派', icon: '🔧' },
  { platform: '36kr', category: '科技', name: '36氪', icon: '💼' },
  { platform: '52pojie', category: '科技', name: '吾爱破解', icon: '🔓' },
  
  // 财经类
  { platform: 'sina_finance', category: '财经', name: '新浪财经', icon: '💹' },
  { platform: 'eastmoney', category: '财经', name: '东方财富', icon: '💰' },
  { platform: 'xueqiu', category: '财经', name: '雪球', icon: '📈' },
  { platform: 'cls', category: '财经', name: '财联社', icon: '💼' },
  
  // 综合类
  { platform: 'jinritoutiao', category: '综合', name: '今日头条', icon: '📰' },
  { platform: 'tenxunwang', category: '综合', name: '腾讯网', icon: '🌐' },
  { platform: 'douban', category: '综合', name: '豆瓣', icon: '📖' }
];

// HTTP GET 请求封装（带超时控制）
function httpGet(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`解析失败: ${err.message}`));
        }
      });
    }).on('error', reject);
    
    // 设置超时
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

// 获取单个平台的数据（带超时和重试）
async function fetchPlatform(platform, category, name, icon, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = `${API_BASE}/?platform=${platform}`;
      const response = await httpGet(url, 8000); // 8秒超时
      
      if (response.status === '200' && response.data && response.data.length > 0) {
        // 转换数据格式，取前20条
        const items = response.data.slice(0, 20).map((item, index) => ({
          title: item.title,
          url: item.url,
          rank: index + 1,
          score: item.score || item.content || '',
          time: item.publish_time || '',
          source: name,
          icon: icon
        }));
        
        console.log(`✅ ${name}: ${items.length} 条`);
        return { category, items };
      }
      
      return null;
    } catch (err) {
      if (attempt < retries) {
        console.log(`⚠️  ${name} 第 ${attempt + 1} 次失败，重试中...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
      } else {
        console.error(`❌ ${name} 抓取失败: ${err.message}`);
        return null;
      }
    }
  }
  return null;
}

// 主函数
async function fetchNews() {
  console.log('开始抓取新闻...');
  const startTime = Date.now();
  
  const results = {
    news: {
      '热点': [],
      '科技': [],
      '财经': [],
      '综合': []
    },
    sources: {},
    failed: [], // 记录失败的数据源
    timestamp: new Date().toISOString(),
    holidays: [],
    rates: null,
    quote: null
  };
  
  // 并发抓取所有数据源 + 增强信息
  const promises = SOURCES.map(({ platform, category, name, icon }) => 
    fetchPlatform(platform, category, name, icon)
  );
  
  // 同时获取增强信息
  promises.push(fetchEnhancedInfo());
  
  const responses = await Promise.all(promises);
  
  // 提取增强信息（最后一个 promise）
  const enhancedInfo = responses.pop();
  if (enhancedInfo) {
    results.holidays = enhancedInfo.holidays || [];
    results.rates = enhancedInfo.rates || null;
    results.quote = enhancedInfo.quote || null;
  }
  
  // 整理数据
  responses.forEach((response, index) => {
    const source = SOURCES[index];
    
    if (response && response.items.length > 0) {
      const { category, items } = response;
      const sourceName = items[0].source;
      
      // 添加到分类
      results.news[category].push(...items);
      
      // 记录数据源
      if (!results.sources[category]) {
        results.sources[category] = [];
      }
      results.sources[category].push(sourceName);
    } else {
      // 记录失败的数据源
      results.failed.push(source.name);
    }
  });
  
  // 统计
  const totalItems = Object.values(results.news).reduce((sum, items) => sum + items.length, 0);
  const totalSources = Object.values(results.sources).reduce((sum, sources) => sum + sources.length, 0);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`✅ 抓取完成: ${totalSources}/${SOURCES.length} 个数据源, ${totalItems} 条新闻, 耗时 ${elapsed}s`);
  if (results.failed.length > 0) {
    console.log(`⚠️  失败的数据源: ${results.failed.join(', ')}`);
  }
  
  return results;
}

module.exports = fetchNews;
