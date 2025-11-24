// Unified database adapter that supports both Firebase and SQLite
const USE_FIREBASE = process.env.USE_FIREBASE === 'true'; // Read from .env file

let db;

if (USE_FIREBASE) {
  // Use Firebase
  try {
    const firebase = require('./firebase');
    db = {
      type: 'firebase',
      firebase: firebase,
      
      // Unified query interface
      async query(sql, params = []) {
        // Parse SQL to determine operation
        const operation = sql.trim().toUpperCase();
        
        if (operation.startsWith('SELECT')) {
          return this.handleSelect(sql, params);
        } else if (operation.startsWith('INSERT')) {
          return this.handleInsert(sql, params);
        } else if (operation.startsWith('UPDATE')) {
          return this.handleUpdate(sql, params);
        } else if (operation.startsWith('DELETE')) {
          return this.handleDelete(sql, params);
        }
        
        // Default: return empty result
        return { rows: [] };
      },
      
      async handleSelect(sql, params) {
        try {
          // Parse table name from SQL
          const tableMatch = sql.match(/FROM\s+(\w+)/i);
          if (!tableMatch) return { rows: [] };
          
          const tableName = tableMatch[1];
          
          // Parse WHERE conditions
          const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|$)/is);
          const filters = [];
          
          if (whereMatch) {
            const whereClause = whereMatch[1].trim();
            
            // Handle common patterns
            if (whereClause.includes('is_active = true')) {
              filters.push({ field: 'is_active', operator: '==', value: true });
            }
            if (whereClause.includes('route_id =')) {
              const routeId = params[0];
              if (routeId) {
                filters.push({ field: 'route_id', operator: '==', value: routeId });
              }
            }
          }
          
          // Handle joins - for bus with route queries
          if (sql.includes('JOIN routes')) {
            const buses = await firebase.busOperations.getAllActiveBuses();
            return { rows: buses };
          }
          
          // Get data from Firebase
          const data = await firebase.firebaseHelper.getAll(tableName, filters);
          return { rows: data };
        } catch (error) {
          console.error('Firebase SELECT error:', error);
          return { rows: [] };
        }
      },
      
      async handleInsert(sql, params) {
        try {
          const tableMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i);
          if (!tableMatch) return { rows: [] };
          
          const tableName = tableMatch[1];
          
          // Parse columns and values
          const columnsMatch = sql.match(/\(([^)]+)\)/);
          const valuesMatch = sql.match(/VALUES\s*\(([^)]+)\)/i);
          
          if (!columnsMatch || !valuesMatch) return { rows: [] };
          
          const columns = columnsMatch[1].split(',').map(c => c.trim());
          const data = {};
          
          columns.forEach((col, index) => {
            if (params[index] !== undefined) {
              data[col] = params[index];
            }
          });
          
          const docId = await firebase.firebaseHelper.create(tableName, data);
          return { rows: [{ id: docId, ...data }] };
        } catch (error) {
          console.error('Firebase INSERT error:', error);
          return { rows: [] };
        }
      },
      
      async handleUpdate(sql, params) {
        try {
          const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
          if (!tableMatch) return { rows: [] };
          
          const tableName = tableMatch[1];
          
          // Parse SET clause
          const setMatch = sql.match(/SET\s+(.+?)(?:WHERE|$)/is);
          if (!setMatch) return { rows: [] };
          
          // Parse WHERE clause to get document ID
          const whereMatch = sql.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
          if (!whereMatch) return { rows: [] };
          
          const docId = params[parseInt(whereMatch[1]) - 1];
          
          // Build update data from params
          const data = {};
          const setClause = setMatch[1];
          const assignments = setClause.split(',');
          
          let paramIndex = 0;
          assignments.forEach(assignment => {
            const [field] = assignment.split('=').map(s => s.trim());
            if (field && !field.includes('NOW()') && params[paramIndex] !== undefined) {
              data[field] = params[paramIndex];
              paramIndex++;
            }
          });
          
          await firebase.firebaseHelper.update(tableName, docId, data);
          return { rows: [{ id: docId, ...data }] };
        } catch (error) {
          console.error('Firebase UPDATE error:', error);
          return { rows: [] };
        }
      },
      
      async handleDelete(sql, params) {
        try {
          const tableMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
          if (!tableMatch) return { rows: [] };
          
          const tableName = tableMatch[1];
          
          // Parse WHERE clause to get document ID
          const whereMatch = sql.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
          if (!whereMatch) return { rows: [] };
          
          const docId = params[parseInt(whereMatch[1]) - 1];
          
          await firebase.firebaseHelper.delete(tableName, docId);
          return { rows: [] };
        } catch (error) {
          console.error('Firebase DELETE error:', error);
          return { rows: [] };
        }
      },
      
      pool: {
        async end() {
          console.log('Firebase connection closed');
        }
      }
    };
    
    console.log('✅ Using Firebase as database backend');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase, falling back to SQLite:', error);
    db = require('./database');
  }
} else {
  // Use SQLite
  db = require('./database');
  console.log('✅ Using SQLite as database backend');
}

module.exports = db;
