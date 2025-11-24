// Redis with fallback - works even if Redis is not installed!

let redis = null;
let redisAvailable = false;

try {
  const Redis = require('ioredis');
  
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: () => null, // Don't retry if can't connect
    lazyConnect: true,
  });

  redis.on('connect', () => {
    redisAvailable = true;
    console.log('✅ Connected to Redis');
  });

  redis.on('error', () => {
    redisAvailable = false;
  });

  // Try to connect
  redis.connect().catch(() => {
    redisAvailable = false;
    console.log('⚠️  Redis not available, using in-memory cache (this is fine!)');
  });

} catch (error) {
  console.log('⚠️  Redis not available, using in-memory cache (this is fine!)');
}

// In-memory cache as fallback
const memoryCache = new Map();

// Unified interface - works with or without Redis!
module.exports = {
  async get(key) {
    if (redisAvailable && redis) {
      return await redis.get(key);
    }
    return memoryCache.get(key);
  },

  async set(key, value) {
    if (redisAvailable && redis) {
      return await redis.set(key, value);
    }
    memoryCache.set(key, value);
    return 'OK';
  },

  async setex(key, seconds, value) {
    if (redisAvailable && redis) {
      return await redis.setex(key, seconds, value);
    }
    memoryCache.set(key, value);
    // Auto-delete after expiry
    setTimeout(() => memoryCache.delete(key), seconds * 1000);
    return 'OK';
  },

  async del(key) {
    if (redisAvailable && redis) {
      return await redis.del(key);
    }
    memoryCache.delete(key);
    return 1;
  },

  async quit() {
    if (redisAvailable && redis) {
      return await redis.quit();
    }
    memoryCache.clear();
    return 'OK';
  },

  isAvailable: () => redisAvailable,
};

