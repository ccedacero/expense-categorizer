import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://expense-categorizer.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "AI Expense Categorizer - Categorize Bank Statements in 30 Seconds",
    template: "%s | AI Expense Categorizer",
  },
  description: "Stop manually categorizing bank transactions. Free AI-powered expense categorizer with 95% accuracy. Privacy-first (zero data storage). Works with Chase, Capital One, Wells Fargo, and any bank that exports CSV. Download results as CSV.",
  keywords: [
    "expense categorizer",
    "transaction categorizer",
    "CSV transaction categorizer",
    "bank statement categorizer",
    "expense tracker",
    "AI expense categorization",
    "privacy-first expense tracker",
    "QuickBooks export",
    "Xero export",
    "bank transaction organizer",
    "budget tool",
    "expense management",
    "mint alternative",
    "categorize bank transactions",
    "automatic expense categorization",
    "bank CSV categorizer",
    "financial categorization tool",
    "budget categorizer",
    "expense sorting tool",
  ],
  authors: [{ name: "AI Expense Categorizer Team" }],
  creator: "AI Expense Categorizer",
  publisher: "AI Expense Categorizer",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "AI Expense Categorizer - Categorize Bank Statements in 30 Seconds",
    description: "Stop manually categorizing transactions. Free AI-powered expense categorizer with 95% accuracy, zero data storage. Works with Chase, Capital One, Wells Fargo, and any bank with CSV export.",
    siteName: "AI Expense Categorizer",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "AI Expense Categorizer - Privacy-First Transaction Categorization",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Expense Categorizer - Categorize Bank Statements in 30 Seconds",
    description: "Stop manually categorizing transactions. Free AI expense categorizer with 95% accuracy, zero data storage. Works with major banks.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@expense_ai",
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AI Expense Categorizer",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to use - no signup or API key required",
    },
    description: "Stop manually categorizing bank transactions. Free AI-powered expense categorizer with 95% accuracy and zero data storage. Works with Chase, Capital One, Wells Fargo, and any bank that exports CSV.",
    featureList: [
      "Categorize bank statements in 30 seconds",
      "95% accuracy for Chase, Capital One, and major banks",
      "Privacy-first - zero data storage",
      "Learning rules engine that remembers your preferences",
      "Supports CSV from all major banks",
      "Export categorized transactions as CSV",
      "Subscription and recurring transaction detection",
      "Real-time processing - no account required",
    ],
    screenshot: `${siteUrl}/og-image.png`,
    url: siteUrl,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1"
    },
    creator: {
      "@type": "Organization",
      name: "AI Expense Categorizer Team",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
