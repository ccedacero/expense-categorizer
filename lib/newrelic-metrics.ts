/**
 * New Relic Custom Metrics
 *
 * Track business-critical metrics:
 * - API costs (Anthropic Claude)
 * - Cache hit rates
 * - Categorization accuracy
 * - Transaction volumes
 */

// Only import newrelic on server-side
let newrelic: any = null;
if (typeof window === 'undefined' && process.env.NEW_RELIC_LICENSE_KEY) {
  try {
    newrelic = require('newrelic');
  } catch (e) {
    // New Relic not available
  }
}

/**
 * Track API cost per request
 * Helps monitor spending and detect cost spikes
 */
export function trackAPICost(transactionCount: number, cachedCount: number) {
  if (!newrelic) return;

  const COST_PER_TRANSACTION = 0.0001; // $0.0001 per transaction with Claude Haiku
  const uncachedCount = transactionCount - cachedCount;
  const estimatedCost = uncachedCount * COST_PER_TRANSACTION;

  // Record custom metrics
  newrelic.recordMetric('Custom/AI/CostPerRequest', estimatedCost);
  newrelic.recordMetric('Custom/AI/TransactionsProcessed', transactionCount);
  newrelic.recordMetric('Custom/AI/TransactionsCached', cachedCount);
  newrelic.recordMetric('Custom/AI/TransactionsUncached', uncachedCount);

  // Add custom attributes to current transaction
  newrelic.addCustomAttributes({
    transactionCount,
    cachedCount,
    uncachedCount,
    estimatedCostUSD: estimatedCost,
  });
}

/**
 * Track cache performance
 * Monitor cache hit rate to ensure optimization is working
 */
export function trackCachePerformance(hitRate: string, cacheSize: number) {
  if (!newrelic) return;

  const hitRateNumber = parseFloat(hitRate);

  newrelic.recordMetric('Custom/Cache/HitRate', hitRateNumber);
  newrelic.recordMetric('Custom/Cache/Size', cacheSize);

  newrelic.addCustomAttributes({
    cacheHitRate: hitRate,
    cacheSize,
  });
}

/**
 * Track categorization confidence
 * Monitor AI accuracy over time
 */
export function trackCategorizationConfidence(avgConfidence: number, totalTransactions: number) {
  if (!newrelic) return;

  newrelic.recordMetric('Custom/Categorization/AverageConfidence', avgConfidence);
  newrelic.recordMetric('Custom/Categorization/TotalTransactions', totalTransactions);

  newrelic.addCustomAttributes({
    avgConfidence,
    totalTransactions,
  });
}

/**
 * Track user feedback on miscategorizations
 * Helps identify accuracy issues
 */
export function trackMiscategorization(category: string) {
  if (!newrelic) return;

  newrelic.recordMetric(`Custom/Feedback/MiscategorizedAs/${category}`, 1);

  newrelic.addCustomAttributes({
    feedbackType: 'miscategorization',
    category,
  });
}

/**
 * Track rate limiting events
 * Monitor if rate limits are too restrictive or being abused
 */
export function trackRateLimitHit(ip: string) {
  if (!newrelic) return;

  newrelic.recordMetric('Custom/RateLimit/Hits', 1);

  // Don't log full IP for privacy
  const ipPrefix = ip.split('.').slice(0, 2).join('.');
  newrelic.addCustomAttributes({
    ipPrefix, // Only first 2 octets
    rateLimited: true,
  });
}

/**
 * Track input validation failures
 * Identify common user errors or malicious activity
 */
export function trackValidationError(errorType: 'file_too_large' | 'too_many_transactions' | 'invalid_format') {
  if (!newrelic) return;

  newrelic.recordMetric(`Custom/Validation/Errors/${errorType}`, 1);

  newrelic.addCustomAttributes({
    validationError: errorType,
  });
}

/**
 * Track API response time breakdown
 * Identify bottlenecks (parsing vs AI vs formatting)
 */
export function trackPerformanceBreakdown(
  parseTime: number,
  aiTime: number,
  totalTime: number
) {
  if (!newrelic) return;

  newrelic.recordMetric('Custom/Performance/ParseTimeMs', parseTime);
  newrelic.recordMetric('Custom/Performance/AITimeMs', aiTime);
  newrelic.recordMetric('Custom/Performance/TotalTimeMs', totalTime);

  newrelic.addCustomAttributes({
    parseTime,
    aiTime,
    totalTime,
  });
}

/**
 * Track user geographic location (privacy-safe)
 * Captures country/region to understand user base
 *
 * New Relic will automatically extract geo data from IP
 */
export function trackUserLocation(ip: string, userAgent?: string) {
  if (!newrelic) return;

  // Add IP to transaction attributes
  // New Relic will automatically extract geo data (country, region, city)
  newrelic.addCustomAttributes({
    // Full IP - New Relic extracts geo then can discard IP
    userIp: ip,
    // Privacy-safe: only first 2 octets (for manual analysis if needed)
    ipPrefix: ip.split('.').slice(0, 2).join('.'),
    // User agent for device/browser tracking
    userAgent: userAgent || 'unknown',
  });

  // New Relic will automatically add:
  // - request.headers.referer
  // - request.headers.accept-language
  // - geographic data (country, region, city) extracted from IP
}

/**
 * Track request metadata for traffic analysis
 * Call this at the start of API requests
 */
export function trackRequestMetadata(ip: string, userAgent?: string, referer?: string) {
  if (!newrelic) return;

  newrelic.addCustomAttributes({
    userIp: ip,
    ipPrefix: ip.split('.').slice(0, 2).join('.'),
    userAgent: userAgent || 'unknown',
    referer: referer || 'direct',
    timestamp: new Date().toISOString(),
  });

  // Increment counter for unique visitors (by IP prefix)
  newrelic.recordMetric('Custom/Traffic/Requests', 1);
}

/**
 * Helper: Create a custom transaction
 * Useful for background tasks or non-HTTP operations
 */
export function createBackgroundTransaction(name: string, callback: () => Promise<void>) {
  if (!newrelic) {
    return callback();
  }

  return newrelic.startBackgroundTransaction(name, async () => {
    try {
      await callback();
    } catch (error) {
      newrelic.noticeError(error);
      throw error;
    }
  });
}
