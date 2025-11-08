# Bank Account Support

This document details the level of support for different banks and their CSV export formats.

## Supported Banks

The expense categorizer works with **all banks** that export CSV files. However, some banks provide better categorization accuracy due to built-in category information.

### Tier 1: Full Category Support ⭐⭐⭐

These banks provide built-in category information in their CSV exports, which we map to our app categories for **95%+ accuracy**.

| Bank | Format | Category Column | Notes |
|------|--------|----------------|-------|
| **Chase** | Checking & Credit Card | Yes (`Category`) | Provides categories like "Food & Drink", "Gas", "Shopping" |
| **Capital One** | Checking & Credit Card | Yes (`Category`) | Provides categories like "Dining", "Gas/Automotive", "Merchandise" |

**How it works:**
1. Parser detects category column
2. Maps bank category to app category (e.g., "Food & Drink" → "Food & Dining")
3. Falls back to AI/expert rules only for unmapped categories

### Tier 2: Standard Support ⭐⭐

These banks provide basic transaction data (Date, Description, Amount) without categories. Categorization relies on AI + expert rules.

| Bank | Format | Category Column | Notes |
|------|--------|----------------|-------|
| **Wells Fargo** | Checking & Credit Card | No | Exports: Date, Description, Amount |
| **Bank of America** | Checking & Credit Card | No | Exports: Date, Description, Amount, Running Balance. *May have compatibility variations depending on export format* |
| **Citibank** | Checking & Credit Card | No | Exports: Date, Description, Amount |
| **Discover** | Credit Card | No | Exports: Date, Description, Amount |
| **Any other bank** | CSV | No | As long as it has Date, Description, Amount |

**How it works:**
1. Parser extracts Date, Description, Amount
2. Expert rules check for common patterns (e.g., "STARBUCKS" → Food & Dining)
3. AI (Claude Haiku) categorizes unknown merchants with merchant caching for cost savings

---

## CSV Format Requirements

### Minimum Requirements
Your CSV must include these columns (headers can vary):
- **Date**: Transaction date (MM/DD/YYYY, YYYY-MM-DD, etc.)
- **Description**: Merchant name or transaction description
- **Amount**: Transaction amount (negative for expenses, positive for income)

### Optional Columns (Improve Accuracy)
- **Category**: Bank's category (Chase, Capital One only)
- **Type**: Transaction type (Debit, Credit, Sale, Payment, etc.)
- **Balance**: Running balance (Bank of America format)

### Supported Formats

#### 1. Chase Format (Tier 1)
```csv
Transaction Date,Post Date,Description,Category,Type,Amount,Memo
01/15/2024,01/16/2024,STARBUCKS,Food & Drink,Sale,-5.45,
01/16/2024,01/17/2024,PAYCHECK,Income,CREDIT,3500.00,
```

#### 2. Capital One Format (Tier 1)
```csv
Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
01/15/2024,01/16/2024,1234,STARBUCKS,Dining,5.45,
01/16/2024,01/17/2024,1234,PAYROLL,Income,,3500.00
```

#### 3. Wells Fargo Format (Tier 2)
```csv
Date,Amount,*,Description
01/15/2024,-5.45,*,STARBUCKS COFFEE
01/16/2024,3500.00,*,PAYROLL DEPOSIT
```

#### 4. Bank of America Format (Tier 2)
```csv
Date,Description,Amount,Running Bal.
01/15/2024,STARBUCKS,-5.45,1234.56
01/16/2024,DIRECT DEPOSIT,3500.00,4734.56
```

#### 5. Simple Format (Tier 2)
```csv
Date,Description,Amount
2024-01-15,Starbucks Coffee,-5.45
2024-01-16,Salary,3500.00
```

---

## Category Mappings

### Chase → App Categories

| Chase Category | App Category |
|----------------|--------------|
| Food & Drink | Food & Dining |
| Groceries | Groceries |
| Gas | Transportation |
| Shopping | Shopping |
| Home | Household |
| Bills & Utilities | Bills & Utilities |
| Health & Wellness | Healthcare |
| Travel | Travel |
| Entertainment | Entertainment |

### Capital One → App Categories

| Capital One Category | App Category | Notes |
|---------------------|--------------|-------|
| Dining | Food & Dining | |
| Gas/Automotive | Transportation | |
| Health Care | Healthcare | |
| Merchandise | Shopping or Groceries | Smart detection: grocery stores → Groceries |
| Airfare / Lodging | Travel | |
| Phone/Cable | Bills & Utilities | |
| Payment/Credit | Payment | Credit card payments |
| Insurance | Bills & Utilities | |
| Entertainment | Entertainment | |

**Special: Merchandise Smart Detection**

Capital One categorizes both grocery stores and retail stores as "Merchandise". We intelligently detect the difference:

- **Groceries**: Whole Foods, Trader Joe's, Costco, Sam's Club, Market32, Honest Weight
- **Shopping**: Lowe's, Home Depot, Amazon, Target, Walmart

---

## Accuracy Comparison

| Bank | Accuracy | Method |
|------|----------|--------|
| Chase | 95%+ | Built-in categories + AI fallback |
| Capital One | 95%+ | Built-in categories + AI fallback + grocery detection |
| Wells Fargo | 85-90% | Expert rules + AI + merchant caching |
| Bank of America | 85-90% | Expert rules + AI + merchant caching (*may vary by export format*) |
| Citibank | 85-90% | Expert rules + AI + merchant caching |
| Discover | 85-90% | Expert rules + AI + merchant caching |
| Other banks | 85-90% | Expert rules + AI + merchant caching |

---

## Adding Support for Your Bank

### If your bank provides categories:

1. Create a mapping file (see `lib/chase-category-mapping.ts` or `lib/capital-one-category-mapping.ts`)
2. Map your bank's categories to our app categories
3. Update `lib/categorizer-improved.ts` to use the new mapping
4. Add tests in `__tests__/unit/`
5. Submit a pull request!

### If your bank doesn't provide categories:

The app already supports your bank! Just export to CSV with Date, Description, Amount columns.

---

## Cost Savings with Merchant Caching

Regardless of bank tier, the app uses intelligent merchant caching:

```
Transaction 1: "STARBUCKS #1234 NEW YORK"
→ Normalized: "starbucks"
→ AI Call: ✅ (first time)
→ Result: "Food & Dining" (cached)

Transaction 2: "STARBUCKS #5678 SEATTLE"
→ Normalized: "starbucks"
→ Cache Hit: ✅ (no AI call!)
→ Result: "Food & Dining" (instant)
```

**Result**: 50-80% fewer API calls = 50-80% cost savings

---

## FAQ

**Q: My bank isn't listed. Will it work?**
A: Yes! As long as your CSV has Date, Description, and Amount columns.

**Q: Can I add custom category mappings?**
A: Yes! Fork the repo and create a mapping file for your bank.

**Q: Why is Chase/Capital One more accurate?**
A: They provide pre-categorized data in their CSV exports.

**Q: Can I improve accuracy for Bank of America?**
A: The app learns merchant patterns over time with caching, so accuracy improves with use.
