const fs = require('fs');
const path = require('path');

// Files and directories to remove (old database setup)
const filesToRemove = [
  // Backend database files
  'backend/database/init_sqlite.js',
  'backend/database/migrate.js', 
  'backend/database/schema.sql',
  'backend/database/schema_sqlite.sql',
  'backend/database/setup_database.sql',
  'backend/database/setup_demo_data.bat',
  'backend/database/setup_demo_data.sh',
  'backend/src/config/database.js',
  'backend/src/config/redis.js',
  'backend/src/config/redis-optional.js',
  
  // SQLite database files
  'backend/data/',
  
  // Docker files (if using Firebase, we don't need PostgreSQL)
  'backend/docker-compose.yml'
];

// Optional files to keep but rename for backup
const filesToBackup = [
  'backend/database/create_demo_user.sql',
  'backend/database/new_features_schema.sql'
];

console.log('🧹 Starting database cleanup...');

filesToRemove.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Removed directory: ${filePath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`✅ Removed file: ${filePath}`);
      }
    } else {
      console.log(`⏭️  File not found (skipping): ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Error removing ${filePath}: ${error.message}`);
  }
});

// Backup important files
filesToBackup.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  const backupPath = fullPath + '.backup';
  
  try {
    if (fs.existsSync(fullPath) && !fs.existsSync(backupPath)) {
      fs.copyFileSync(fullPath, backupPath);
      console.log(`📋 Backed up: ${filePath} -> ${filePath}.backup`);
    }
  } catch (error) {
    console.log(`❌ Error backing up ${filePath}: ${error.message}`);
  }
});

// Update package.json scripts to remove database-related commands
const packageJsonPath = path.join(__dirname, 'backend/package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Remove old scripts
    delete packageJson.scripts['init-db'];
    delete packageJson.scripts['setup-db'];
    
    // Add Firebase-related scripts
    packageJson.scripts['firebase-deploy'] = 'firebase deploy --only functions';
    packageJson.scripts['firebase-logs'] = 'firebase functions:log';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated backend package.json scripts');
  } catch (error) {
    console.log(`❌ Error updating package.json: ${error.message}`);
  }
}

console.log('\n🎉 Database cleanup completed!');
console.log('\n📝 Next steps:');
console.log('1. Run: npm install firebase-admin (in backend folder)');
console.log('2. Set up Firebase Admin SDK credentials');
console.log('3. Update your backend routes to use Firebase');
console.log('4. Test the Firebase integration');
console.log('\n⚠️  Note: Backup files have been created for important schema files');
