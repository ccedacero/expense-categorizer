/**
 * New Relic Agent Configuration
 *
 * Monitors application performance, errors, and custom metrics
 * Free tier: 100GB/month, 1 user, 8-day retention
 */

'use strict';

exports.config = {
  /**
   * Application name (can be comma-separated list for multiple names)
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'AI Expense Categorizer'],

  /**
   * License key from New Relic account
   * Get yours at: https://one.newrelic.com/launcher/api-keys-ui.api-keys-launcher
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',

  /**
   * Logging configuration
   */
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
    filepath: 'stdout', // Log to stdout for Vercel/cloud platforms
    enabled: process.env.NEW_RELIC_ENABLED !== 'false',
  },

  /**
   * Distributed tracing for better visibility
   */
  distributed_tracing: {
    enabled: true,
  },

  /**
   * Transaction tracer configuration
   */
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f', // Trace slow transactions
    record_sql: 'off', // No SQL in this app
    explain_threshold: 500,
  },

  /**
   * Error collector configuration
   */
  error_collector: {
    enabled: true,
    ignore_status_codes: [404], // Don't alert on 404s
    capture_events: true,
    max_event_samples_stored: 100,
  },

  /**
   * Browser monitoring (RUM - Real User Monitoring)
   */
  browser_monitoring: {
    enable: true,
  },

  /**
   * Application logging (forwards logs to New Relic)
   */
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
      max_samples_stored: 10000,
    },
    metrics: {
      enabled: true,
    },
    local_decorating: {
      enabled: false, // Vercel handles this
    },
  },

  /**
   * Custom Instrumentation
   */
  custom_insights_events: {
    enabled: true,
    max_samples_stored: 1000,
  },

  /**
   * Ignore specific routes (don't monitor static assets)
   */
  rules: {
    ignore: [
      '^/_next/static',
      '^/_next/image',
      '\\.css$',
      '\\.js$',
      '\\.map$',
      '\\.ico$',
    ],
  },

  /**
   * Allow all response headers
   */
  allow_all_headers: true,

  /**
   * Custom attributes (added to all transactions)
   */
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxy-authorization',
      'request.headers.set-cookie*',
      'request.headers.x-*',
      'response.headers.set-cookie*',
    ],
  },

  /**
   * Disable monitoring if license key is missing
   */
  agent_enabled: !!process.env.NEW_RELIC_LICENSE_KEY,
};
