# 🔧 Fix: Database Connection Error

## The Problem
You got this error:
```
❌ Migration failed: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

This means the `.env` file is not set up correctly!

---

## ✅ Solution (2 Minutes)

### Step 1: Create .env File

**In the `backend/` folder**, create a file named `.env` (no .txt, just `.env`)

**Copy this into it:**

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=whereismybus
DB_USER=postgres
DB_PASSWORD=yourpassword

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=my_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=my_refresh_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

### Step 2: Update Your Password

**IMPORTANT:** Change `DB_PASSWORD=yourpassword` to your actual PostgreSQL password!

Example:
```env
DB_PASSWORD=admin123
```

### Step 3: Save the File

Make sure:
- File is named `.env` (not `.env.txt`)
- It's in the `backend/` folder
- Password has NO quotes, NO spaces

---

## 🔍 How to Create .env File (Windows)

### Method 1: Using VS Code (Easiest)
1. In VS Code, right-click `backend` folder
2. Click "New File"
3. Name it `.env` (with the dot!)
4. Paste the content above
5. Update password
6. Save (Ctrl+S)

### Method 2: Using Notepad
1. Open Notepad
2. Paste the content above
3. Update password
4. Click File → Save As
5. File name: `.env` (with quotes!)
6. Save as type: "All Files (*.*)"
7. Save in `backend` folder

---

## ✅ Test Again

Now run:
```bash
npm run migrate
```

Should work! 🎉

---

## 🚨 Still Not Working?

### Error: "File .env not found"
- Make sure file is in `backend/` folder
- Make sure it's named `.env` (not `.env.txt`)

### Error: "password authentication failed"
- Your PostgreSQL password is wrong
- Remember the password you set during PostgreSQL installation
- Try connecting with pgAdmin to verify password

### Forgot PostgreSQL Password?
1. Open pgAdmin 4
2. Connect to database
3. If you can connect in pgAdmin, use that password
4. If you can't, you need to reset PostgreSQL password

---

## 📞 Need Help?

Show me:
1. Screenshot of your `backend` folder (so I can see if .env exists)
2. The exact error you're getting

I'll help you fix it! 😊

