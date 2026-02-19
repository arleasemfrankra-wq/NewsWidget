# Development Guide

This guide will help you set up a development environment for NewsWidget.

---

## 🛠️ Prerequisites

### Required

- **macOS**: 10.15+ (for testing)
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Swift**: 5.0+ (comes with Xcode)
- **Git**: For version control

### Optional

- **Xcode**: For Swift compilation and debugging
- **VS Code**: Recommended code editor
- **Postman**: For API testing

---

## 📥 Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/NewsWidget.git
cd NewsWidget
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- `axios` - HTTP client
- `cheerio` - HTML parsing
- `express` - Web server

### 3. Start Development Server

```bash
node server.js
```

Server will start on `http://localhost:3000`

### 4. Run the App

**Option A: Use existing .app**
```bash
open NewsWidget.app
```

**Option B: Compile Swift manually**
```bash
swiftc -o NewsWidget widget-desktop.swift -framework Cocoa -framework WebKit
./NewsWidget
```

---

## 📁 Project Structure

```
NewsWidget/
├── renderer/                    # Frontend
│   ├── index-v10.html          # Main HTML (ES6 modules)
│   ├── app-v10.js              # Main app (293 lines)
│   ├── style-v9.css            # Styles
│   └── modules/                # ES6 modules
│       ├── search.js           # Search with debounce
│       ├── favorites.js        # Favorites management
│       ├── stats.js            # Statistics & charts
│       ├── theme.js            # Theme switching
│       ├── settings.js         # Settings panel
│       ├── utils.js            # Utility functions
│       └── enhanced-info.js    # Enhanced info (v11)
│
├── backend/                    # Backend
│   ├── fetch-news.js          # Original fetcher
│   └── fetch-news-v2.js       # 22 sources fetcher
│
├── Swift files/                # Desktop app
│   ├── widget-desktop.swift   # Main desktop version
│   ├── widget-simple.swift    # Simplified version
│   └── widget.swift            # Basic version
│
├── server.js                   # Express server
├── package.json                # npm config
├── package-v11.sh             # Build script
└── docs/                       # Documentation
```

---

## 🏗️ Architecture

### Frontend (Web)

**Technology**: HTML5 + CSS3 + ES6 Modules

**Main Components**:
- `app-v10.js` - Main application logic
- `modules/` - Modular features
- `style-v9.css` - Styling with CSS variables

**Key Features**:
- ES6 modules for code organization
- Event-driven architecture
- LocalStorage for persistence
- Responsive design

### Backend (Node.js)

**Technology**: Node.js + Express

**Main Components**:
- `server.js` - HTTP server (port 3000)
- `fetch-news-v2.js` - News aggregation
- Caching system (2-minute cache)

**API Endpoints**:
- `GET /` - Main page
- `GET /api/news` - Fetch news
- `GET /api/autostart?action=enable|disable` - Auto-start control

### Desktop (Swift)

**Technology**: Swift + Cocoa + WebKit

**Main Components**:
- `widget-desktop.swift` - Desktop application
- WebView for rendering
- Menu bar integration
- Window management

---

## 🔧 Development Workflow

### 1. Frontend Development

Edit files in `renderer/`:

```bash
# Edit HTML
vim renderer/index-v10.html

# Edit CSS
vim renderer/style-v9.css

# Edit JavaScript
vim renderer/app-v10.js
vim renderer/modules/search.js
```

**Live Reload**: Refresh the app (⌘R) to see changes.

### 2. Backend Development

Edit `server.js` or `backend/fetch-news-v2.js`:

```bash
# Edit server
vim server.js

# Edit news fetcher
vim backend/fetch-news-v2.js

# Restart server
pkill -f "node server.js"
node server.js
```

### 3. Swift Development

Edit Swift files:

```bash
# Edit Swift code
vim widget-desktop.swift

# Recompile
swiftc -o NewsWidget widget-desktop.swift -framework Cocoa -framework WebKit

# Run
./NewsWidget
```

**Or use Xcode**:
```bash
open NewsWidgetApp.xcodeproj
```

---

## 🧪 Testing

### Manual Testing

1. **Start server**: `node server.js`
2. **Open app**: `open NewsWidget.app`
3. **Test features**:
   - News loading
   - Search (⌘F)
   - Favorites
   - Theme switching
   - Settings

### API Testing

Test individual news sources:

```bash
# Test news API
curl http://localhost:3000/api/news | jq

# Test with cache
curl -H "Cache-Control: no-cache" http://localhost:3000/api/news | jq

# Test auto-start
curl "http://localhost:3000/api/autostart?action=enable"
```

### Module Testing

Test individual modules:

```javascript
// In browser console
import { SearchModule } from '/renderer/modules/search.js';
const search = new SearchModule();
search.performSearch('test');
```

---

## 📦 Building

### Development Build

```bash
# Just run the app
node server.js &
open NewsWidget.app
```

### Production Build

```bash
# Package for distribution
./package-v11.sh

# Output: NewsWidget-v11.0-macOS.zip (16MB)
```

**Build Process**:
1. Check executables exist
2. Create .app bundle structure
3. Copy resources
4. Create Info.plist
5. Create startup script
6. Package as zip
7. Move to Desktop

---

## 🐛 Debugging

### Frontend Debugging

**Enable Web Inspector**:
1. Right-click in the app
2. Select "Inspect Element"
3. Use Chrome DevTools

**Console Logging**:
```javascript
console.log('Debug info:', data);
console.error('Error:', error);
```

### Backend Debugging

**Add logging**:
```javascript
console.log('[DEBUG]', 'News fetched:', newsData.length);
```

**Check server logs**:
```bash
tail -f /tmp/widget-standalone.log
```

### Swift Debugging

**Use Xcode**:
1. Open project in Xcode
2. Set breakpoints
3. Run with debugger (⌘R)

**Console output**:
```swift
print("Debug: \(variable)")
NSLog("Error: %@", error.localizedDescription)
```

---

## 🔄 Adding Features

### Add a New News Source

1. **Edit** `backend/fetch-news-v2.js`
2. **Add source config**:

```javascript
{
  id: 'my-source',
  name: 'My News Source',
  category: 'tech',
  url: 'https://api.example.com/news',
  parser: (data) => {
    return data.items.map(item => ({
      title: item.title,
      url: item.link,
      score: item.views || '',
      publish_time: item.date
    }));
  }
}
```

3. **Test**: Restart server and check news

### Add a New Module

1. **Create** `renderer/modules/my-module.js`:

```javascript
export class MyModule {
  constructor() {
    this.init();
  }
  
  init() {
    // Initialize
  }
  
  myMethod() {
    // Implementation
  }
}
```

2. **Import** in `app-v10.js`:

```javascript
import { MyModule } from '/renderer/modules/my-module.js';

// In constructor
this.myModule = new MyModule();
```

3. **Use** the module:

```javascript
this.myModule.myMethod();
```

---

## 📊 Performance Optimization

### Frontend

- Use debounce for search (already implemented)
- Lazy load images
- Minimize DOM operations
- Use CSS transforms for animations

### Backend

- Enable caching (already implemented)
- Batch API requests
- Use connection pooling
- Compress responses

### Swift

- Reuse WebView instances
- Minimize memory allocations
- Use background threads for heavy work

---

## 🔐 Security

### Best Practices

- Never commit API keys
- Validate all user input
- Sanitize HTML content
- Use HTTPS for APIs
- Keep dependencies updated

### Code Review Checklist

- [ ] No hardcoded credentials
- [ ] Input validation
- [ ] Error handling
- [ ] XSS prevention
- [ ] CSRF protection (if needed)

---

## 📝 Code Style

### JavaScript

```javascript
// Use const/let, not var
const data = await fetchData();
let count = 0;

// Arrow functions
const map = items.map(item => item.id);

// Async/await
async function fetchNews() {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// JSDoc comments
/**
 * Fetch news from source
 * @param {string} sourceId - Source identifier
 * @returns {Promise<Array>} News items
 */
```

### Swift

```swift
// Naming conventions
let newsItems: [NewsItem] = []
func fetchNews() { }

// Optional handling
if let data = optionalData {
    // Use data
}

// Error handling
do {
    try riskyOperation()
} catch {
    print("Error: \(error)")
}
```

---

## 🚀 Deployment

### Local Testing

1. Build the app
2. Test all features
3. Check for errors
4. Verify performance

### Distribution

1. Run `./package-v11.sh`
2. Test the zip file
3. Create GitHub release
4. Upload zip file
5. Write release notes

---

## 📚 Resources

### Documentation

- [MDN Web Docs](https://developer.mozilla.org/)
- [Swift Documentation](https://swift.org/documentation/)
- [Node.js Docs](https://nodejs.org/docs/)

### Tools

- [Postman](https://www.postman.com/) - API testing
- [VS Code](https://code.visualstudio.com/) - Code editor
- [Xcode](https://developer.apple.com/xcode/) - Swift IDE

---

## 💡 Tips

1. **Use version control**: Commit often, write clear messages
2. **Test thoroughly**: Test on different macOS versions
3. **Document changes**: Update CHANGELOG.md
4. **Ask for help**: Use GitHub Discussions
5. **Have fun**: Enjoy coding! 🎉

---

## 📞 Need Help?

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/NewsWidget/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/NewsWidget/discussions)

---

**Happy Coding!** 🚀
