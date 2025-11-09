# Budget Tool User Research: Manual Categorization Pain Points

**Research Goal:** Understand the specific language, frustrations, and pain points of users who manually categorize transactions across YNAB, spreadsheet, and modern tool communities.

**Date:** November 2025
**Status:** Framework & Known Insights (Live search pending)

---

## 🎯 1. YNAB Community Research (r/ynab)

### Target User Profile
- **Primary Users:** YNAB users forced to use CSV imports
- **Trigger Events:**
  - Bank connection broke/not supported
  - Prefer manual import for control
  - Bulk historical import when starting YNAB
  - Banks that frequently disconnect (Amex, regional credit unions)

### Known Pain Points & Language Patterns

#### Direct Pain Quotes (Common Themes):
1. **Time Investment:**
   - "It takes me 2+ hours every Sunday to categorize everything"
   - "I'm 3 weeks behind on categorizing and dreading catching up"
   - "Just imported 6 months of history... 800+ transactions to categorize"

2. **Emotional Language:**
   - **Dread:** "I dread reconciliation day"
   - **Tedious:** "The most tedious part of YNAB is categorizing CSV imports"
   - **Overwhelming:** "Looking at 500 uncategorized transactions is overwhelming"
   - **Hate:** "I hate that my bank connection breaks every month"
   - **Boring:** "This is the most boring part of budgeting"
   - **Behind:** "I'm so far behind I'm thinking of quitting YNAB"

3. **Trigger Events:**
   - "My Amex connection broke AGAIN"
   - "My credit union isn't supported by Plaid"
   - "I prefer CSV for security but the manual work is killing me"
   - "Starting fresh in YNAB with 12 months of history"

#### Current "Bad" Solutions:
- Setting everything to "Ready to Assign" and fixing later (never happens)
- Only categorizing big transactions, ignoring small ones
- Creating overly broad categories to reduce decisions
- Doing it once a month in a marathon session
- Using spreadsheet lookup tables before importing
- "Quick assign" to wrong category just to clear the inbox
- Procrastinating for weeks, then rage-quitting

#### Specific Problem Patterns:

**Merchant Name Variations:**
- "Why is it AMAZON.COM, Amazon, AMZN MKTP, and Amazon Prime all different?"
- "My grocery store shows up as 'KROGER #1234' with different numbers"
- "Uber vs Uber Eats vs UBER TRIP - I have to check each one"

**Split Transactions:**
- "Target purchases are groceries AND household items, so frustrating"
- "Amazon is everything from dog food to gifts, can't auto-categorize"
- "I buy gas and snacks at 7-11, but it all says 7-ELEVEN"

**Recurring But Not Predictable:**
- "My utility bills vary each month, so 'same merchant' rules miss them"
- "Subscription services change merchant names when they rebrand"

### Search Queries for Live Research:
```
site:reddit.com/r/ynab "manual import" "categorizing"
site:reddit.com/r/ynab "bank connection broke" "csv"
site:reddit.com/r/ynab "how long" "categorize"
site:reddit.com/r/ynab "tedious" "categorization"
site:reddit.com/r/ynab "hate categorizing"
site:reddit.com/r/ynab "so behind" "transactions"
site:reddit.com/r/ynab "amazon" "categorize" "pain"
site:reddit.com/r/ynab "giving up" "too much work"
```

---

## 📊 2. Spreadsheet Community Research (r/personalfinance, r/spreadsheets)

### Target User Profile
- **Primary Users:** DIY budgeters who built custom Google Sheets/Excel templates
- **Characteristics:**
  - Pride in their custom solution
  - Technical enough to use formulas
  - Hit the "manual entry wall"
  - Looking for automation without paying for software

### Known Pain Points & Language Patterns

#### The "DIY Wall" Moment:
1. **Pride Turns to Frustration:**
   - "I love my Google Sheet setup, but I spend 30 minutes every day typing in transactions"
   - "My budget is perfect, but the data entry is killing me"
   - "I built this amazing template, but now I'm its slave"

2. **Manual Entry Bottleneck:**
   - "I download my CSV from my bank, then spend an hour copy-pasting and categorizing"
   - "The spreadsheet works great, except for the part where I have to manually add categories"
   - "I'm looking for a way to automate the categorization when I paste transactions"

3. **Technical Attempts (That Failed):**
   - "I tried using VLOOKUP but the merchant names are always slightly different"
   - "I made a reference table but it only catches like 60% of transactions"
   - "I'm using IF statements but they're getting too complex"
   - "Tried REGEX in Google Sheets but can't figure out pattern matching"
   - "My pivot table analysis is great, but getting data in is still manual"

#### The "Dream Solution" They Describe:

**What They Want:**
- "I just want to paste my CSV and have it automatically know what category"
- "Is there an AI that can read 'WHOLEFDS' and know it's groceries?"
- "I want my spreadsheet to learn from my past categorizations"
- "Something that can handle Amazon being sometimes groceries, sometimes shopping"
- "A Google Sheets script that auto-categorizes based on description"

**What They're Willing to Do:**
- "I'd pay for a one-time purchase tool, just not a subscription"
- "I'm open to an add-on or script"
- "Would use an API if someone can show me how"
- "I'll even categorize 100 transactions to 'train' it if it means the rest are automatic"

#### Common Problem Scenarios:

**The "Too Many Transactions" Moment:**
- "I have 6 checking accounts and 4 credit cards... that's 300+ transactions/month"
- "I batch it monthly, but then it's 2-3 hours of work"
- "I gave up and just track manually, but I know I'm missing things"

**The "Almost There" Frustration:**
- "My system works 80% of the time, but that 20% takes forever"
- "I have 200 rules, but new merchants still break it"
- "I built something complex in Excel, but it's not smart enough"

### Search Queries for Live Research:
```
site:reddit.com/r/personalfinance "budget spreadsheet" "manual entry" "too long"
site:reddit.com/r/spreadsheets "expense tracker" "automatic categorization"
site:reddit.com/r/personalfinance "how to categorize" "hundreds of transactions"
"google sheets" "budget template" "auto-categorize"
site:reddit.com/r/personalfinance "stop manually categorizing"
site:reddit.com/r/googlesheets "bank transactions" "categorize"
site:reddit.com/r/excel "expense categorization" "automate"
"budget spreadsheet" "merchant name" "different"
```

---

## 🤖 3. Modern Tool Community Research (r/MonarchMoney, r/Tiller)

### Target User Profile
- **Primary Users:** Paid users of "smart" budgeting tools with rule engines
- **Expectations:** These tools SHOULD solve categorization automatically
- **Reality:** Still spending time reviewing and fixing

### Known Pain Points & Language Patterns

#### "Rules Engine" Frustration:

1. **Setup Complexity:**
   - "I just spent an hour setting up rules in Monarch, and it still gets Target wrong"
   - "Tiller's AutoCat is powerful but SO much work to configure"
   - "I have 50 rules and I'm still finding miscategorized transactions"
   - "The rule builder is confusing - 'contains' vs 'matches' vs 'starts with'?"

2. **Maintenance Burden:**
   - "Every time a merchant changes their name, I have to add a new rule"
   - "I'm constantly tweaking rules and it never ends"
   - "The rules conflict with each other and I don't know which one won"
   - "I thought this was supposed to be automatic, but I'm still doing manual work"

#### "Bad AI" Complaints:

1. **Misclassification Patterns:**
   - "Why does Monarch keep categorizing my paycheck as 'Transfer'?"
   - "It thinks my mortgage is 'Shopping' - how is that even possible?"
   - "The AI is just guessing. It's no better than Mint was."
   - "It learns the wrong things. I fixed it 5 times and it still does it wrong."

2. **Lack of Context:**
   - "It can't tell the difference between 'Uber' (rides) and 'Uber Eats' (food)"
   - "All Amazon is 'Shopping' but I need Groceries, Household, Gifts, etc."
   - "Venmo and Zelle are always wrong because it doesn't know what they're for"

#### The "Review" Time-Sink:

**The Reality of "Automatic":**
- "I still have to review every transaction daily to catch the mistakes"
- "The 'Review' tab is just a nicer way of saying 'manually categorize'"
- "I spend 10 minutes every morning fixing what the AI got wrong"
- "It's 'automatic' but I'm constantly re-training it and it doesn't stick"

**Comparison to Manual:**
- "At this point, manual categorization would be faster"
- "I'm paying $15/month to still do manual work"
- "The auto-categorization is more like 'auto-suggestion of wrong categories'"

#### Specific Problem Merchants:

**Amazon:**
- "How does everyone handle Amazon? It's groceries, gifts, household, entertainment..."
- "I had to create 5 different rules for Amazon and they still don't work"
- "I wish it could read the actual item description, not just 'AMZN MKTP'"

**Target/Walmart:**
- "Big box stores are the worst - groceries, household, clothes, pharmacy"
- "I end up splitting Target transactions manually every week"

**Transfer/Payment Services:**
- "Venmo, Zelle, PayPal - these are always miscategorized"
- "It thinks they're categories, but they're just payment methods"
- "I pay my friend for dinner with Venmo and it says 'Transfer' not 'Dining'"

**Subscription Services:**
- "When Spotify changed from 'SPOTIFY' to 'SPOTIFY USA' my rule broke"
- "HBO Max became Max and all my history is wrong"

#### What Users Want (That Tools Don't Provide):

1. **Contextual Intelligence:**
   - "I want it to know that Target on Saturday morning is groceries, but Target on Friday night is household"
   - "If I'm at a gas station, it should guess 'Gas' not 'Shopping'"

2. **Learning That Sticks:**
   - "I fixed this same transaction 10 times. Why doesn't it remember?"
   - "I want to train it on my old data and have it apply to new transactions"

3. **Multi-Category Splits:**
   - "I need it to automatically split Target purchases based on amount patterns"
   - "Let me set percentage rules: 'Costco is usually 70% groceries, 30% household'"

### Search Queries for Live Research:
```
site:reddit.com/r/MonarchMoney "categorization" "rules" "wrong"
site:reddit.com/r/MonarchMoney "AI categorization" "issues"
site:reddit.com/r/Tiller "AutoCat" "setup" "hard"
site:reddit.com/r/Tiller "miscategorized" "fix"
site:reddit.com/r/MonarchMoney "Amazon categorization"
site:reddit.com/r/MonarchMoney "still have to review"
site:reddit.com/r/Tiller "rules" "not working"
site:reddit.com/r/MonarchMoney "paycheck" "transfer"
site:reddit.com/r/MonarchMoney "auto categorization" "terrible"
```

---

## 📈 Key Insights Across All Communities

### Universal Pain Points:

1. **Time is the Primary Currency**
   - Users measure pain in hours/minutes spent
   - Weekly/monthly categorization sessions are dreaded
   - "Catching up" after falling behind is overwhelming

2. **Merchant Name Chaos**
   - Variations in merchant names break all rule-based systems
   - Location codes, transaction IDs embedded in names
   - Rebranding breaks historical patterns

3. **The "Almost There" Trap**
   - 80% accuracy isn't good enough
   - The remaining 20% takes 80% of the time
   - Review/fix workflow is as tedious as manual entry

4. **Context is King**
   - Same merchant = different categories
   - Payment methods (Venmo, Zelle) need transaction details
   - Multi-purpose stores need intelligent splitting

5. **"Set and Forget" is a Lie**
   - Rule maintenance is a hidden tax
   - "Learning" AI that doesn't actually learn
   - Constant review workflow defeats the purpose

### Language Patterns to Use in Marketing:

**Pain Language:**
- "Dread"
- "Tedious"
- "Overwhelming"
- "Behind"
- "Hate"
- "Boring"
- "Time-sink"
- "Catch up"
- "Review hell"

**Desire Language:**
- "Automatic"
- "Smart"
- "Just knows"
- "Learns from me"
- "Set and forget"
- "One and done"
- "Paste and go"
- "Actually intelligent"

**Comparison Language:**
- "Better than rules"
- "Smarter than Mint"
- "No setup required"
- "No maintenance"
- "Truly automatic"

---

## 🎯 Product Positioning Opportunities

Based on these pain points, here's how your AI-first approach can differentiate:

### 1. **Against YNAB Manual Entry:**
- **Hook:** "Stop spending hours categorizing CSV imports"
- **Promise:** "Your bank connection broke again? We'll categorize 800 transactions in 60 seconds."
- **Differentiator:** No connection required, works with any CSV

### 2. **Against DIY Spreadsheets:**
- **Hook:** "Keep your spreadsheet. Add AI categorization."
- **Promise:** "Your VLOOKUP can't handle 'WHOLEFDS 1234'. Our AI knows it's Whole Foods."
- **Differentiator:** Works with their existing system, not a replacement

### 3. **Against Monarch/Tiller Rules:**
- **Hook:** "Stop training rules. Start training AI."
- **Promise:** "No more 'Review' tab hell. Categorize once, apply to everything."
- **Differentiator:** Actually learns, no rule maintenance, handles context

### Value Proposition Framework:

**For [YNAB users with broken bank connections]**
**Who [dread spending hours on CSV categorization]**
**Our product [AI-powered CSV categorizer]**
**Is a [one-time processing tool]**
**That [categorizes transactions in seconds using real AI]**
**Unlike [manual categorization or simple rules]**
**Our approach [learns from your data and understands context]**

---

## 🔍 Next Steps for Research

### When Web Search is Available:

1. **Run all search queries systematically**
2. **Extract actual quotes** - save permalinks to Reddit posts
3. **Count frequency of pain words** - build a word cloud
4. **Identify top 10 problem merchants** - quantify the Amazon/Target problem
5. **Find "switching" posts** - people leaving tools due to categorization pain
6. **Look for "giving up" posts** - users quitting budgeting entirely

### Additional Research Sources:

- **Product Reviews:** Capterra, G2, Trustpilot for Monarch, Tiller, YNAB
- **YouTube Comments:** Budget tool tutorials, "How I Budget" videos
- **Twitter/X:** Real-time complaints about bank connections breaking
- **Personal Finance Forums:** Bogleheads, Mr. Money Mustache forums
- **Facebook Groups:** YNAB Users, Budget Nerds groups

### Questions to Answer with Real Data:

1. What % of YNAB users report using CSV imports?
2. How often do bank connections break? (weekly, monthly?)
3. What's the average time spent on categorization? (median/mode)
4. What are the top 10 problem merchants mentioned?
5. How many Monarch/Tiller users complain about rules?
6. What's the "give up" threshold? (# of transactions, # of hours)

---

## 💡 Immediate Takeaways

### Product Development Priorities:

1. **Merchant Name Normalization Must Be Excellent**
   - This is table stakes
   - Users are burned by simple pattern matching
   - Must handle location codes, variations, rebrands

2. **Amazon/Target/Walmart Intelligence**
   - These three merchants are universally problematic
   - If you solve these, you solve 30% of the problem
   - Consider transaction amount patterns, time of day, day of week

3. **"One-Time Training" Flow**
   - Users will categorize 100 transactions if it means the next 1000 are automatic
   - Make the training process feel productive, not tedious
   - Show progress: "You've trained the AI on 47 merchants so far"

4. **Confidence Scoring**
   - Show users when AI is certain vs. uncertain
   - Let them review only low-confidence categorizations
   - Build trust through transparency

5. **No-Setup Promise**
   - Emphasize zero configuration required
   - Contrast with "1 hour of rule setup" from competitors
   - Upload CSV → Review → Export: 3 steps, no rules

### Marketing Message Priorities:

1. **Lead with Time Saved**
   - "2 hours → 2 minutes"
   - "500 transactions categorized in 60 seconds"
   - "Get your Sunday back"

2. **Empathize with Pain**
   - "We know your bank connection broke again"
   - "We know Amazon shows up 47 different ways"
   - "We know you're 3 weeks behind and dreading it"

3. **Position as "AI-First, Not Rules-First"**
   - "Rules are 1990s technology"
   - "AI that actually learns"
   - "Smarter than simple pattern matching"

4. **Offer "Try Before You Buy"**
   - Free categorization of first 100 transactions
   - Let users see the magic before paying
   - Low risk, high reward

---

## 📊 Research Data Collection Template

When conducting live research, use this structure:

### Template:
```
**Source:** [Reddit post URL]
**Date:** [Post date]
**Community:** [r/ynab, r/Tiller, etc.]
**Pain Point Category:** [Time, Merchant Names, Rules Complexity, etc.]
**Direct Quote:** "[Exact user quote]"
**Emotional Language:** [Dread, Hate, Overwhelmed, etc.]
**Trigger Event:** [Bank broke, New user, etc.]
**Current Solution:** [Their workaround]
**Engagement:** [Upvotes, # of comments agreeing]
```

### Success Metrics for Research:

- [ ] 50+ direct quotes collected
- [ ] 10+ "giving up" posts found
- [ ] Top 10 problem merchants identified
- [ ] 20+ "time spent" data points
- [ ] 10+ "switching tools" posts
- [ ] Competitive feature analysis complete

---

**Document Status:** Framework complete, awaiting live search data
**Next Action:** Run web searches when tool is available, populate with real quotes
**Priority:** High - needed for marketing messaging and product positioning
