/**
 * Redis Cache Service
 */

import redis from 'redis';

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.error('[Redis] Connection refused. Running without cache.');
      return;
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

redisClient.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

redisClient.on('error', (err) => {
  console.error('[Redis Error]:', err);
});

/**
 * Cache Configuration
 */
const CACHE_KEYS = {
  MENU_ITEMS: 'menu_items',
  CANTEEN_DATA: 'canteen_data_',
  USER_PROFILE: 'user_profile_',
  ORDER_STATUS: 'order_status_',
  WALLET_BALANCE: 'wallet_balance_',
  DASHBOARD_STATS: 'dashboard_stats',
  LOW_STOCK_ITEMS: 'low_stock_items'
};

const CACHE_EXPIRY = {
  MENU_ITEMS: 5 * 60, // 5 minutes
  CANTEEN_DATA: 10 * 60, // 10 minutes
  USER_PROFILE: 15 * 60, // 15 minutes
  ORDER_STATUS: 3 * 60, // 3 minutes
  WALLET_BALANCE: 2 * 60, // 2 minutes
  DASHBOARD_STATS: 1 * 60, // 1 minute
  LOW_STOCK_ITEMS: 5 * 60 // 5 minutes
};

/**
 * Get value from cache
 */
export const getCachedValue = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, data) => {
      if (err) {
        console.error('[Redis Get Error]:', err);
        resolve(null);
      }
      try {
        resolve(data ? JSON.parse(data) : null);
      } catch (e) {
        resolve(null);
      }
    });
  });
};

/**
 * Set value in cache
 */
export const setCachedValue = (key, value, expirySeconds = 300) => {
  return new Promise((resolve, reject) => {
    redisClient.setex(key, expirySeconds, JSON.stringify(value), (err) => {
      if (err) {
        console.error('[Redis Set Error]:', err);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * Delete cache key
 */
export const deleteCacheKey = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.del(key, (err) => {
      if (err) {
        console.error('[Redis Delete Error]:', err);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * Clear cache by pattern
 */
export const clearCacheByPattern = (pattern) => {
  return new Promise((resolve, reject) => {
    redisClient.keys(pattern, (err, keys) => {
      if (err) {
        console.error('[Redis Keys Error]:', err);
        reject(err);
      }
      if (keys.length > 0) {
        redisClient.del(keys, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(keys.length);
          }
        });
      } else {
        resolve(0);
      }
    });
  });
};

/**
 * Cache menu items
 */
export const cacheMenuItems = async (items) => {
  try {
    await setCachedValue(CACHE_KEYS.MENU_ITEMS, items, CACHE_EXPIRY.MENU_ITEMS);
  } catch (error) {
    console.error('[Cache Error] Menu items:', error);
  }
};

/**
 * Get cached menu items
 */
export const getCachedMenuItems = async () => {
  try {
    return await getCachedValue(CACHE_KEYS.MENU_ITEMS);
  } catch (error) {
    console.error('[Cache Error] Get menu items:', error);
    return null;
  }
};

/**
 * Cache canteen data
 */
export const cacheCanteenData = async (canteenId, data) => {
  try {
    await setCachedValue(
      `${CACHE_KEYS.CANTEEN_DATA}${canteenId}`,
      data,
      CACHE_EXPIRY.CANTEEN_DATA
    );
  } catch (error) {
    console.error('[Cache Error] Canteen data:', error);
  }
};

/**
 * Get cached canteen data
 */
export const getCachedCanteenData = async (canteenId) => {
  try {
    return await getCachedValue(`${CACHE_KEYS.CANTEEN_DATA}${canteenId}`);
  } catch (error) {
    console.error('[Cache Error] Get canteen data:', error);
    return null;
  }
};

/**
 * Cache user profile
 */
export const cacheUserProfile = async (userId, profile) => {
  try {
    await setCachedValue(
      `${CACHE_KEYS.USER_PROFILE}${userId}`,
      profile,
      CACHE_EXPIRY.USER_PROFILE
    );
  } catch (error) {
    console.error('[Cache Error] User profile:', error);
  }
};

/**
 * Get cached user profile
 */
export const getCachedUserProfile = async (userId) => {
  try {
    return await getCachedValue(`${CACHE_KEYS.USER_PROFILE}${userId}`);
  } catch (error) {
    console.error('[Cache Error] Get user profile:', error);
    return null;
  }
};

/**
 * Cache order status
 */
export const cacheOrderStatus = async (orderId, status) => {
  try {
    await setCachedValue(
      `${CACHE_KEYS.ORDER_STATUS}${orderId}`,
      status,
      CACHE_EXPIRY.ORDER_STATUS
    );
  } catch (error) {
    console.error('[Cache Error] Order status:', error);
  }
};

/**
 * Get cached order status
 */
export const getCachedOrderStatus = async (orderId) => {
  try {
    return await getCachedValue(`${CACHE_KEYS.ORDER_STATUS}${orderId}`);
  } catch (error) {
    console.error('[Cache Error] Get order status:', error);
    return null;
  }
};

/**
 * Cache wallet balance
 */
export const cacheWalletBalance = async (userId, balance) => {
  try {
    await setCachedValue(
      `${CACHE_KEYS.WALLET_BALANCE}${userId}`,
      balance,
      CACHE_EXPIRY.WALLET_BALANCE
    );
  } catch (error) {
    console.error('[Cache Error] Wallet balance:', error);
  }
};

/**
 * Get cached wallet balance
 */
export const getCachedWalletBalance = async (userId) => {
  try {
    return await getCachedValue(`${CACHE_KEYS.WALLET_BALANCE}${userId}`);
  } catch (error) {
    console.error('[Cache Error] Get wallet balance:', error);
    return null;
  }
};

/**
 * Cache dashboard stats
 */
export const cacheDashboardStats = async (stats) => {
  try {
    await setCachedValue(
      CACHE_KEYS.DASHBOARD_STATS,
      stats,
      CACHE_EXPIRY.DASHBOARD_STATS
    );
  } catch (error) {
    console.error('[Cache Error] Dashboard stats:', error);
  }
};

/**
 * Get cached dashboard stats
 */
export const getCachedDashboardStats = async () => {
  try {
    return await getCachedValue(CACHE_KEYS.DASHBOARD_STATS);
  } catch (error) {
    console.error('[Cache Error] Get dashboard stats:', error);
    return null;
  }
};

/**
 * Invalidate all related caches on order update
 */
export const invalidateOrderCaches = async (userId) => {
  try {
    await deleteCacheKey(CACHE_KEYS.DASHBOARD_STATS);
    await deleteCacheKey(`${CACHE_KEYS.USER_PROFILE}${userId}`);
    await deleteCacheKey(`${CACHE_KEYS.WALLET_BALANCE}${userId}`);
  } catch (error) {
    console.error('[Cache Error] Invalidate order caches:', error);
  }
};

/**
 * Invalidate menu cache on menu update
 */
export const invalidateMenuCache = async () => {
  try {
    await deleteCacheKey(CACHE_KEYS.MENU_ITEMS);
    await clearCacheByPattern(`${CACHE_KEYS.CANTEEN_DATA}*`);
  } catch (error) {
    console.error('[Cache Error] Invalidate menu cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
  return new Promise((resolve, reject) => {
    redisClient.info('stats', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Middleware to cache GET requests
 */
export const cacheMiddleware = (cacheKey, expiryTime) => {
  return async (req, res, next) => {
    try {
      const cachedData = await getCachedValue(cacheKey);
      if (cachedData) {
        req.cachedData = cachedData;
        return next();
      }
      // Store original res.json
      const originalJson = res.json.bind(res);
      res.json = function (data) {
        setCachedValue(cacheKey, data, expiryTime).catch(err => {
          console.error('[Cache Middleware Error]:', err);
        });
        return originalJson(data);
      };
      next();
    } catch (error) {
      console.error('[Cache Middleware Error]:', error);
      next();
    }
  };
};

export default redisClient;
