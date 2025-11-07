# CSV Format Tracking

The app now automatically detects and tracks which bank CSV formats are being used!

## 🏦 Detected Formats

The parser automatically detects:

- **wells-fargo** - Wells Fargo bank statements
- **chase** - Chase bank CSV exports (with Category column)
- **capital-one** - Capital One CSV exports (with Debit/Credit columns)
- **generic-csv** - Standard CSV with Date, Description, Amount
- **plain-text** - Tab or comma separated plain text

## 📊 What Gets Tracked

Every time a CSV is processed, we log:

```json
{
  "type": "metric",
  "timestamp": "2025-11-07T18:00:00.000Z",
  "metric": "csv.format",
  "value": 1,
  "unit": "count",
  "metadata": {
    "format": "wells-fargo",
    "hasCategories": false,
    "transactionCount": 42
  }
}
```

## 🔍 How to View CSV Format Stats

### Vercel Dashboard

1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by: `metric="csv.format"`
3. See which banks your users use most

### Vercel CLI

```bash
# See all CSV format events
vercel logs | grep "csv.format"

# Count by format (requires jq)
vercel logs | grep "csv.format" | jq -r '.metadata.format' | sort | uniq -c
```

Example output:
```
  45 wells-fargo
  23 chase
  12 capital-one
   8 generic-csv
```

### With Log Drains (Datadog/Axiom)

**Query to see format distribution:**
```sql
SELECT
  metadata.format as bank,
  COUNT(*) as uploads,
  AVG(metadata.transactionCount) as avg_transactions
FROM logs
WHERE metric = 'csv.format'
GROUP BY metadata.format
ORDER BY uploads DESC
```

**Find users with categories vs without:**
```sql
SELECT
  metadata.hasCategories,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM logs
WHERE metric = 'csv.format'
GROUP BY metadata.hasCategories
```

## 💡 Use Cases

1. **Product prioritization** - Focus on supporting most-used banks better
2. **Feature planning** - Know how many users have built-in categories
3. **Bug tracking** - Identify which bank formats cause the most errors
4. **Growth metrics** - Track adoption by bank over time

## 🎯 Example Insights

You can answer questions like:
- Which bank CSVs are most popular?
- What % of users have bank-provided categories?
- What's the average transaction count by bank?
- Are Wells Fargo users uploading larger files than Chase users?

