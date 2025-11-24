# 🚀 Backend Setup - NO DOCKER! (Windows)

## Sorry bro! Here's the setup WITHOUT Docker! 😊

---

## 📋 What You Need to Install

### 1️⃣ **PostgreSQL** (Database)

**Download & Install:**
1. Go to: https://www.postgresql.org/download/windows/
2. Download the installer (latest version)
3. Run installer
4. **IMPORTANT - Remember these:**
   - Port: `5432` (default, keep it)
   - Username: `postgres` (default)
   - Password: **Set your own** (remember it!)
   - Database name: We'll create it later

**After Installation:**
```bash
# Open Command Prompt and test:
psql --version
# Should show: psql (PostgreSQL) 15.x
```

---

### 2️⃣ **Redis** (Cache) - OPTIONAL!

**Option A: Skip Redis (Easiest)**
- The backend will work WITHOUT Redis
- I'll show you how to disable it

**Option B: Install Redis (Windows)**
- Download from: https://github.com/microsoftarchive/redis/releases
- Download `Redis-x64-3.0.504.msi`
- Install it
- Redis will run on port `6379`

---

## 🛠️ Setup Steps (10 Minutes)

### Step 1: Create Database

```bash
# Open Command Prompt as Administrator

# Login to PostgreSQL (enter your password when asked)
psql -U postgres

# Create database
CREATE DATABASE whereismybus;

# Exit
\q
```

---

### Step 2: Update Backend Config

**Edit `backend/.env`** and change to:

```env
NODE_ENV=development
PORT=5000

# PostgreSQL (USE YOUR PASSWORD!)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=whereismybus
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE    # ← PUT YOUR POSTGRES PASSWORD!

# Redis (if you installed it, otherwise we'll disable)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets
JWT_SECRET=my_super_secret_key_change_in_production_12345
JWT_REFRESH_SECRET=my_refresh_secret_key_67890
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# ML Service (optional)
ML_SERVICE_URL=http://localhost:8000
```

---

### Step 3: Modify Code to Make Redis Optional

I'll create a new file for you!

---

### Step 4: Install Dependencies

```bash
cd backend
npm install
```

---

### Step 5: Create Database Tables

```bash
npm run migrate
```

You should see:
```
✅ Migrations completed successfully!
```

---

### Step 6: Start Server!

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║   🚌 Where Is My Bus - Backend Server                ║
║   🚀 Server: http://localhost:5000                   ║
╚═══════════════════════════════════════════════════════╝
```

---

## ✅ That's It!

**No Docker needed!** Everything runs locally on Windows! 🎉

---

## 🚨 Troubleshooting

### "psql: command not found"
Add PostgreSQL to PATH:
1. Search "Environment Variables" in Windows
2. Edit PATH variable
3. Add: `C:\Program Files\PostgreSQL\15\bin`

### "Connection refused" error
- Make sure PostgreSQL service is running
- Windows Services → PostgreSQL → Start

### Redis errors?
Just skip Redis! I'll show you how below.

---

## 🔧 Run WITHOUT Redis (Simplest!)

If you don't want Redis at all, I'll update the code files for you!

**Want me to do that?** Just say "yes skip redis" and I'll modify the code! 😊

