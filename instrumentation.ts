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
  // Check if we're in a Node.js environment (not browser, not edge)
  if (typeof window === 'undefined') {
    const runtime = process.env.NEXT_RUNTIME;

    console.log(`[Instrumentation] Runtime: ${runtime || 'nodejs (default)'}`);
    console.log(`[Instrumentation] New Relic Key: ${process.env.NEW_RELIC_LICENSE_KEY ? 'SET' : 'NOT SET'}`);

    // Initialize New Relic if:
    // 1. We have a license key
    // 2. We're in Node.js runtime (not Edge)
    if (process.env.NEW_RELIC_LICENSE_KEY) {
      // Only initialize on Node.js runtime (Edge Runtime doesn't support New Relic)
      if (!runtime || runtime === 'nodejs') {
        try {
          // MUST use synchronous require() not async import()
          // This ensures New Relic loads FIRST and can instrument all subsequent modules
          require('newrelic');
          console.log('✅ New Relic APM monitoring initialized');
        } catch (error) {
          console.error('❌ Failed to initialize New Relic:', error);
        }
      } else {
        console.log(`⚠️  New Relic skipped: Edge Runtime detected (runtime=${runtime})`);
        console.log('   → To enable New Relic, add: export const runtime = "nodejs" to your API routes');
      }
    } else {
      console.log('⚠️  New Relic monitoring disabled (no license key found)');
      console.log('   → Set NEW_RELIC_LICENSE_KEY in your environment variables');
    }
  }
}
