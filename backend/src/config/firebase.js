const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp;

if (!firebaseApp) {
  try {
    // In production, use service account key
    // For development, you can use the Firebase emulator or service account key
    
    // Option 1: Using service account key file (recommended for production)
    // const serviceAccount = require('path/to/your/service-account-key.json');
    // firebaseApp = admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount),
    //   projectId: 'whereismybus-5df3c'
    // });
    
    // Option 2: Using environment variables (recommended for development)
    if (process.env.FIREBASE_PROJECT_ID) {
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'whereismybus-5df3c'
      });
    } else {
      // Option 3: Auto-initialize if running in Firebase environment
      firebaseApp = admin.initializeApp();
    }
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
    throw error;
  }
}

// Get Firestore database instance
const db = admin.firestore();

// Get Firebase Auth instance
const auth = admin.auth();

// Helper functions for database operations
const firebaseHelper = {
  // Collection helpers
  collection: (collectionName) => db.collection(collectionName),
  
  // Document helpers
  doc: (collectionName, docId) => db.collection(collectionName).doc(docId),
  
  // Query helpers
  async getAll(collectionName, filters = []) {
    let query = db.collection(collectionName);
    
    // Apply filters
    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value);
    });
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async getById(collectionName, docId) {
    const doc = await db.collection(collectionName).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },
  
  async create(collectionName, data) {
    const docRef = await db.collection(collectionName).add({
      ...data,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  },
  
  async update(collectionName, docId, data) {
    await db.collection(collectionName).doc(docId).update({
      ...data,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
  },
  
  async delete(collectionName, docId) {
    await db.collection(collectionName).doc(docId).delete();
  },
  
  // Real-time listeners
  onSnapshot(collectionName, callback, filters = []) {
    let query = db.collection(collectionName);
    
    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value);
    });
    
    return query.onSnapshot(callback);
  },
  
  // Batch operations
  batch() {
    return db.batch();
  },
  
  // Transactions
  runTransaction(updateFunction) {
    return db.runTransaction(updateFunction);
  },
  
  // Server timestamp
  serverTimestamp: admin.firestore.FieldValue.serverTimestamp,
  
  // Array operations
  arrayUnion: admin.firestore.FieldValue.arrayUnion,
  arrayRemove: admin.firestore.FieldValue.arrayRemove,
  
  // Increment
  increment: admin.firestore.FieldValue.increment
};

// Bus-specific operations
const busOperations = {
  async getAllActiveBuses() {
    return firebaseHelper.getAll('buses', [
      { field: 'is_active', operator: '==', value: true }
    ]);
  },
  
  async getBusesByRoute(routeNumber) {
    return firebaseHelper.getAll('buses', [
      { field: 'route_number', operator: '==', value: routeNumber },
      { field: 'is_active', operator: '==', value: true }
    ]);
  },
  
  async updateBusLocation(busId, location) {
    return firebaseHelper.update('buses', busId, {
      location,
      last_updated: admin.firestore.FieldValue.serverTimestamp()
    });
  },
  
  async updateBusOccupancy(busId, occupancyLevel) {
    return firebaseHelper.update('buses', busId, {
      occupancy_level: occupancyLevel,
      last_updated: admin.firestore.FieldValue.serverTimestamp()
    });
  }
};

// Route-specific operations
const routeOperations = {
  async getAllActiveRoutes() {
    return firebaseHelper.getAll('routes', [
      { field: 'is_active', operator: '==', value: true }
    ]);
  },
  
  async getRouteByNumber(routeNumber) {
    const routes = await firebaseHelper.getAll('routes', [
      { field: 'route_number', operator: '==', value: routeNumber }
    ]);
    return routes.length > 0 ? routes[0] : null;
  },
  
  async searchRoutes(startLocation, endLocation) {
    // Note: Firestore doesn't support OR queries directly
    // This is a simplified version - you might want to use composite indexes
    const startRoutes = await firebaseHelper.getAll('routes', [
      { field: 'start_location', operator: '==', value: startLocation },
      { field: 'is_active', operator: '==', value: true }
    ]);
    
    return startRoutes.filter(route => route.end_location === endLocation);
  }
};

// Stop-specific operations
const stopOperations = {
  async getAllStops() {
    return firebaseHelper.getAll('stops');
  },
  
  async getStopsByRoute(routeNumber) {
    return firebaseHelper.getAll('stops', [
      { field: 'routes', operator: 'array-contains', value: routeNumber }
    ]);
  },
  
  async searchStops(searchTerm) {
    // Note: Firestore doesn't support full-text search natively
    // For production, consider using Algolia or implement client-side filtering
    const allStops = await firebaseHelper.getAll('stops');
    return allStops.filter(stop => 
      stop.stop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};

// User operations
const userOperations = {
  async createUser(userData) {
    return firebaseHelper.create('users', userData);
  },
  
  async getUserById(userId) {
    return firebaseHelper.getById('users', userId);
  },
  
  async updateUserPreferences(userId, preferences) {
    return firebaseHelper.update('users', userId, { preferences });
  }
};

module.exports = {
  admin,
  db,
  auth,
  firebaseHelper,
  busOperations,
  routeOperations,
  stopOperations,
  userOperations
};
