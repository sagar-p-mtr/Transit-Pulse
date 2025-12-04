# Contributing to Where Is My Bus

First off, thank you for considering contributing to Where Is My Bus! 🎉

It's people like you that make Where Is My Bus such a great tool for public transportation in India.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to support@whereismybus.in.

**Our Standards:**
- ✅ Be respectful and inclusive
- ✅ Welcome newcomers warmly
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what's best for the community
- ❌ No harassment, trolling, or derogatory comments

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/your-username/where-is-my-bus-india.git
   cd where-is-my-bus-india
   ```
3. **Set up the development environment** (see [README.md](README.md))
4. **Create a branch** for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When filing a bug report, include:**
- Clear, descriptive title
- Steps to reproduce the problem
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)
- Any error messages or logs

### 💡 Suggesting Features

Feature suggestions are welcome! Please provide:
- Clear description of the feature
- Why this feature would be useful
- Possible implementation approach
- Any relevant examples or mockups

### 🔧 Code Contributions

#### Types of Contributions

1. **Bug Fixes** - Fix identified issues
2. **New Features** - Implement new functionality
3. **Performance Improvements** - Optimize existing code
4. **Documentation** - Improve or add documentation
5. **Tests** - Add or improve test coverage
6. **Refactoring** - Improve code quality without changing functionality

## 💻 Development Workflow

### 1. Set Up Development Environment

```bash
# Install dependencies
npm install
cd backend && npm install

# Set up environment variables
cp .env.example .env
cp backend/.env.example backend/.env
# Edit .env files with your configuration

# Initialize database
cd backend
npm run init-db
npm run setup-db
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run frontend
npm run dev

# Run backend (in another terminal)
cd backend
npm run dev

# Run tests
npm run test
```

### 4. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add bus arrival notifications"
git commit -m "fix: resolve map rendering issue"
git commit -m "docs: update installation guide"
```

## 🎨 Style Guidelines

### JavaScript/TypeScript

- Use **TypeScript** for new frontend code
- Use **ES6+** features
- Use **functional components** with hooks in React
- Follow **ESLint** rules (run `npm run lint`)
- Use **meaningful variable names**
- Add **JSDoc comments** for complex functions

**Example:**
```typescript
/**
 * Calculate estimated time of arrival for a bus
 * @param currentLocation - Current GPS coordinates
 * @param destination - Destination coordinates
 * @param traffic - Current traffic conditions
 * @returns ETA in minutes
 */
const calculateETA = (
  currentLocation: Coordinates,
  destination: Coordinates,
  traffic: TrafficLevel
): number => {
  // Implementation
};
```

### React Components

- Use functional components
- Keep components small and focused
- Use custom hooks for reusable logic
- Properly type props with TypeScript

```typescript
interface BusCardProps {
  busNumber: string;
  route: string;
  eta: number;
  crowdLevel: 'low' | 'medium' | 'high';
}

const BusCard: React.FC<BusCardProps> = ({ 
  busNumber, 
  route, 
  eta, 
  crowdLevel 
}) => {
  // Component logic
};
```

### CSS/Styling

- Use **Tailwind CSS** classes
- Create custom utilities in `tailwind.config.js` if needed
- Keep styles consistent with existing UI
- Support both light and dark modes

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no logic change)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Examples

```bash
feat: add real-time crowd prediction
fix: resolve WebSocket connection timeout
docs: update API documentation
style: format code with prettier
refactor: simplify route calculation logic
perf: optimize map rendering
test: add tests for bus tracking service
chore: update dependencies
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example:**
```
feat(live-tracking): add stop-by-stop progress bar

- Added visual progress bar component
- Integrated with WebSocket updates
- Added animation for smooth transitions

Closes #123
```

## 🔄 Pull Request Process

### Before Submitting

1. ✅ Update documentation if needed
2. ✅ Add tests for new features
3. ✅ Ensure all tests pass
4. ✅ Run linter and fix issues
5. ✅ Update CHANGELOG.md if applicable
6. ✅ Rebase on latest main branch

### Submitting the PR

1. **Create Pull Request** on GitHub
2. **Fill out the PR template** completely
3. **Link related issues** using "Closes #123"
4. **Request review** from maintainers
5. **Respond to feedback** promptly

### PR Title Format

Follow conventional commits format:
```
feat: add bus arrival notifications
fix: resolve map rendering issue
docs: update contributing guide
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Screenshots (if applicable)
Add screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing
```

## 🧪 Testing Guidelines

### Writing Tests

- Write tests for new features
- Maintain or improve test coverage
- Test edge cases
- Use meaningful test descriptions

```typescript
describe('calculateETA', () => {
  it('should calculate correct ETA with normal traffic', () => {
    // Test implementation
  });

  it('should adjust ETA based on heavy traffic', () => {
    // Test implementation
  });

  it('should handle invalid coordinates', () => {
    // Test implementation
  });
});
```

## 📚 Additional Resources

- [README.md](README.md) - Project overview and setup
- [docs/](docs/) - Detailed documentation
- [GitHub Issues](https://github.com/your-username/where-is-my-bus-india/issues) - Bug reports and features
- [GitHub Discussions](https://github.com/your-username/where-is-my-bus-india/discussions) - Q&A and ideas

## 🙏 Recognition

Contributors will be recognized in:
- README.md acknowledgments
- GitHub contributors page
- Release notes for significant contributions

## 📞 Questions?

- **GitHub Discussions:** Ask questions publicly
- **Email:** support@whereismybus.in
- **Issues:** For bug reports and features

---

**Thank you for contributing to Where Is My Bus! 🚌**

Your contributions help make public transportation better for millions of people across India.
