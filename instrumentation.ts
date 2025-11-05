/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js before the app starts.
 * We use it to initialize New Relic monitoring.
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only initialize if New Relic license key is set
    if (process.env.NEW_RELIC_LICENSE_KEY) {
      await import('newrelic');
      console.log('✅ New Relic monitoring initialized');
    } else {
      console.log('⚠️  New Relic monitoring disabled (no license key)');
    }
  }
}
