/**
 * API Route: /api/categorize
 *
 * Endpoint for categorizing transactions
 */

// IMPORTANT: Force Node.js runtime (required for New Relic APM)
// Edge Runtime doesn't support New Relic's Node.js APIs
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { parseTransactions } from '@/lib/parser';
import { categorizeTransactions } from '@/lib/categorizer-improved'; // Using Claude AI with EXPERT rules 🚀
import { detectRecurringTransactions } from '@/lib/recurring-detector';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Use different metrics backend based on environment
// Vercel (serverless) → Simple structured logging
// Local/Self-hosted → NewRelic APM
const isVercel = process.env.VERCEL === '1';
const metrics = isVercel
  ? require('@/lib/vercel-metrics')
  : require('@/lib/newrelic-metrics');

const {
  trackAPICost,
  trackCachePerformance,
  trackCategorizationConfidence,
  trackRateLimitHit,
  trackValidationError,
  trackPerformanceBreakdown,
  trackRequestMetadata,
  trackCSVFormat,
} = metrics;

export async function POST(request: NextRequest) {
  // Extract request metadata for tracking
  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get('user-agent') || undefined;
  const referer = request.headers.get('referer') || undefined;

  // Track request metadata (geographic location, device, source)
  trackRequestMetadata(ip, userAgent, referer);

  // Rate limiting: 10 requests per minute per IP
  const rateLimitResult = rateLimit(ip, 10, 60000);

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);

    // Track rate limiting for monitoring
    trackRateLimitHit(ip);

    return NextResponse.json(
      {
        error: 'rate_limit_exceeded',
        message: 'Too many requests. Please try again in a moment.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
        },
      }
    );
  }

  try {
    const startTime = Date.now();
    const body = await request.json();
    const { input } = body;

    // Validation: Input exists and is a string
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Please provide a string of transaction data.' },
        { status: 400 }
      );
    }

    // Validation: File size limit (5MB text input)
    const MAX_INPUT_SIZE = 5 * 1024 * 1024; // 5MB
    if (input.length > MAX_INPUT_SIZE) {
      trackValidationError('file_too_large');
      return NextResponse.json(
        {
          error: 'File too large',
          message: `Input size is ${(input.length / 1024 / 1024).toFixed(1)}MB. Maximum allowed is 5MB (approximately 1,000 transactions).`,
          suggestion: 'Try splitting your data into smaller files.',
        },
        { status: 413 }
      );
    }

    // Step 1: Parse transactions
    const parseResult = parseTransactions(input);

    if (parseResult.transactions.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid transactions found',
          details: parseResult.errors,
        },
        { status: 400 }
      );
    }

    // Track CSV format/bank type (helps understand user base)
    if (parseResult.format) {
      trackCSVFormat(
        parseResult.format,
        parseResult.hasCategories || false,
        parseResult.transactions.length
      );
    }

    // Validation: Transaction count limit
    const MAX_TRANSACTIONS = 1000;
    if (parseResult.transactions.length > MAX_TRANSACTIONS) {
      trackValidationError('too_many_transactions');
      return NextResponse.json(
        {
          error: 'Too many transactions',
          message: `Found ${parseResult.transactions.length} transactions. Maximum allowed is ${MAX_TRANSACTIONS} per upload.`,
          suggestion: 'Please split your data into smaller batches. For example, categorize one month at a time.',
        },
        { status: 413 }
      );
    }

    const parseTime = Date.now() - startTime;

    // Step 2: Categorize with AI
    const aiStartTime = Date.now();
    const result = await categorizeTransactions(parseResult.transactions);
    const aiTime = Date.now() - aiStartTime;
    const totalTime = Date.now() - startTime;

    // Step 3: Detect recurring transactions & subscriptions
    const recurringAnalysis = await detectRecurringTransactions(result.transactions);

    // Track performance metrics
    trackPerformanceBreakdown(parseTime, aiTime, totalTime);

    // Track cache performance
    if (result.cacheStats) {
      const cachedCount = result.cacheStats.hits || 0;
      trackCachePerformance(result.cacheStats.hitRate, result.cacheStats.size);
      trackAPICost(result.transactions.length, cachedCount);
    }

    // Track categorization confidence
    const avgConfidence = result.transactions.reduce((sum, t) => sum + (t.confidence || 0), 0) / result.transactions.length;
    trackCategorizationConfidence(avgConfidence, result.transactions.length);

    return NextResponse.json(
      {
        success: true,
        ...result,
        recurring: recurringAnalysis, // Add recurring transaction analysis
        parseErrors: parseResult.errors, // Include any parse warnings
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
        },
      }
    );
  } catch (error) {
    // Don't log full error details (may contain sensitive transaction data)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Categorization error:', errorMessage);

    // Provide actionable error messages
    let userMessage = errorMessage;
    let suggestion = 'Please try again. If the problem persists, try with a smaller file.';

    if (errorMessage.includes('API key')) {
      userMessage = 'AI service configuration error';
      suggestion = 'Please contact support. The AI service is temporarily unavailable.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      userMessage = 'Request timeout - file may be too large';
      suggestion = 'Try uploading fewer transactions (under 500 recommended).';
    } else if (errorMessage.includes('rate limit')) {
      userMessage = 'AI service rate limit reached';
      suggestion = 'Please wait a moment and try again.';
    }

    return NextResponse.json(
      {
        error: 'Failed to categorize transactions',
        message: userMessage,
        suggestion,
      },
      { status: 500 }
    );
  }
}
