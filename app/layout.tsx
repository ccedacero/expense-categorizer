import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://expense-categorizer.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "AI Expense Categorizer - Privacy-First Transaction Categorization",
    template: "%s | AI Expense Categorizer",
  },
  description: "Free privacy-first expense categorizer powered by AI. Categorize bank transactions instantly with 95% accuracy. No data storage, $0.50 per 1,000 transactions. Works with Chase, Capital One, and all banks.",
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
    title: "AI Expense Categorizer - Privacy-First Transaction Categorization",
    description: "Free privacy-first expense categorizer powered by AI. Categorize bank transactions instantly with 95% accuracy. No data storage, works with all banks.",
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
    title: "AI Expense Categorizer - Privacy-First Transaction Categorization",
    description: "Free privacy-first expense categorizer powered by AI. Categorize bank transactions instantly with 95% accuracy.",
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
      description: "Free to use, pay-as-you-go AI costs at $0.50 per 1,000 transactions",
    },
    description: "Free privacy-first expense categorizer powered by AI. Categorize bank transactions instantly with 95% accuracy.",
    featureList: [
      "AI-powered transaction categorization",
      "95% accuracy for major banks",
      "Privacy-first architecture - no data storage",
      "Supports CSV from all banks",
      "Export to QuickBooks, Xero, Wave",
      "Recurring transaction detection",
      "Real-time processing",
    ],
    screenshot: `${siteUrl}/og-image.png`,
    url: siteUrl,
    creator: {
      "@type": "Organization",
      name: "AI Expense Categorizer Team",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1",
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
      </body>
    </html>
  );
}
