# 🚀 GitHub Setup Guide

This guide will help you set up and push your "Where Is My Bus" project to GitHub.

## 📋 Prerequisites

- Git installed on your system ([Download](https://git-scm.com/))
- GitHub account ([Sign up](https://github.com/))
- Project ready in your local directory

## 🔧 Step-by-Step Setup

### 1️⃣ Create a GitHub Repository

1. Go to [GitHub](https://github.com/)
2. Click the **"+"** button (top right) → **"New repository"**
3. Fill in the details:
   - **Repository name:** `where-is-my-bus-india`
   - **Description:** "Smart real-time bus tracking app for Indian cities - Final Year Project"
   - **Visibility:** Choose Public or Private
   - ✅ **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

### 2️⃣ Prepare Your Local Project

Open terminal/command prompt in your project directory:

```powershell
# Navigate to your project
cd "c:\Users\sagar\OneDrive\Desktop\FYP Projects\Final Project"

# Check if .env files exist and are in .gitignore
# IMPORTANT: Never commit .env files with secrets!
```

### 3️⃣ Initialize Git (if not already initialized)

```powershell
# Initialize git repository
git init

# Verify .gitignore is in place
cat .gitignore
```

### 4️⃣ Stage All Files

```powershell
# Add all files to staging
git add .

# Check what will be committed
git status
```

**⚠️ Important Check:**
Make sure these files are **NOT** in the list:
- `.env` files
- `node_modules/` folder
- `*.db` or `*.sqlite` files
- `serviceAccountKey.json`
- Any personal/sensitive data

If you see them, add them to `.gitignore` and run:
```powershell
git rm --cached <filename>
```

### 5️⃣ Create Initial Commit

```powershell
# Create your first commit
git commit -m "feat: initial commit - Where Is My Bus FYP project

- Complete React + TypeScript frontend
- Node.js + Express backend
- Real-time bus tracking with WebSocket
- AI-powered features (Bus Buddy, Crowd Prediction)
- Multi-language support (5 languages)
- Live tracking UI inspired by WhereIsMyTrain
- Comprehensive documentation
- Docker support
- Firebase integration
- Google Maps integration
"
```

### 6️⃣ Connect to GitHub Repository

Replace `YOUR-USERNAME` with your actual GitHub username:

```powershell
# Add remote repository
git remote add origin https://github.com/YOUR-USERNAME/where-is-my-bus-india.git

# Verify remote was added
git remote -v
```

### 7️⃣ Push to GitHub

```powershell
# Push to main branch
git branch -M main
git push -u origin main
```

**If you get authentication errors:**

#### Option A: HTTPS (Personal Access Token)
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`
4. Copy the token
5. When pushing, use the token as password

#### Option B: SSH (Recommended)
```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key

# Change remote to SSH
git remote set-url origin git@github.com:YOUR-USERNAME/where-is-my-bus-india.git

# Push again
git push -u origin main
```

## ✅ Verify Your Upload

1. Go to your GitHub repository
2. Check if all files are uploaded
3. Verify README.md is displaying correctly
4. Check that sensitive files are **NOT** uploaded

## 📝 Create a Great Repository

### Add Repository Description

On GitHub repository page:
1. Click **"About"** (⚙️ gear icon)
2. Add description: "Smart real-time bus tracking app for Indian cities with AI-powered features, crowd prediction, and multi-language support"
3. Add website (if you have one)
4. Add topics: `react`, `typescript`, `nodejs`, `bus-tracking`, `real-time`, `firebase`, `google-maps`, `websocket`, `ai`, `fyp`, `india`

### Create Repository Labels

Organize issues with labels:
- `bug` 🐛 - Something isn't working
- `enhancement` ✨ - New feature or request
- `documentation` 📚 - Documentation improvements
- `good first issue` 👋 - Good for newcomers
- `help wanted` 🙋 - Extra attention needed
- `frontend` 💻 - Frontend related
- `backend` 🔧 - Backend related
- `ui/ux` 🎨 - User interface/experience

### Set Up GitHub Pages (Optional)

If you want to deploy frontend:
1. Repository → Settings → Pages
2. Source: GitHub Actions or Branch (if using gh-pages)
3. Configure deployment workflow

## 🔒 Security Best Practices

### ⚠️ Critical: Protect Secrets

Before pushing, ensure these are in `.gitignore`:

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Firebase credentials
**/serviceAccountKey.json
**/firebase-adminsdk-*.json

# Database files
*.db
*.sqlite
*.sqlite3

# API keys (if in files)
secrets/
credentials/
```

### If You Accidentally Committed Secrets:

**DON'T PANIC!** But act quickly:

```powershell
# Remove file from Git history
git rm --cached .env
git commit -m "chore: remove sensitive file"
git push

# For complete history removal (use with caution):
# git filter-branch --force --index-filter \
# "git rm --cached --ignore-unmatch .env" \
# --prune-empty --tag-name-filter cat -- --all
```

**Important:** Rotate all exposed API keys and secrets immediately!

## 📊 Set Up GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run lint
    - run: npm run build
```

## 🎯 Next Steps

### After Initial Push:

1. **Create Development Branch**
   ```powershell
   git checkout -b develop
   git push -u origin develop
   ```

2. **Set Up Branch Protection**
   - Repository → Settings → Branches
   - Add rule for `main` branch
   - Require pull request reviews

3. **Add Issue Templates**
   - Create `.github/ISSUE_TEMPLATE/bug_report.md`
   - Create `.github/ISSUE_TEMPLATE/feature_request.md`

4. **Add Pull Request Template**
   - Create `.github/PULL_REQUEST_TEMPLATE.md`

5. **Update Repository Settings**
   - Enable "Issues"
   - Enable "Discussions" (for Q&A)
   - Set up "About" section with topics

## 🔄 Regular Workflow

### Making Changes

```powershell
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
```

### Keeping Updated

```powershell
# Pull latest changes
git checkout main
git pull origin main

# Update feature branch
git checkout feature/new-feature
git merge main
```

## 📱 Share Your Project

Once uploaded, share your project:

1. **Update README** with your actual GitHub username
2. **Create a Demo** (deploy frontend)
3. **Record a Video** demonstrating features
4. **Write a Blog Post** about your project
5. **Share on Social Media** (LinkedIn, Twitter)

### Example Share Text:

```
🚀 Excited to share my Final Year Project: Where Is My Bus! 🚌

A real-time bus tracking app for Indian cities with:
✅ Live GPS tracking
✅ AI-powered crowd prediction
✅ Multi-language support
✅ Beautiful WhereIsMyTrain-inspired UI

Built with React, TypeScript, Node.js, Firebase & Google Maps

🔗 GitHub: https://github.com/YOUR-USERNAME/where-is-my-bus-india
⭐ Star if you like it!

#FYP #WebDevelopment #React #NodeJS #OpenSource #IndianTech
```

## 🆘 Troubleshooting

### Common Issues:

**1. Large File Error**
```
error: file too large
```
Solution: Add large files to `.gitignore` or use Git LFS

**2. Permission Denied**
```
Permission denied (publickey)
```
Solution: Set up SSH keys or use HTTPS with token

**3. Merge Conflicts**
```
CONFLICT (content): Merge conflict
```
Solution: Resolve conflicts manually, then:
```powershell
git add .
git commit -m "chore: resolve merge conflicts"
git push
```

**4. Accidentally Committed node_modules**
```powershell
git rm -r --cached node_modules
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "chore: remove node_modules from git"
git push
```

## 📚 Additional Resources

- [GitHub Docs](https://docs.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## ✅ Checklist

Before considering your GitHub setup complete:

- [ ] Repository created on GitHub
- [ ] All code pushed successfully
- [ ] No sensitive files in repository
- [ ] README.md displays correctly
- [ ] .gitignore is working
- [ ] Repository description added
- [ ] Topics/tags added
- [ ] LICENSE file present
- [ ] CONTRIBUTING.md present
- [ ] GitHub issues enabled
- [ ] Branch protection rules set (optional)
- [ ] Repository shared with classmates/professors

---

**🎉 Congratulations!** Your project is now on GitHub and ready to be shared with the world!

Need help? Check [GitHub Support](https://support.github.com/) or open an issue in this repository.
