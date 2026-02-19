# Contributing to NewsWidget

First off, thank you for considering contributing to NewsWidget! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

---

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**When submitting a bug report, include**:
- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots (if applicable)
- Your environment (macOS version, Node.js version)

### Suggesting Features

Feature suggestions are welcome! Please provide:
- A clear description of the feature
- Why this feature would be useful
- Possible implementation approach

### Adding News Sources

Want to add a new news source? Great!

1. Check if the API is free and doesn't require authentication
2. Add the source configuration in `backend/fetch-news-v2.js`
3. Test thoroughly
4. Update documentation

### Improving Documentation

Documentation improvements are always appreciated:
- Fix typos or unclear explanations
- Add examples
- Translate to other languages
- Add screenshots or GIFs

---

## 🛠️ Development Setup

### Prerequisites

- macOS 10.15+
- Node.js 18+
- Swift 5.0+
- Xcode (optional, for Swift compilation)

### Setup Steps

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/NewsWidget.git
cd NewsWidget

# 2. Install dependencies
npm install

# 3. Start the development server
node server.js

# 4. In another terminal, run the app
open NewsWidget.app
# or compile Swift manually:
swiftc -o NewsWidget widget-desktop.swift -framework Cocoa -framework WebKit
./NewsWidget
```

### Project Structure

```
NewsWidget/
├── renderer/           # Frontend (HTML/CSS/JS)
│   ├── modules/       # ES6 modules
│   └── ...
├── backend/           # News fetching logic
├── *.swift           # Swift desktop app
├── server.js         # Express server
└── package-v11.sh    # Build script
```

---

## 📝 Coding Guidelines

### JavaScript

- Use ES6+ features (const, let, arrow functions, modules)
- Follow existing code style
- Add JSDoc comments for functions
- Keep functions small and focused

```javascript
/**
 * Fetch news from a specific source
 * @param {string} sourceId - The source identifier
 * @returns {Promise<Array>} Array of news items
 */
async function fetchNews(sourceId) {
  // Implementation
}
```

### Swift

- Follow Swift naming conventions
- Use meaningful variable names
- Add comments for complex logic

### CSS

- Use CSS variables for theming
- Follow BEM naming convention (optional)
- Keep selectors specific but not overly nested

---

## 💬 Commit Messages

Write clear and meaningful commit messages:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(news): add Reddit news source

- Add Reddit API integration
- Parse top posts from r/news
- Add to tech category

Closes #123
```

```
fix(search): resolve keyword highlighting issue

The regex was not escaping special characters properly.
Now uses proper escaping for all search terms.

Fixes #456
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Follow coding guidelines**
4. **Write clear commit messages**
5. **Ensure no merge conflicts**

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

### Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in the changelog

---

## 🎨 Adding New Features

### 1. Plan

- Discuss the feature in an issue first
- Get feedback from maintainers
- Plan the implementation

### 2. Implement

- Create a feature branch
- Write clean, documented code
- Follow existing patterns

### 3. Test

- Test all functionality
- Test edge cases
- Test on different macOS versions (if possible)

### 4. Document

- Update README if needed
- Add JSDoc comments
- Update CHANGELOG

---

## 🐛 Fixing Bugs

### 1. Reproduce

- Confirm the bug exists
- Understand the root cause
- Create a minimal reproduction

### 2. Fix

- Write a fix
- Ensure it doesn't break other features
- Add tests if possible

### 3. Verify

- Test the fix thoroughly
- Check for side effects
- Test on different scenarios

---

## 📚 Documentation

### README

- Keep it concise and clear
- Use screenshots and examples
- Update version numbers

### Code Comments

- Explain **why**, not **what**
- Use JSDoc for functions
- Keep comments up-to-date

### Changelog

- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Group changes by type
- Include issue/PR references

---

## 🌍 Internationalization

Want to translate NewsWidget?

1. Create a new language file in `locales/`
2. Translate all strings
3. Update the language selector
4. Test thoroughly

---

## ❓ Questions?

- **General questions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/NewsWidget/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/YOUR_USERNAME/NewsWidget/issues)
- **Feature requests**: [GitHub Issues](https://github.com/YOUR_USERNAME/NewsWidget/issues)

---

## 🙏 Thank You!

Your contributions make NewsWidget better for everyone. Thank you for taking the time to contribute! ❤️

---

**Happy Coding!** 🚀
