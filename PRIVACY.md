# Privacy Policy

**Last Updated:** January 2025

## Overview

AI Expense Categorizer is committed to protecting your financial data privacy. This document explains how we handle your transaction data.

## Data Collection

### What We Collect
- **Transaction data** you upload (dates, descriptions, amounts)
- **IP address** for rate limiting (prevents abuse)
- **Usage statistics** (anonymous - number of transactions processed, cache hit rates)

### What We DON'T Collect
- ❌ No user accounts or personal information
- ❌ No cookies or tracking pixels
- ❌ No persistent storage of your transactions
- ❌ No email addresses or contact information

## Data Processing

### How Your Data is Used

1. **AI Categorization**
   - Your transaction descriptions are sent to Anthropic's Claude AI API
   - Claude processes the data to assign categories
   - Anthropic's data usage policy: [https://www.anthropic.com/legal/consumer-terms](https://www.anthropic.com/legal/consumer-terms)

2. **Merchant Caching**
   - Merchant patterns (e.g., "Starbucks") are cached temporarily
   - Only merchant names are cached, NOT amounts or full descriptions
   - Cache is in-memory and resets on server restart

3. **Rate Limiting**
   - IP addresses stored temporarily (60 minutes)
   - Prevents API abuse and protects service costs
   - Cleared automatically every hour

### Data Retention

- **Real-time Processing Only:** Your transactions are NOT stored in any database
- **Session Only:** Data exists only during active categorization request
- **No Persistence:** All data is deleted immediately after results are returned
- **Cache Expiry:** Merchant cache expires after 1 hour of inactivity

## Third-Party Services

### Anthropic Claude AI
- **Purpose:** AI-powered transaction categorization
- **Data Shared:** Transaction descriptions and amounts
- **Privacy Policy:** [https://www.anthropic.com/legal/privacy](https://www.anthropic.com/legal/privacy)
- **Note:** Anthropic may use data to improve their AI models per their terms

### Vercel Hosting (if deployed)
- **Purpose:** Web hosting and serverless functions
- **Data Shared:** Request metadata (IP, timestamps)
- **Privacy Policy:** [https://vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy)

## Security Measures

### Data Protection
- ✅ All communication encrypted via HTTPS/TLS
- ✅ No persistent database (stateless architecture)
- ✅ Rate limiting prevents abuse
- ✅ Input validation prevents malicious uploads
- ✅ Server logs sanitized (no sensitive data logged)

### What We DON'T Do
- ❌ Never sell or share your data with third parties
- ❌ Never store your transactions after processing
- ❌ Never use your data for marketing
- ❌ Never share data across users

## Your Rights

### Data Control
- **Right to Access:** Since we don't store data, there's nothing to access
- **Right to Delete:** Data is automatically deleted after each request
- **Right to Port:** Download your categorized results anytime
- **Right to Opt-Out:** Simply don't use the service

### Consent
By using AI Expense Categorizer, you consent to:
1. Sending your transaction data to Anthropic's Claude AI API
2. Temporary caching of merchant patterns for performance
3. IP-based rate limiting for abuse prevention

## Compliance

### GDPR (EU Users)
- **Lawful Basis:** Legitimate interest (service operation)
- **Data Minimization:** Only collect what's necessary
- **Purpose Limitation:** Only used for categorization
- **Storage Limitation:** No long-term storage
- **Right to Erasure:** Automatic (nothing persists)

### CCPA (California Users)
- **No Sale of Data:** We never sell personal information
- **No Sharing:** Data not shared with third parties (except AI provider)
- **Notice at Collection:** This privacy policy
- **Right to Know:** Covered in this document

## Children's Privacy

This service is not intended for users under 13 years old. We do not knowingly collect data from children.

## Changes to Privacy Policy

We may update this policy occasionally. Check the "Last Updated" date at the top. Continued use after changes constitutes acceptance.

## Contact & Questions

For privacy concerns or questions:
- **GitHub Issues:** [Report privacy concerns](https://github.com)
- **Email:** [Your contact email for privacy inquiries]

## Transparency

### Open Source
This project is open source. You can audit the code to verify:
- No hidden tracking
- No unauthorized data collection
- No persistent storage

### What You Can Verify
1. View `app/api/categorize/route.ts` - No database writes
2. View `lib/merchant-cache.ts` - In-memory cache only
3. View `lib/rate-limit.ts` - Temporary IP storage

## Best Practices for Users

### Protect Your Privacy
- ✅ Remove account numbers from CSVs before upload
- ✅ Use only recent transactions (don't upload entire history)
- ✅ Download results immediately, then clear browser
- ⚠️ Avoid uploading on public WiFi
- ⚠️ Close browser tab after use

### What to Upload
- ✅ Date, description, amount (minimal data)
- ❌ Don't include: SSN, account numbers, card numbers

## Disclaimer

This is a demo/educational project. For production use with sensitive financial data, consider:
- Self-hosting to maintain full control
- Adding encryption at rest
- Implementing audit logs
- Regular security assessments

---

**By using AI Expense Categorizer, you acknowledge that you have read and understood this Privacy Policy.**
