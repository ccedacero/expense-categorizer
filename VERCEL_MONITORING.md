# Vercel Monitoring & Usage Stats Guide

Your app now automatically logs usage stats in a Vercel-friendly format!

## 📊 What Gets Tracked

All your important metrics are logged as structured JSON:

- **AI Costs**: `ai.cost_per_request` - Estimated cost per API call
- **Transactions**: `ai.transactions_processed` - How many transactions processed
- **Cache Performance**: `cache.hit_rate` - Cache efficiency (higher = less AI cost)
- **AI Accuracy**: `categorization.average_confidence` - How confident the AI is
- **Performance**: `performance.parse_time`, `performance.ai_time`, `performance.total_time`
- **Traffic**: `traffic.request` - Request counts and metadata
- **Errors**: `rate_limit.hits`, `validation.error.*`

## 🔍 How to View Your Stats

### Option 1: Vercel Dashboard (Quick View)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Logs** in the sidebar
4. Filter logs:
   ```
   type="metric"
   ```

You'll see structured JSON like:
```json
{
  "type": "metric",
  "timestamp": "2025-11-07T17:49:15.953Z",
  "metric": "ai.cost_per_request",
  "value": 0.0042,
  "unit": "usd",
  "metadata": {
    "transactionCount": 42,
    "cachedCount": 18,
    "uncachedCount": 24
  }
}
```

### Option 2: Vercel CLI (Local Analysis)

```bash
# Install Vercel CLI
npm i -g vercel

# View recent logs
vercel logs

# Filter for metrics
vercel logs | grep "type\":\"metric"

# Export to file for analysis
vercel logs > logs.txt
```

### Option 3: Export to Analytics Platform (Best for Production)

**Vercel Log Drains** - Export logs to external services:

1. **Datadog** (Free tier: 150GB/month)
   - Setup: https://vercel.com/integrations/datadog
   - View metrics in Datadog dashboard
   - Set up alerts for cost spikes

2. **Axiom** (Free tier: 500MB/month)
   - Setup: https://vercel.com/integrations/axiom
   - Query metrics with SQL
   - Create dashboards

3. **Logflare** (Free tier: 12.5GB/month)
   - Setup: https://vercel.com/integrations/logflare
   - Real-time analytics
   - Search and filter logs

4. **Baselime** (Serverless observability)
   - Setup: https://vercel.com/integrations/baselime
   - Built for serverless
   - Auto-detect anomalies

**How to set up Log Drains:**
1. Go to Vercel Dashboard → Your Project → Settings
2. Click **Log Drains**
3. Choose your platform (Datadog, Axiom, etc.)
4. Follow integration steps
5. Metrics will automatically flow to your chosen platform

## 📈 Quick Cost Analysis

**View your AI spending:**

```bash
# Get today's logs
vercel logs | grep "ai.cost_per_request"

# Example output:
# {"type":"metric","metric":"ai.cost_per_request","value":0.0042,"unit":"usd"}
# {"type":"metric","metric":"ai.cost_per_request","value":0.0038,"unit":"usd"}
```

**Calculate total daily cost:**
```bash
# Export logs and sum costs (requires jq)
vercel logs | grep "ai.cost_per_request" | jq '.value' | awk '{sum+=$1} END {print "Total: $" sum}'
```

## 🎯 Built-in Vercel Analytics (Recommended)

Enable these in your Vercel dashboard:

1. **Vercel Analytics**
   - Go to: Your Project → Analytics
   - Click "Enable Analytics"
   - See: Page views, unique visitors, top pages
   - Free tier: 2,500 events/month

2. **Vercel Speed Insights**
   - Go to: Your Project → Speed Insights
   - Click "Enable Speed Insights"
   - See: Core Web Vitals, performance scores
   - 100% free

## 🚨 Set Up Alerts (Recommended)

**Using Log Drains (e.g., Datadog):**

1. Create alert for cost spikes:
   ```
   avg(ai.cost_per_request) > 0.01 over last 5 minutes
   ```

2. Alert for high error rates:
   ```
   count(rate_limit.hits) > 10 over last 1 minute
   ```

3. Alert for low cache hit rate:
   ```
   avg(cache.hit_rate) < 50 over last 30 minutes
   ```

## 📊 Example Queries (Using Axiom/Datadog)

**Total AI cost today:**
```sql
SELECT SUM(value) as total_cost
FROM logs
WHERE metric = 'ai.cost_per_request'
  AND timestamp > now() - interval '1 day'
```

**Cache hit rate over time:**
```sql
SELECT
  date_trunc('hour', timestamp) as hour,
  AVG(value) as avg_hit_rate
FROM logs
WHERE metric = 'cache.hit_rate'
GROUP BY hour
ORDER BY hour DESC
```

**Most expensive requests:**
```sql
SELECT
  metadata.transactionCount,
  metadata.uncachedCount,
  value as cost
FROM logs
WHERE metric = 'ai.cost_per_request'
ORDER BY value DESC
LIMIT 10
```

## 💰 Cost Monitoring Best Practices

1. **Check logs weekly** to spot trends
2. **Monitor cache hit rate** - aim for 60%+ (saves 60% on AI costs!)
3. **Set budget alerts** if using Log Drains
4. **Track user growth** to predict costs

## 🔗 Quick Links

- Vercel Logs: https://vercel.com/docs/observability/runtime-logs
- Log Drains: https://vercel.com/docs/observability/log-drains
- Vercel Analytics: https://vercel.com/analytics
- Speed Insights: https://vercel.com/docs/speed-insights

---

**TL;DR:**
- ✅ All metrics are automatically logged
- ✅ View in Vercel Dashboard → Logs → Filter by `type="metric"`
- ✅ For production: Set up Log Drain to Datadog or Axiom
- ✅ Enable Vercel Analytics for user metrics
