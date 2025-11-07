/**
 * Vercel-Friendly Metrics Logging
 *
 * Logs custom metrics to console in a structured format that can be:
 * - Viewed in Vercel deployment logs
 * - Exported to external monitoring (Datadog, LogDNA, etc.)
 * - Processed by log aggregation tools
 */

interface MetricEvent {
  timestamp: string;
  metric: string;
  value: number;
  unit?: string;
  metadata?: Record<string, any>;
}

/**
 * Log a structured metric event
 * These appear in Vercel logs and can be exported to monitoring tools
 */
function logMetric(event: MetricEvent) {
  // Structured JSON logging for easy parsing
  console.log(JSON.stringify({
    type: 'metric',
    ...event,
  }));
}

/**
 * Track API cost per request
 * Helps monitor spending and detect cost spikes
 */
export function trackAPICost(transactionCount: number, cachedCount: number) {
  const COST_PER_TRANSACTION = 0.0001; // $0.0001 per transaction with Claude Haiku
  const uncachedCount = transactionCount - cachedCount;
  const estimatedCost = uncachedCount * COST_PER_TRANSACTION;

  logMetric({
    timestamp: new Date().toISOString(),
    metric: 'ai.cost_per_request',
    value: estimatedCost,
    unit: 'usd',
    metadata: {
      transactionCount,
      cachedCount,
      uncachedCount,
    },
  });

  logMetric({
    timestamp: new Date().toISOString(),
    metric: 'ai.transactions_processed',
    value: transactionCount,
    unit: 'count',
  });
}

/**
 * Track cache performance
 * Monitor cache hit rate to ensure optimization is working
 */
export function trackCachePerformance(hitRate: string, cacheSize: number) {
  const hitRateNumber = parseFloat(hitRate);

  logMetric({
    timestamp: new Date().toISOString(),
    metric: 'cache.hit_rate',
    value: hitRateNumber,
    unit: 'percent',
    metadata: { cacheSize },
  });
}

/**
 * Track categorization confidence
 * Monitor AI accuracy over time
 */
export function trackCategorizationConfidence(avgConfidence: number, totalTransactions: number) {
  logMetric({
    timestamp: new Date().toISOString(),
    metric: 'categorization.average_confidence',
    value: avgConfidence,
    unit: 'percent',
    metadata: { totalTransactions },
  });
}

/**
 * Track performance breakdown
 */
export function trackPerformanceBreakdown(
  parseTime: number,
  aiTime: number,
  totalTime: number
) {
  logMetric({
    timestamp: new Date().toISOString(),
    metric: 'performance.parse_time',
    value: parseTime,
    unit: 'ms',
  });

  logMetric({
    timestamp: new Date().toISOString(),
    metric: 'performance.ai_time',
    value: aiTime,
    unit: 'ms',
  });

  logMetric({
    timestamp: new Date().toISOString(),
    metric: 'performance.total_time',
    value: totalTime,
    unit: 'ms',
  });
}

/**
 * Track rate limiting events
 */
export function trackRateLimitHit(ip: string) {
  const ipPrefix = ip.split('.').slice(0, 2).join('.');

  logMetric({
    timestamp: new Date().toISOString(),
    metric: 'rate_limit.hits',
    value: 1,
    unit: 'count',
    metadata: { ipPrefix },
  });
}

/**
 * Track validation errors
 */
export function trackValidationError(errorType: 'file_too_large' | 'too_many_transactions' | 'invalid_format') {
  logMetric({
    timestamp: new Date().toISOString(),
    metric: `validation.error.${errorType}`,
    value: 1,
    unit: 'count',
  });
}

/**
 * Track request metadata
 */
export function trackRequestMetadata(ip: string, userAgent?: string, referer?: string) {
  const ipPrefix = ip.split('.').slice(0, 2).join('.');

  logMetric({
    timestamp: new Date().toISOString(),
    metric: 'traffic.request',
    value: 1,
    unit: 'count',
    metadata: {
      ipPrefix,
      userAgent: userAgent || 'unknown',
      referer: referer || 'direct',
    },
  });
}

/**
 * Track CSV format/bank type
 * Helps understand which banks users are using
 */
export function trackCSVFormat(format: string, hasCategories: boolean, transactionCount: number) {
  logMetric({
    timestamp: new Date().toISOString(),
    metric: 'csv.format',
    value: 1,
    unit: 'count',
    metadata: {
      format,
      hasCategories,
      transactionCount,
    },
  });
}

/**
 * Summary: View these metrics in Vercel logs
 *
 * To view metrics:
 * 1. Go to Vercel Dashboard > Your Project > Logs
 * 2. Filter by: type="metric"
 * 3. See structured JSON logs
 *
 * To export metrics:
 * - Vercel Log Drains: https://vercel.com/docs/observability/log-drains
 * - Export to: Datadog, New Relic, Logflare, Axiom, etc.
 * - Or use Vercel's built-in Analytics
 */
