# Changelog

All notable changes to NewsWidget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [11.0.0] - 2026-02-19

### Added
- 💱 **Real-time Exchange Rates**: Display top 3 currency pairs (EUR → CNY, GBP, JPY)
- 💬 **Daily Quotes**: Inspirational quotes from Hitokoto API
- 🎉 **Holiday Reminders**: Show upcoming holidays in the next 7 days
- 📊 **Scrolling Info Bar**: Bottom scrolling bar for enhanced information
- 🎓 **University Query**: Query information about Chinese universities
- 🌐 **Enhanced IP Query**: Chinese language support with detailed information (timezone, coordinates, ISP, etc.)

### Changed
- Upgraded IP query API from ipapi.co to ip-api.com
- Improved error handling for enhanced info module
- Updated version display to v11.0

### Fixed
- Fixed syntax error in enhanced-info.js (extra closing bracket)
- Enabled enhanced info module (was commented out)

---

## [10.0.0] - 2026-02-18

### Added
- 🎨 **Modular Architecture**: Refactored from 1082-line single file to 293-line main + 6 modules
- 📦 **ES6 Modules**: search.js, favorites.js, stats.js, theme.js, settings.js, utils.js
- 📚 **Complete Documentation**: PROJECT-DIARY.md with 9000+ words

### Changed
- Reorganized code structure for better maintainability
- Improved code readability and testability
- Reduced main file size by 73%

### Technical
- Main app: 293 lines (from 1082 lines)
- 6 ES6 modules: ~600 lines total
- Event-driven architecture
- Decoupled module communication

---

## [9.4.0] - 2026-02-18

### Added
- 🎨 **Theme Switching**: Dark, Light, and System themes
- 🌈 **Light Theme**: Fresh and bright color scheme
- 💾 **Theme Persistence**: Save user preference in localStorage
- 🔄 **System Theme Sync**: Auto-switch with macOS system theme

### Changed
- Optimized button colors for better contrast
- Improved tab styling with glassmorphism
- Enhanced visual hierarchy

---

## [9.3.0] - 2026-02-18

### Added
- ⚡ **Smart Caching**: 2-minute cache for news data
- 📊 **Cache Headers**: X-Cache, X-Cache-Age HTTP headers
- 🔄 **Force Refresh**: Manual refresh bypasses cache

### Performance
- Response time: ~10s → <0.1s (cache hit, 100x faster)
- API requests: Reduced by 80%
- Server load: Reduced by 80%

---

## [9.2.0] - 2026-02-18

### Added
- 🔍 **Global Search**: Search across all news categories
- 🎯 **Keyword Highlighting**: Yellow background for search terms
- ⌨️ **Keyboard Shortcut**: ⌘F to focus search box
- 📊 **Result Count**: Display number of matching results

### Changed
- Improved search UX with debounce
- Added clear button for search input

---

## [9.1.0] - 2026-02-18

### Added
- ⏱️ **Timeout Control**: 8-second timeout for API requests
- 🔄 **Auto Retry**: Retry failed requests up to 3 times
- 📊 **Error Tracking**: Track and display failed sources

### Fixed
- Fixed favorite ID collision (now uses source + title + url hash)
- Improved error messages and user feedback
- Better loading progress indication

### Performance
- Average load time: ~15s → ~10s (33% faster)
- Success rate: ~85% → ~95% (10% improvement)

---

## [9.0.0] - 2026-02-18

### Added
- ⭐ **Favorites System**: Save and manage favorite news
- 📊 **Data Visualization**: 
  - News count and source analytics
  - Word cloud with Chinese segmentation
  - Category distribution charts
  - Source activity ranking
- ⚙️ **Settings Panel**:
  - Auto-start at login
  - Refresh interval (5/10/30/60 min)
  - Export favorites as JSON
  - Clear all data
- 🎨 **Modern UI**:
  - Glassmorphism effects
  - SVG icons
  - Scrollable navigation
  - Smooth animations
- 📦 **Packaging System**:
  - Standalone .app bundle
  - Size optimization (327MB → 4.6MB, 98.6% reduction)
  - Distribution-ready zip

### Changed
- Expanded data sources from 18 to 22
- Improved tab navigation with glassmorphism
- Enhanced visual design

---

## [8.0.0] - 2026-02-17

### Added
- 📰 **News Aggregation**: 18 data sources
- 🏷️ **4 Categories**: Hot, Tech, Finance, General
- 🎨 **Basic UI**: Card-based layout
- 🔄 **Auto Refresh**: Configurable intervals
- 📱 **Desktop Integration**: macOS menu bar

---

## Earlier Versions

See individual CHANGELOG files for detailed history:
- [CHANGELOG-v9.0.md](CHANGELOG-v9.0.md)
- [CHANGELOG-v9.1.md](CHANGELOG-v9.1.md)
- [CHANGELOG-v9.2.md](CHANGELOG-v9.2.md)
- [CHANGELOG-v9.3.md](CHANGELOG-v9.3.md)

---

## Version History Summary

| Version | Date | Key Features |
|---------|------|--------------|
| 11.0 | 2026-02-19 | Enhanced info, exchange rates, daily quotes, holidays |
| 10.0 | 2026-02-18 | Modular architecture, ES6 modules |
| 9.4 | 2026-02-18 | Theme switching (dark/light/system) |
| 9.3 | 2026-02-18 | Smart caching (2-min, 100x faster) |
| 9.2 | 2026-02-18 | Global search with highlighting |
| 9.1 | 2026-02-18 | Timeout control, auto retry |
| 9.0 | 2026-02-18 | Favorites, statistics, settings, packaging |
| 8.0 | 2026-02-17 | Initial release with 18 sources |

---

[11.0.0]: https://github.com/YOUR_USERNAME/NewsWidget/releases/tag/v11.0.0
[10.0.0]: https://github.com/YOUR_USERNAME/NewsWidget/releases/tag/v10.0.0
[9.4.0]: https://github.com/YOUR_USERNAME/NewsWidget/releases/tag/v9.4.0
[9.3.0]: https://github.com/YOUR_USERNAME/NewsWidget/releases/tag/v9.3.0
[9.2.0]: https://github.com/YOUR_USERNAME/NewsWidget/releases/tag/v9.2.0
[9.1.0]: https://github.com/YOUR_USERNAME/NewsWidget/releases/tag/v9.1.0
[9.0.0]: https://github.com/YOUR_USERNAME/NewsWidget/releases/tag/v9.0.0
[8.0.0]: https://github.com/YOUR_USERNAME/NewsWidget/releases/tag/v8.0.0
