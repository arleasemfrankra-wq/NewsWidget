import WidgetKit
import SwiftUI

// 新闻数据模型
struct NewsItem: Codable, Identifiable {
    let id = UUID()
    let title: String
    let source: String
    let time: String?
    let url: String
}

struct NewsData: Codable {
    let weather: WeatherData?
    let news: [String: [NewsItem]]
}

struct WeatherData: Codable {
    let location: String
    let temp: String
    let condition: String
}

// Timeline Entry
struct NewsEntry: TimelineEntry {
    let date: Date
    let news: [NewsItem]
    let weather: WeatherData?
}

// Timeline Provider
struct NewsProvider: TimelineProvider {
    func placeholder(in context: Context) -> NewsEntry {
        NewsEntry(date: Date(), news: [], weather: nil)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (NewsEntry) -> Void) {
        let entry = NewsEntry(date: Date(), news: [], weather: nil)
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<NewsEntry>) -> Void) {
        // 获取新闻数据
        fetchNews { newsData in
            let currentDate = Date()
            let entry = NewsEntry(
                date: currentDate,
                news: Array(newsData.news.values.flatMap { $0 }.prefix(10)),
                weather: newsData.weather
            )
            
            // 10分钟后刷新
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 10, to: currentDate)!
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            completion(timeline)
        }
    }
    
    func fetchNews(completion: @escaping (NewsData) -> Void) {
        guard let url = URL(string: "http://localhost:3000/api/news") else {
            completion(NewsData(weather: nil, news: [:]))
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            guard let data = data,
                  let newsData = try? JSONDecoder().decode(NewsData.self, from: data) else {
                completion(NewsData(weather: nil, news: [:]))
                return
            }
            completion(newsData)
        }.resume()
    }
}

// Widget View
struct NewsWidgetView: View {
    var entry: NewsEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        ZStack {
            // 毛玻璃背景
            Color.clear
                .background(.ultraThinMaterial)
            
            VStack(alignment: .leading, spacing: 8) {
                // 标题
                HStack {
                    Text("📰 新闻")
                        .font(.headline)
                        .fontWeight(.bold)
                    Spacer()
                    Text(entry.date, style: .time)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .padding(.bottom, 4)
                
                // 天气
                if let weather = entry.weather {
                    HStack {
                        Text("🌤️ \(weather.location)")
                        Text("\(weather.temp)°C")
                            .fontWeight(.semibold)
                        Text(weather.condition)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .font(.caption)
                    .padding(.vertical, 4)
                    .padding(.horizontal, 8)
                    .background(Color.secondary.opacity(0.1))
                    .cornerRadius(8)
                }
                
                Divider()
                
                // 新闻列表
                if entry.news.isEmpty {
                    Text("加载中...")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ForEach(entry.news.prefix(family == .systemLarge ? 8 : 5)) { item in
                        Link(destination: URL(string: item.url)!) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(item.title)
                                    .font(.caption)
                                    .lineLimit(2)
                                    .foregroundColor(.primary)
                                
                                HStack {
                                    Text(item.source)
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                    if let time = item.time {
                                        Text("·")
                                            .foregroundColor(.secondary)
                                        Text(time)
                                            .font(.caption2)
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }
                            .padding(.vertical, 4)
                        }
                        
                        if item.id != entry.news.last?.id {
                            Divider()
                        }
                    }
                }
                
                Spacer()
            }
            .padding()
        }
    }
}

// Widget Configuration
@main
struct NewsWidget: Widget {
    let kind: String = "NewsWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NewsProvider()) { entry in
            NewsWidgetView(entry: entry)
        }
        .configurationDisplayName("NewsWidget")
        .description("实时显示热门新闻和天气信息")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// Preview
struct NewsWidget_Previews: PreviewProvider {
    static var previews: some View {
        NewsWidgetView(entry: NewsEntry(
            date: Date(),
            news: [
                NewsItem(title: "示例新闻标题", source: "新闻来源", time: "10分钟前", url: "https://example.com")
            ],
            weather: WeatherData(location: "马德里", temp: "18", condition: "晴")
        ))
        .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
}
