/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js before the app starts.
 * We use it to initialize New Relic monitoring.
 *
 * CRITICAL: New Relic MUST be loaded synchronously and FIRST before any other modules
 * to properly instrument and trace all application code.
 */

export async function register() {
  // Only run on server-side (Node.js runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only initialize if New Relic license key is set
    if (process.env.NEW_RELIC_LICENSE_KEY) {
      try {
        // MUST use synchronous require() not async import()
        // This ensures New Relic loads FIRST and can instrument all subsequent modules
        require('newrelic');
        console.log('✅ New Relic APM monitoring initialized');
      } catch (error) {
        console.error('❌ Failed to initialize New Relic:', error);
      }
    } else {
      console.log('⚠️  New Relic monitoring disabled (no license key)');
    }
  }
}
