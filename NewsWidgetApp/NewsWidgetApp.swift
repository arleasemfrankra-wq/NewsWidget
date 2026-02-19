import SwiftUI

@main
struct NewsWidgetApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "newspaper.fill")
                .font(.system(size: 60))
                .foregroundColor(.blue)
            
            Text("NewsWidget")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("请在桌面上添加小组件")
                .font(.body)
                .foregroundColor(.secondary)
            
            Divider()
                .padding()
            
            VStack(alignment: .leading, spacing: 12) {
                Text("使用方法：")
                    .font(.headline)
                
                HStack(alignment: .top) {
                    Text("1.")
                    Text("在桌面上右键，选择"编辑小组件"")
                }
                
                HStack(alignment: .top) {
                    Text("2.")
                    Text("点击左上角的 + 号")
                }
                
                HStack(alignment: .top) {
                    Text("3.")
                    Text("搜索"NewsWidget"")
                }
                
                HStack(alignment: .top) {
                    Text("4.")
                    Text("拖动到桌面上")
                }
            }
            .padding()
            .background(Color.secondary.opacity(0.1))
            .cornerRadius(12)
        }
        .padding(40)
        .frame(width: 500, height: 600)
    }
}
