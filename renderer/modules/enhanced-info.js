// 增强信息模块 - v11.0
// 显示天气、汇率、每日一言、节假日信息卡片

export function initEnhancedInfo() {
  console.log('📊 初始化增强信息模块...');
  
  // 绑定刷新按钮
  const refreshWeatherBtn = document.getElementById('refreshWeather');
  const refreshQuoteBtn = document.getElementById('refreshQuote');
  const countrySelect = document.getElementById('countrySelect');
  const weatherLocation = document.getElementById('weatherLocation');
  
  if (refreshWeatherBtn) {
    refreshWeatherBtn.addEventListener('click', () => {
      const location = weatherLocation.value.trim() || 'Beijing';
      loadWeather(location);
    });
  }
  
  if (weatherLocation) {
    weatherLocation.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const location = weatherLocation.value.trim() || 'Beijing';
        loadWeather(location);
      }
    });
  }
  
  if (refreshQuoteBtn) {
    refreshQuoteBtn.addEventListener('click', () => {
      loadQuote();
    });
  }
  
  if (countrySelect) {
    countrySelect.addEventListener('change', (e) => {
      loadHolidays(e.target.value);
    });
  }
}

export function updateEnhancedInfo(data) {
  if (!data) return;
  
  const { rates, quote, holidays } = data;
  
  // 更新时间
  const now = new Date();
  const timeEl = document.getElementById('infoTime');
  if (timeEl) {
    timeEl.textContent = `更新时间: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // 加载天气（使用保存的位置或默认北京）
  const savedLocation = localStorage.getItem('weatherLocation') || 'Beijing';
  document.getElementById('weatherLocation').value = savedLocation;
  loadWeather(savedLocation);
  
  // 更新汇率转换器
  updateRatesConverter(rates);
  
  // 加载每日一言（使用中文API）
  loadQuote();
  
  // 加载节假日（默认中国）
  const savedCountry = localStorage.getItem('holidayCountry') || 'CN';
  document.getElementById('countrySelect').value = savedCountry;
  loadHolidays(savedCountry);
  
  console.log('✅ 增强信息已更新');
}

// 天气预报
async function loadWeather(location) {
  const container = document.getElementById('weatherContent');
  if (!container) return;
  
  container.innerHTML = '<div class="loading-text">加载天气中...</div>';
  
  try {
    // 保存位置
    localStorage.setItem('weatherLocation', location);
    
    // 使用 wttr.in API（免费，无需注册）
    const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
    const data = await response.json();
    
    const current = data.current_condition[0];
    const forecasts = data.weather || [];
    
    // 天气图标映射
    const weatherIcons = {
      '113': '☀️', '116': '⛅', '119': '☁️', '122': '☁️', '143': '🌫️',
      '176': '🌦️', '179': '🌨️', '182': '🌨️', '185': '🌨️', '200': '⛈️',
      '227': '🌨️', '230': '❄️', '248': '🌫️', '260': '🌫️', '263': '🌦️',
      '266': '🌧️', '281': '🌨️', '284': '🌨️', '293': '🌦️', '296': '🌧️',
      '299': '🌧️', '302': '🌧️', '305': '🌧️', '308': '🌧️', '311': '🌨️',
      '314': '🌨️', '317': '🌨️', '320': '🌨️', '323': '🌨️', '326': '🌨️',
      '329': '❄️', '332': '❄️', '335': '❄️', '338': '❄️', '350': '🌨️',
      '353': '🌦️', '356': '🌧️', '359': '🌧️', '362': '🌨️', '365': '🌨️',
      '368': '🌨️', '371': '❄️', '374': '🌨️', '377': '🌨️', '386': '⛈️',
      '389': '⛈️', '392': '⛈️', '395': '❄️'
    };
    
    const getWeatherIcon = (code) => weatherIcons[code] || '🌤️';
    
    const html = `
      <div class="weather-current">
        <div class="weather-main">
          <div class="weather-icon">${getWeatherIcon(current.weatherCode)}</div>
          <div class="weather-temp">${current.temp_C}°C</div>
        </div>
        <div class="weather-desc">${current.lang_zh_cn?.[0]?.value || current.weatherDesc[0].value}</div>
        <div class="weather-feels">体感温度: ${current.FeelsLikeC}°C</div>
      </div>
      
      <div class="weather-details">
        <div class="weather-detail-item">
          <span class="detail-label">湿度</span>
          <span class="detail-value">${current.humidity}%</span>
        </div>
        <div class="weather-detail-item">
          <span class="detail-label">风速</span>
          <span class="detail-value">${current.windspeedKmph} km/h</span>
        </div>
        <div class="weather-detail-item">
          <span class="detail-label">紫外线</span>
          <span class="detail-value">${current.uvIndex}</span>
        </div>
      </div>
      
      <div class="weather-forecast">
        <h4>未来天气</h4>
        <div class="forecast-list">
          ${forecasts.map((day, index) => {
            const date = new Date(day.date);
            const dayLabel = index === 0 ? '今天' : 
                           index === 1 ? '明天' : 
                           index === 2 ? '后天' : 
                           `${date.getMonth() + 1}/${date.getDate()}`;
            
            return `
              <div class="forecast-item">
                <div class="forecast-day">${dayLabel}</div>
                <div class="forecast-icon">${getWeatherIcon(day.hourly[4].weatherCode)}</div>
                <div class="forecast-temp">${day.mintempC}° ~ ${day.maxtempC}°</div>
                <div class="forecast-desc">${day.hourly[4].lang_zh_cn?.[0]?.value || day.hourly[4].weatherDesc[0].value}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  } catch (error) {
    console.error('天气加载失败:', error);
    container.innerHTML = '<div class="empty-text">天气加载失败，请检查城市名称</div>';
  }
}

// 汇率转换器
function updateRatesConverter(rates) {
  const container = document.getElementById('ratesContent');
  if (!container) return;
  
  if (!rates || !rates.rates || rates.rates.length === 0) {
    container.innerHTML = '<div class="empty-text">暂无汇率数据</div>';
    return;
  }
  
  // 创建汇率转换器
  const currencies = ['EUR', 'CNY', 'USD', 'GBP', 'JPY'];
  const ratesMap = {};
  
  // 构建汇率映射
  rates.rates.forEach(rate => {
    ratesMap[rate.to] = parseFloat(rate.rate);
  });
  ratesMap['EUR'] = 1; // 基准货币
  
  const html = `
    <div class="rate-converter">
      <div class="converter-row">
        <input type="number" id="amount1" class="amount-input" value="1" min="0" step="0.01">
        <select id="currency1" class="currency-select">
          ${currencies.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="converter-arrow">⇅</div>
      <div class="converter-row">
        <input type="number" id="amount2" class="amount-input" value="${ratesMap['CNY'].toFixed(2)}" readonly>
        <select id="currency2" class="currency-select">
          ${currencies.map(c => `<option value="${c}" ${c === 'CNY' ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="rate-info">汇率更新: ${rates.date}</div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // 绑定转换事件
  const amount1 = document.getElementById('amount1');
  const amount2 = document.getElementById('amount2');
  const currency1 = document.getElementById('currency1');
  const currency2 = document.getElementById('currency2');
  
  const convert = () => {
    const from = currency1.value;
    const to = currency2.value;
    const value = parseFloat(amount1.value) || 0;
    
    // 转换逻辑：先转成EUR，再转成目标货币
    const inEUR = value / ratesMap[from];
    const result = inEUR * ratesMap[to];
    
    amount2.value = result.toFixed(2);
  };
  
  amount1.addEventListener('input', convert);
  currency1.addEventListener('change', convert);
  currency2.addEventListener('change', convert);
}

// 每日一言（中文）
async function loadQuote() {
  const container = document.getElementById('quoteContent');
  if (!container) return;
  
  container.innerHTML = '<div class="loading-text">加载中...</div>';
  
  try {
    const response = await fetch('https://v1.hitokoto.cn/?c=a&c=b&c=d&c=i');
    const data = await response.json();
    
    const html = `
      <div class="quote-box">
        <div class="quote-text">"${data.hitokoto}"</div>
        <div class="quote-author">— ${data.from || '佚名'}</div>
        ${data.from_who ? `<div class="quote-source">${data.from_who}</div>` : ''}
      </div>
    `;
    
    container.innerHTML = html;
  } catch (error) {
    console.error('每日一言加载失败:', error);
    container.innerHTML = '<div class="empty-text">加载失败</div>';
  }
}

// 节假日查询
async function loadHolidays(countryCode) {
  const container = document.getElementById('holidayContent');
  if (!container) return;
  
  container.innerHTML = '<div class="loading-text">加载中...</div>';
  
  // 保存选择
  localStorage.setItem('holidayCountry', countryCode);
  
  try {
    const year = new Date().getFullYear();
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    const holidays = await response.json();
    
    // 过滤前后一个月的节假日
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);
    const oneMonthLater = new Date(today);
    oneMonthLater.setDate(today.getDate() + 30);
    
    const filtered = holidays.filter(h => {
      const date = new Date(h.date);
      return date >= oneMonthAgo && date <= oneMonthLater;
    });
    
    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-text">前后一个月无节假日</div>';
      return;
    }
    
    // 翻译节假日名称
    const translateHoliday = (name) => {
      const translations = {
        // 中国节假日
        "New Year's Day": "元旦（3天假期）",
        "Chinese New Year": "春节（7天假期）",
        "Spring Festival": "春节（7天假期）",
        "Tomb-Sweeping Day": "清明节（3天假期）",
        "Qingming Festival": "清明节（3天假期）",
        "Labour Day": "劳动节（5天假期）",
        "Labor Day": "劳动节（5天假期）",
        "Dragon Boat Festival": "端午节（3天假期）",
        "Mid-Autumn Festival": "中秋节（3天假期）",
        "National Day": "国庆节（7天假期）",
        
        // 西方节假日
        "Christmas Day": "圣诞节",
        "Christmas Eve": "平安夜",
        "Good Friday": "耶稣受难日",
        "Easter": "复活节",
        "Easter Monday": "复活节星期一",
        "Easter Sunday": "复活节星期日",
        "Epiphany": "主显节",
        "Assumption of Mary": "圣母升天节",
        "All Saints' Day": "万圣节",
        "Immaculate Conception": "圣母无染原罪节",
        
        // 美国节假日
        "Independence Day": "独立日",
        "Thanksgiving": "感恩节",
        "Thanksgiving Day": "感恩节",
        "Memorial Day": "阵亡将士纪念日",
        "Veterans Day": "退伍军人节",
        "Martin Luther King Jr. Day": "马丁·路德·金纪念日",
        "Presidents' Day": "总统日",
        "Columbus Day": "哥伦布日",
        
        // 英国节假日
        "Queen's Birthday": "女王生日",
        "King's Birthday": "国王生日",
        "Boxing Day": "节礼日",
        "May Day": "五月节",
        "Spring Bank Holiday": "春季银行假日",
        "Summer Bank Holiday": "夏季银行假日",
        "Early May Bank Holiday": "五月初银行假日",
        
        // 法国节假日
        "Bastille Day": "巴士底日",
        "Armistice Day": "停战纪念日",
        "Victory in Europe Day": "欧洲胜利日",
        "Whit Monday": "圣灵降临节星期一",
        "Ascension Day": "耶稣升天节",
        
        // 德国节假日
        "German Unity Day": "德国统一日",
        "Day of German Unity": "德国统一日",
        "Reformation Day": "宗教改革日",
        "Corpus Christi": "圣体节",
        
        // 日本节假日
        "New Year": "元旦",
        "Coming of Age Day": "成人节",
        "National Foundation Day": "建国纪念日",
        "Vernal Equinox Day": "春分日",
        "Showa Day": "昭和日",
        "Constitution Memorial Day": "宪法纪念日",
        "Greenery Day": "绿之日",
        "Children's Day": "儿童节",
        "Marine Day": "海之日",
        "Mountain Day": "山之日",
        "Respect for the Aged Day": "敬老日",
        "Autumnal Equinox Day": "秋分日",
        "Health and Sports Day": "体育日",
        "Culture Day": "文化日",
        "Labor Thanksgiving Day": "勤劳感谢日",
        "Emperor's Birthday": "天皇诞辰",
        
        // 韩国节假日
        "Seollal": "春节",
        "Independence Movement Day": "三一节",
        "Buddha's Birthday": "佛诞日",
        "Children's Day": "儿童节",
        "Memorial Day": "显忠日",
        "Liberation Day": "光复节",
        "Chuseok": "中秋节",
        "National Foundation Day": "开天节",
        "Hangeul Day": "韩文日"
      };
      return translations[name] || name;
    };
    
    const html = `
      <div class="holiday-list">
        ${filtered.map(holiday => {
          const date = new Date(holiday.date);
          const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24));
          const isToday = diffDays === 0;
          const isPast = diffDays < 0;
          const isFuture = diffDays > 0;
          
          const daysText = isToday ? '今天' :
                          isPast ? `${Math.abs(diffDays)}天前` :
                          `${diffDays}天后`;
          
          const className = isToday ? 'holiday-item today' :
                           isPast ? 'holiday-item past' :
                           'holiday-item future';
          
          // 优先使用 localName，如果没有再翻译
          const displayName = holiday.localName || translateHoliday(holiday.name);
          
          // 格式化日期：2月17日
          const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
          
          return `
            <div class="${className}">
              <div class="holiday-info">
                <div class="holiday-name">${displayName}</div>
                <div class="holiday-date">${dateStr}</div>
              </div>
              <div class="holiday-countdown">${daysText}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    container.innerHTML = html;
  } catch (error) {
    console.error('节假日加载失败:', error);
    container.innerHTML = '<div class="empty-text">加载失败</div>';
  }
}

// 导出
export default {
  init: initEnhancedInfo,
  update: updateEnhancedInfo
};
