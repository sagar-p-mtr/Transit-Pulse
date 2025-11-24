# SQLite Migration Guide

## ✅ Changes Made

### 1. Database Changed from PostgreSQL to SQLite
- **Old**: PostgreSQL (`pg` package)
- **New**: SQLite (`better-sqlite3` package)

### 2. Database Configuration
- Database file location: `backend/data/whereismybus.db`
- No need for separate database server
- No password or connection strings needed

### 3. Removed Kaggle Integration
- Removed `/api/kaggle` routes
- Deleted `kaggleData.js` route file
- Deleted `kaggleDataService.js` service file
- Deleted Kaggle-related database files

## 📦 Installation

1. **Install new dependency:**
   ```bash
   cd backend
   npm install better-sqlite3
   ```

2. **Initialize database:**
   ```bash
   npm run init-db
   ```

   This will create:
   - `backend/data/` directory (if it doesn't exist)
   - `backend/data/whereismybus.db` SQLite database file
   - All tables with sample data

## 🔄 Key Differences

### SQL Syntax Compatibility
The database wrapper automatically converts:
- PostgreSQL `$1, $2` placeholders → SQLite `?` placeholders
- Works transparently with existing code
- `INSERT ... RETURNING` is handled automatically

### Data Types
- `UUID` → `TEXT` (with UUID generation)
- `BOOLEAN` → `INTEGER` (0/1)
- `JSONB` → `TEXT` (JSON stored as text)
- `TIMESTAMP` → `DATETIME`
- `BIGSERIAL` → `INTEGER PRIMARY KEY AUTOINCREMENT`

### Functions
- `NOW()` → `CURRENT_TIMESTAMP`
- `gen_random_uuid()` → Custom UUID generation function
- `ON CONFLICT DO NOTHING` → `INSERT OR IGNORE`

## 🚀 Usage

### Starting the Server
```bash
cd backend
npm start
# or
npm run dev
```

The database will be automatically created if it doesn't exist.

### Database File Location
- Default: `backend/data/whereismybus.db`
- Override: Set `DB_PATH` environment variable

### Backup Database
Simply copy the `whereismybus.db` file:
```bash
cp backend/data/whereismybus.db backend/data/whereismybus.db.backup
```

## 📝 Environment Variables

You no longer need:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`

Optional:
- `DB_PATH` - Custom database file path (default: `backend/data/whereismybus.db`)

## ✅ Benefits

1. **Simpler Setup** - No PostgreSQL installation needed
2. **No Server Required** - SQLite is file-based
3. **Easier Development** - Just one file to manage
4. **Portable** - Easy to backup/restore
5. **Perfect for Development** - Fast and lightweight

## ⚠️ Notes

- SQLite is perfect for development and small-medium applications
- For production with high concurrency, consider PostgreSQL
- All existing API endpoints work the same way
- No code changes needed in routes or services

## 🔧 Troubleshooting

### Database Locked Error
If you see "database is locked" errors:
- Make sure only one instance of the server is running
- Check if another process is accessing the database file

### Permission Errors
Make sure the `backend/data/` directory has write permissions:
```bash
chmod 755 backend/data
```

