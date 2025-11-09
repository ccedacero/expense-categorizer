# Research Execution Guide

**Purpose:** Step-by-step guide for conducting the Reddit research when web search is available.

---

## 🚀 Quick Start: Priority Searches

Execute these searches first - they'll give you 80% of the insights:

### Priority 1: High-Impact YNAB Searches

```
1. site:reddit.com/r/ynab "bank connection broke" "csv"
2. site:reddit.com/r/ynab "so behind" "categorize"
3. site:reddit.com/r/ynab "amazon" "categorize"
4. site:reddit.com/r/ynab "giving up" "too much work"
5. site:reddit.com/r/ynab "manual import" pain OR tedious OR hate
```

**Expected Findings:**
- 10-15 high-quality pain point quotes
- Time estimates (hours spent categorizing)
- Trigger events (bank connections breaking)
- Problem merchants (Amazon, Target, etc.)

---

### Priority 2: Spreadsheet User "DIY Wall" Searches

```
1. site:reddit.com/r/personalfinance "budget spreadsheet" "manual entry"
2. site:reddit.com/r/googlesheets "bank transactions" categorize automatic
3. site:reddit.com/r/excel "expense categorization" automate
4. "budget spreadsheet" "merchant name" different OR variations
5. site:reddit.com/r/personalfinance VLOOKUP budget categorize
```

**Expected Findings:**
- Technical users hitting complexity limits
- "Dream solution" descriptions
- Failed automation attempts
- Willingness to pay/adopt solutions

---

### Priority 3: Monarch/Tiller Complaints

```
1. site:reddit.com/r/MonarchMoney "categorization" wrong OR issues OR bad
2. site:reddit.com/r/MonarchMoney "still have to review"
3. site:reddit.com/r/Tiller "AutoCat" difficult OR confusing OR hard
4. site:reddit.com/r/MonarchMoney "rules" "not working"
5. site:reddit.com/r/MonarchMoney AI categorization complaints
```

**Expected Findings:**
- Failures of existing "smart" tools
- Rule maintenance burden
- Specific misclassification examples
- Comparison to manual methods

---

## 📋 Data Collection Process

### Step 1: Set Up Tracking Spreadsheet

Create a Google Sheet with these columns:

| Date Found | Source URL | Community | User Quote | Pain Category | Time Mentioned | Emotional Words | Problem Merchant | Upvotes | Notes |
|------------|------------|-----------|------------|---------------|----------------|-----------------|------------------|---------|-------|

### Step 2: Search Methodology

For each search query:

1. **Run the search**
2. **Sort by:** Relevance, then by Recent
3. **Look for:**
   - High upvote posts (indicates common pain)
   - Recent posts (last 6 months)
   - Detailed descriptions (not one-liners)
4. **Save:**
   - Reddit post permalink
   - Direct quote
   - Context (what triggered the pain)

### Step 3: Quote Extraction

**What Makes a Good Quote:**
- ✅ Specific time mentioned ("2 hours every Sunday")
- ✅ Emotional language ("dread", "hate", "overwhelming")
- ✅ Specific merchant problems ("Amazon shows up 10 different ways")
- ✅ Comparison to alternatives ("Mint was better at this")
- ✅ Giving up language ("thinking of quitting YNAB")

**What to Skip:**
- ❌ Generic complaints ("categorization is hard")
- ❌ Posts about other features
- ❌ Downvoted or controversial takes
- ❌ Very old posts (>2 years)

---

## 🎯 Search Query Reference

### Complete YNAB Query List

```
# Pain & Time
site:reddit.com/r/ynab "manual import" "categorizing"
site:reddit.com/r/ynab "how long" "categorize"
site:reddit.com/r/ynab "hours" categorize OR categorization
site:reddit.com/r/ynab "so behind" transactions
site:reddit.com/r/ynab "catching up" categorize

# Emotional Language
site:reddit.com/r/ynab "tedious" categorization
site:reddit.com/r/ynab "hate categorizing"
site:reddit.com/r/ynab "dread" categorize OR reconcile
site:reddit.com/r/ynab "overwhelming" uncategorized
site:reddit.com/r/ynab "boring" categorization

# Technical Problems
site:reddit.com/r/ynab "bank connection broke"
site:reddit.com/r/ynab "csv" import pain OR difficult
site:reddit.com/r/ynab "merchant name" different OR variations
site:reddit.com/r/ynab "amazon" categorize problem
site:reddit.com/r/ynab "target" OR "walmart" split

# Giving Up / Switching
site:reddit.com/r/ynab "giving up" "too much work"
site:reddit.com/r/ynab "quitting" categorize OR manual
site:reddit.com/r/ynab "not worth it" time OR effort
site:reddit.com/r/ynab "switching" categorization
```

### Complete Spreadsheet Query List

```
# DIY Budgeters
site:reddit.com/r/personalfinance "budget spreadsheet" "manual entry"
site:reddit.com/r/spreadsheets "expense tracker" automatic categorization
site:reddit.com/r/googlesheets "bank transactions" categorize
site:reddit.com/r/excel "expense categorization" automate

# Technical Attempts
site:reddit.com/r/googlesheets VLOOKUP budget merchant
site:reddit.com/r/excel "categorize transactions" formula
"google sheets" "budget template" "auto-categorize"
site:reddit.com/r/googlesheets REGEX categorize expenses

# Frustration Points
"budget spreadsheet" "merchant name" variations
site:reddit.com/r/personalfinance "hundreds of transactions" categorize
site:reddit.com/r/spreadsheets "manual entry" "too long"
"budget spreadsheet" "tired of" manual

# Looking for Solutions
site:reddit.com/r/personalfinance "automate" expense categorization
site:reddit.com/r/googlesheets "script" categorize transactions
"budget spreadsheet" AI categorization
site:reddit.com/r/excel "macro" categorize expenses
```

### Complete Monarch/Tiller Query List

```
# Monarch Issues
site:reddit.com/r/MonarchMoney "categorization" wrong
site:reddit.com/r/MonarchMoney "categorization" issues
site:reddit.com/r/MonarchMoney "AI categorization" bad OR terrible
site:reddit.com/r/MonarchMoney "rules" "not working"
site:reddit.com/r/MonarchMoney "still have to review"

# Specific Problems
site:reddit.com/r/MonarchMoney "amazon" categorization
site:reddit.com/r/MonarchMoney "paycheck" transfer
site:reddit.com/r/MonarchMoney "venmo" OR "zelle" categorize
site:reddit.com/r/MonarchMoney "merchant name" changes

# Tiller Issues
site:reddit.com/r/Tiller "AutoCat" setup difficult
site:reddit.com/r/Tiller "AutoCat" confusing
site:reddit.com/r/Tiller "rules" "too complex"
site:reddit.com/r/Tiller "miscategorized"
site:reddit.com/r/Tiller "categorization" manual OR review

# Comparative
site:reddit.com/r/MonarchMoney vs mint categorization
site:reddit.com/r/Tiller vs YNAB categorization
site:reddit.com/r/MonarchMoney "not automatic"
```

---

## 📊 Analysis Framework

### After Collecting 50+ Quotes:

#### 1. Pain Point Frequency Analysis

Count mentions of:
- Time spent (create histogram: 0-15min, 15-30min, 30-60min, 1-2hr, 2hr+)
- Emotional words (count: dread, hate, tedious, boring, overwhelming, etc.)
- Problem merchants (rank by frequency)
- Trigger events (bank broke, new user, bulk import, etc.)

#### 2. Language Pattern Analysis

**Create Word Clouds for:**
- Pain description words
- Desired solution words
- Current workaround descriptions

**Extract Key Phrases:**
- Top 10 most common complaints
- Top 5 "dream solution" descriptions

#### 3. Competitive Gap Analysis

**For Monarch/Tiller:**
- What % of complaints mention "rules"?
- What % mention "still manual review"?
- What specific features are requested?
- How do users compare to YNAB/Mint?

#### 4. Merchant Problem Ranking

Create ranked list:
1. Amazon (count mentions)
2. Target (count mentions)
3. Walmart (count mentions)
4. Venmo/Zelle (count mentions)
5. [Continue...]

**For each merchant, note:**
- Why it's problematic
- What categories it spans
- What users currently do

#### 5. Time-to-Pain Threshold

Identify breaking points:
- How many transactions before "overwhelming"?
- How many hours before "giving up"?
- How many weeks behind before "quitting"?

---

## 🎯 Key Questions to Answer

As you research, explicitly look for answers to these:

### YNAB Users:
- [ ] What % mention bank connection issues?
- [ ] What's the most common time estimate?
- [ ] What banks/credit cards break most often?
- [ ] Do they prefer manual or automatic imports (if working)?
- [ ] What's the #1 reason they consider quitting?

### Spreadsheet Users:
- [ ] What formulas do they try first?
- [ ] At what complexity do they give up?
- [ ] What's their budget for a solution?
- [ ] Do they want a tool or an add-on?
- [ ] Would they pay one-time or subscription?

### Monarch/Tiller Users:
- [ ] How long do they spend on rule setup?
- [ ] How often do rules break?
- [ ] What's the review time per day/week?
- [ ] Do they feel it's better than manual?
- [ ] What would make them switch tools?

---

## 📈 Success Metrics

### Minimum Viable Research:
- [ ] 50 unique quotes collected
- [ ] 20+ mentions of time spent
- [ ] 10+ problem merchants identified
- [ ] 5+ "giving up" posts found
- [ ] 15+ emotional language examples

### Comprehensive Research:
- [ ] 100+ unique quotes
- [ ] 50+ time estimates
- [ ] 20+ problem merchants ranked
- [ ] 10+ competitive comparison posts
- [ ] 25+ Monarch/Tiller complaint posts
- [ ] 10+ spreadsheet "DIY wall" posts
- [ ] 5+ tool switching posts

---

## 💡 Quick Wins: Insights You Can Get in 30 Minutes

If you only have 30 minutes, do this:

1. **Search:** `site:reddit.com/r/ynab "bank connection broke" "csv"`
   - Extract 3-5 pain quotes
   - Note time estimates
   - Identify trigger events

2. **Search:** `site:reddit.com/r/MonarchMoney "categorization" wrong`
   - Extract 3-5 complaints
   - Note specific problems (Amazon, etc.)
   - Identify what they wish it did

3. **Search:** `site:reddit.com/r/personalfinance "budget spreadsheet" "manual entry"`
   - Extract 2-3 "DIY wall" moments
   - Note what automation they tried
   - Identify their "dream solution"

**Result:** You'll have 10-15 quotes covering all three user segments and the core pain points.

---

## 🔄 Ongoing Research

This isn't one-and-done. Set up:

### Weekly Monitoring:

1. **Google Alerts:**
   - "YNAB bank connection broke"
   - "Monarch categorization issues"
   - "budget spreadsheet automation"

2. **Reddit Saved Searches:**
   - Create a multireddit: r/ynab+monarchmoney+tiller+personalfinance
   - Search: "categorize" OR "categorization"
   - Sort by: New
   - Check weekly

3. **Twitter Lists:**
   - Follow budget tool influencers
   - Monitor mentions of categorization pain
   - Track when bank connections break (real-time)

### Monthly Analysis:
- Update pain point frequency
- Track new problem merchants
- Monitor competitive feature releases
- Identify seasonal patterns (tax season, year-end, etc.)

---

## 📝 Reporting Template

### Research Summary Report:

```markdown
# Reddit Research Summary - [Date]

## Executive Summary
- Total posts analyzed: [X]
- Total unique quotes: [X]
- Communities covered: [X]
- Date range: [X] to [X]

## Key Findings

### 1. Time Pain Points
- Median time spent: [X] minutes/hours
- Range: [X] to [X]
- Most common: [X]

### 2. Top Problem Merchants
1. [Merchant] - [X mentions] - [Problem description]
2. [Merchant] - [X mentions] - [Problem description]
3. [Merchant] - [X mentions] - [Problem description]

### 3. Emotional Language
- Most common words: [List top 10]
- Intensity: [Scale 1-10]

### 4. Competitive Gaps
- Monarch: [Key complaint]
- Tiller: [Key complaint]
- YNAB: [Key complaint]

### 5. Dream Solution Patterns
- [Common theme 1]
- [Common theme 2]
- [Common theme 3]

## Best Quotes for Marketing

[Top 10 quotes that capture pain points]

## Recommended Actions

Based on this research:
1. [Product priority]
2. [Marketing message]
3. [Positioning strategy]
```

---

## 🚀 Next Steps

1. **Run Priority 1 searches** (YNAB pain points)
2. **Collect 20 quotes minimum**
3. **Analyze for patterns**
4. **Run Priority 2 searches** (Spreadsheet users)
5. **Run Priority 3 searches** (Monarch/Tiller)
6. **Complete analysis**
7. **Generate summary report**
8. **Update MARKET_RESEARCH.md** with real data

---

**Last Updated:** November 2025
**Status:** Ready to execute when web search is available
**Estimated Time:** 2-3 hours for comprehensive research
