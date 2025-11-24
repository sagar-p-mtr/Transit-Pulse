# 🐘 PostgreSQL Installation Guide (Windows)

## Step-by-Step with Screenshots Description

### Step 1: Download PostgreSQL

1. Open browser and go to: **https://www.postgresql.org/download/windows/**
2. Click on **"Download the installer"**
3. You'll be redirected to EDB website
4. Download **PostgreSQL 15.x** (latest version) for Windows x86-64

---

### Step 2: Install PostgreSQL

1. **Run the installer** (PostgreSQL-15.x-windows-x64.exe)

2. **Installation Wizard:**
   - Click **Next**
   - Installation Directory: Keep default (`C:\Program Files\PostgreSQL\15`)
   - Click **Next**

3. **Select Components:**
   - ✅ PostgreSQL Server (required)
   - ✅ pgAdmin 4 (GUI tool - recommended!)
   - ✅ Command Line Tools (required)
   - Click **Next**

4. **Data Directory:** Keep default, click **Next**

5. **Password:**
   - Enter a password for `postgres` user
   - **REMEMBER THIS PASSWORD!** You'll need it!
   - Re-enter password
   - Click **Next**

6. **Port:** 
   - Keep default: `5432`
   - Click **Next**

7. **Locale:** Keep default, click **Next**

8. **Summary:** Review and click **Next**

9. **Installation:** Click **Next** and wait for installation

10. **Finish:** Uncheck "Stack Builder" and click **Finish**

---

### Step 3: Verify Installation

1. **Open Command Prompt** (Win + R, type `cmd`, press Enter)

2. **Test PostgreSQL:**
   ```bash
   psql --version
   ```
   
   Should show:
   ```
   psql (PostgreSQL) 15.x
   ```

3. **If command not found:**
   - Add to PATH:
     - Search "Edit system environment variables" in Windows
     - Click "Environment Variables"
     - Under "System Variables", find "Path"
     - Click "Edit"
     - Click "New"
     - Add: `C:\Program Files\PostgreSQL\15\bin`
     - Click OK on all windows
     - **Restart Command Prompt**

---

### Step 4: Create Database

1. **Open Command Prompt as Administrator** (Right-click → Run as Administrator)

2. **Connect to PostgreSQL:**
   ```bash
   psql -U postgres
   ```
   
3. **Enter your password** when prompted

4. **Create database:**
   ```sql
   CREATE DATABASE whereismybus;
   ```
   
   Should show:
   ```
   CREATE DATABASE
   ```

5. **Verify database created:**
   ```sql
   \l
   ```
   
   You should see `whereismybus` in the list!

6. **Exit:**
   ```sql
   \q
   ```

---

### Step 5: Enable PostGIS Extension

1. **Connect to your database:**
   ```bash
   psql -U postgres -d whereismybus
   ```

2. **Create extension:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Verify:**
   ```sql
   SELECT PostGIS_Version();
   ```
   
   Should show PostGIS version!

4. **Exit:**
   ```sql
   \q
   ```

---

## ✅ You're Done!

PostgreSQL is now installed and ready! 🎉

### Quick Reference:

- **Database Name:** `whereismybus`
- **Username:** `postgres`
- **Password:** [The one you set]
- **Port:** `5432`
- **Host:** `localhost`

---

## 🎨 Using pgAdmin (GUI Tool)

1. Open **pgAdmin 4** from Start Menu
2. Enter master password (if asked)
3. Expand **Servers** → **PostgreSQL 15** → **Databases**
4. You should see **whereismybus**!

Now you can:
- View tables
- Run SQL queries
- See data visually

---

## 🚨 Troubleshooting

### Can't connect to database?
```bash
# Check if PostgreSQL is running:
# Open Services (Win + R, type services.msc)
# Find "postgresql-x64-15"
# Make sure it's "Running"
# If not, right-click → Start
```

### Forgot password?
You'll need to reset it:
1. Find `pg_hba.conf` in `C:\Program Files\PostgreSQL\15\data`
2. Change `md5` to `trust` for local connections
3. Restart PostgreSQL service
4. Connect and change password
5. Change back to `md5`

---

**Now go back to `SETUP_WITHOUT_DOCKER.md` for the rest of the setup!** 😊

