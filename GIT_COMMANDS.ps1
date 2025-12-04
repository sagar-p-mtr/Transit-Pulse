# Quick Git Commands for GitHub Upload
# Copy and paste these commands in PowerShell

# ============================================
# STEP 1: INITIAL SETUP (First Time Only)
# ============================================

# Navigate to your project directory
cd "c:\Users\sagar\OneDrive\Desktop\FYP Projects\Final Project"

# Initialize git (if not already done)
git init

# Check current status
git status

# ============================================
# STEP 2: VERIFY .GITIGNORE
# ============================================

# Make sure .env files won't be committed
# Check what files will be ignored
git status --ignored

# If you see .env files in the commit list, add them to .gitignore!

# ============================================
# STEP 3: STAGE AND COMMIT FILES
# ============================================

# Add all files
git add .

# Verify what will be committed (make sure no .env or sensitive files!)
git status

# Create initial commit
git commit -m "feat: initial commit - Where Is My Bus FYP project

- Complete React + TypeScript frontend
- Node.js + Express backend with WebSocket
- Real-time bus tracking with live updates
- AI-powered features (Bus Buddy, Crowd Prediction)
- Multi-language support (5 languages)
- WhereIsMyTrain-inspired live tracking UI
- Comprehensive documentation
- Docker support
- Firebase & Google Maps integration
"

# ============================================
# STEP 4: CONNECT TO GITHUB
# ============================================

# Replace YOUR-USERNAME with your actual GitHub username!
git remote add origin https://github.com/YOUR-USERNAME/where-is-my-bus-india.git

# Verify remote
git remote -v

# ============================================
# STEP 5: PUSH TO GITHUB
# ============================================

# Set main branch and push
git branch -M main
git push -u origin main

# ============================================
# TROUBLESHOOTING
# ============================================

# If you get authentication error, use Personal Access Token:
# 1. Go to GitHub → Settings → Developer settings → Personal access tokens
# 2. Generate new token with 'repo' scope
# 3. Use token as password when pushing

# OR set up SSH (recommended):
# ssh-keygen -t ed25519 -C "your_email@example.com"
# cat ~/.ssh/id_ed25519.pub
# Add the key to GitHub → Settings → SSH keys
# git remote set-url origin git@github.com:YOUR-USERNAME/where-is-my-bus-india.git

# ============================================
# COMMON COMMANDS FOR FUTURE USE
# ============================================

# Check status
git status

# Add specific file
git add filename.js

# Add all changes
git add .

# Commit changes
git commit -m "feat: add new feature"

# Push to GitHub
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# View commit history
git log --oneline

# See what changed
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes (dangerous!)
git checkout -- filename.js

# ============================================
# BRANCH WORKFLOW
# ============================================

# Create and switch to development branch
git checkout -b develop
git push -u origin develop

# Create feature branch
git checkout -b feature/awesome-feature

# Make changes, then commit
git add .
git commit -m "feat: add awesome feature"

# Push feature branch
git push origin feature/awesome-feature

# Switch back to main
git checkout main

# Merge feature branch (after PR approval)
git merge feature/awesome-feature

# Delete feature branch
git branch -d feature/awesome-feature
git push origin --delete feature/awesome-feature

# ============================================
# USEFUL ALIASES (Optional)
# ============================================

# Set up shortcuts
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'

# Now you can use:
# git st    instead of git status
# git co    instead of git checkout
# git ci    instead of git commit

# ============================================
# EMERGENCY COMMANDS
# ============================================

# If you committed .env by mistake:
git rm --cached .env
git commit -m "chore: remove .env from tracking"
git push

# If you need to remove file from all history (DANGEROUS!):
# git filter-branch --force --index-filter \
# "git rm --cached --ignore-unmatch .env" \
# --prune-empty --tag-name-filter cat -- --all

# After removing secrets, IMMEDIATELY rotate all API keys!

# ============================================
# HELPFUL TIPS
# ============================================

# 1. Always check 'git status' before committing
# 2. Never commit .env files or API keys
# 3. Write clear commit messages
# 4. Pull before push to avoid conflicts
# 5. Use branches for new features
# 6. Test before pushing to main
# 7. Keep commits small and focused

# ============================================
# NEED HELP?
# ============================================

# Git documentation
git help

# Help for specific command
git help commit

# Check git version
git --version

# View all configurations
git config --list
