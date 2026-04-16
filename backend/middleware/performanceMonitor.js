/**
 * Performance Monitoring Middleware
 */

const performanceMetrics = {
  requests: [],
  queries: [],
  errors: []
};

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  // Store original res.json
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    const duration = Date.now() - startTime;
    const memoryUsed = process.memoryUsage().heapUsed - startMemory;

    const metric = {
      timestamp: new Date(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: duration, // milliseconds
      memoryUsed: (memoryUsed / 1024).toFixed(2), // KB
      userAgent: req.get('user-agent'),
      userId: req.user?._id || 'anonymous',
      ip: req.ip
    };

    performanceMetrics.requests.push(metric);

    // Keep only last 1000 requests
    if (performanceMetrics.requests.length > 1000) {
      performanceMetrics.requests.shift();
    }

    // Log slow requests (>1000ms)
    if (duration > 1000) {
      console.warn('[Slow Request]', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`
      });
    }

    // Log errors
    if (res.statusCode >= 400) {
      performanceMetrics.errors.push({
        timestamp: new Date(),
        statusCode: res.statusCode,
        url: req.originalUrl,
        method: req.method
      });
    }

    return originalJson(data);
  };

  next();
};

/**
 * Database query monitoring
 */
export const monitorDbQuery = (operation, duration, collection) => {
  const metric = {
    timestamp: new Date(),
    operation, // 'find', 'insert', 'update', 'delete'
    duration, // milliseconds
    collection
  };

  performanceMetrics.queries.push(metric);

  // Keep only last 500 queries
  if (performanceMetrics.queries.length > 500) {
    performanceMetrics.queries.shift();
  }

  // Log slow queries (>500ms)
  if (duration > 500) {
    console.warn('[Slow Query]', {
      operation,
      collection,
      duration: `${duration}ms`
    });
  }
};

/**
 * Get performance statistics
 */
export const getPerformanceStats = () => {
  const requests = performanceMetrics.requests;
  const queries = performanceMetrics.queries;

  if (requests.length === 0) {
    return {
      requests: {
        totalRequests: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        errorRate: 0
      },
      queries: {
        totalQueries: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: 0
      },
      memory: {
        avgMemoryUsed: 0,
        totalMemoryUsed: 0
      }
    };
  }

  const totalRequests = requests.length;
  const avgResponseTime = (requests.reduce((sum, r) => sum + r.duration, 0) / totalRequests).toFixed(2);
  const maxResponseTime = Math.max(...requests.map(r => r.duration));
  const minResponseTime = Math.min(...requests.map(r => r.duration));
  const errorCount = performanceMetrics.errors.length;
  const errorRate = ((errorCount / totalRequests) * 100).toFixed(2);

  const avgMemoryUsed = (requests.reduce((sum, r) => sum + parseFloat(r.memoryUsed), 0) / totalRequests).toFixed(2);
  const totalMemoryUsed = requests.reduce((sum, r) => sum + parseFloat(r.memoryUsed), 0).toFixed(2);

  let queryStats = {
    totalQueries: 0,
    avgDuration: 0,
    maxDuration: 0,
    minDuration: 0
  };

  if (queries.length > 0) {
    queryStats = {
      totalQueries: queries.length,
      avgDuration: (queries.reduce((sum, q) => sum + q.duration, 0) / queries.length).toFixed(2),
      maxDuration: Math.max(...queries.map(q => q.duration)),
      minDuration: Math.min(...queries.map(q => q.duration))
    };
  }

  return {
    requests: {
      totalRequests,
      avgResponseTime: `${avgResponseTime}ms`,
      maxResponseTime: `${maxResponseTime}ms`,
      minResponseTime: `${minResponseTime}ms`,
      errorRate: `${errorRate}%`,
      recentErrors: performanceMetrics.errors.slice(-5)
    },
    queries: queryStats,
    memory: {
      avgMemoryUsed: `${avgMemoryUsed}KB`,
      totalMemoryUsed: `${totalMemoryUsed}KB`
    }
  };
};

/**
 * Get recent slow requests
 */
export const getSlowRequests = (threshold = 1000, limit = 10) => {
  return performanceMetrics.requests
    .filter(r => r.duration > threshold)
    .slice(-limit);
};

/**
 * Get recent slow queries
 */
export const getSlowQueries = (threshold = 500, limit = 10) => {
  return performanceMetrics.queries
    .filter(q => q.duration > threshold)
    .slice(-limit);
};

/**
 * Get requests by endpoint
 */
export const getRequestsByEndpoint = () => {
  const endpointStats = {};

  performanceMetrics.requests.forEach(req => {
    const key = `${req.method} ${req.url}`;
    if (!endpointStats[key]) {
      endpointStats[key] = {
        count: 0,
        avgDuration: 0,
        totalDuration: 0,
        errors: 0
      };
    }
    endpointStats[key].count++;
    endpointStats[key].totalDuration += req.duration;
    endpointStats[key].avgDuration = (endpointStats[key].totalDuration / endpointStats[key].count).toFixed(2);

    if (req.statusCode >= 400) {
      endpointStats[key].errors++;
    }
  });

  return endpointStats;
};

/**
 * Get requests by status code
 */
export const getRequestsByStatus = () => {
  const statusStats = {};

  performanceMetrics.requests.forEach(req => {
    const status = req.statusCode;
    if (!statusStats[status]) {
      statusStats[status] = 0;
    }
    statusStats[status]++;
  });

  return statusStats;
};

/**
 * Clear performance metrics
 */
export const clearPerformanceMetrics = () => {
  performanceMetrics.requests = [];
  performanceMetrics.queries = [];
  performanceMetrics.errors = [];
};

/**
 * Export performance metrics
 */
export const exportPerformanceMetrics = () => {
  return {
    generatedAt: new Date(),
    summary: getPerformanceStats(),
    byEndpoint: getRequestsByEndpoint(),
    byStatus: getRequestsByStatus(),
    slowRequests: getSlowRequests(),
    slowQueries: getSlowQueries()
  };
};

/**
 * Performance reporting middleware
 */
export const performanceReportingMiddleware = (req, res, next) => {
  if (req.path === '/api/admin/performance-metrics') {
    const metrics = exportPerformanceMetrics();
    return res.json({
      success: true,
      data: metrics
    });
  }
  next();
};

/**
 * Memory usage monitor
 */
export const getMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  return {
    rss: (memUsage.rss / 1024 / 1024).toFixed(2), // MB
    heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2), // MB
    heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2), // MB
    external: (memUsage.external / 1024 / 1024).toFixed(2), // MB
    arrayBuffers: (memUsage.arrayBuffers / 1024 / 1024).toFixed(2) // MB
  };
};

/**
 * CPU usage monitoring (approximation)
 */
let lastCPUMeasure = process.cpuUsage();

export const getCPUUsage = () => {
  const currentCPUUsage = process.cpuUsage(lastCPUMeasure);
  return {
    userCPU: (currentCPUUsage.user / 1000).toFixed(2), // ms
    systemCPU: (currentCPUUsage.system / 1000).toFixed(2) // ms
  };
};

/**
 * Health check endpoint data
 */
export const getHealthMetrics = () => {
  return {
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: getMemoryUsage(),
    cpu: getCPUUsage(),
    requests: {
      total: performanceMetrics.requests.length,
      errorRate: performanceMetrics.errors.length > 0 
        ? ((performanceMetrics.errors.length / performanceMetrics.requests.length) * 100).toFixed(2) + '%'
        : '0%'
    }
  };
};
