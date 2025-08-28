import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Add Google Fonts for templates
const googleFonts = [
  'Funnel Sans',
  'Outfit', 
  'Newsreader',
  'Tinos'
].join('&family=');

const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${googleFonts}:wght@300;400;500;600;700&display=swap`;

export const metadata: Metadata = {
  title: "Kifolio - Digital Portfolio Platform for Children | Capture Every Milestone",
  description: "Create beautiful digital portfolios for your children. Showcase achievements, creativity, and milestones from first drawing to graduation. Start free, no credit card required.",
  keywords: "digital portfolio, children portfolio, achievement tracking, milestone capture, parent tools, child development, creative portfolio, educational portfolio",
  authors: [{ name: "Kifolio Team" }],
  creator: "Kifolio",
  publisher: "Kifolio",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kifol.io",
    siteName: "Kifolio",
    title: "Kifolio - Digital Portfolio Platform for Children",
    description: "Capture every milestone in beautiful digital portfolios. Free to start, no credit card required.",
    images: [
      {
        url: "https://kifol.io/kifolio_logo_dark.svg",
        width: 144,
        height: 38,
        alt: "Kifolio Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kifolio - Digital Portfolio Platform for Children",
    description: "Capture every milestone in beautiful digital portfolios. Free to start, no credit card required.",
    images: ["https://kifol.io/kifolio_logo_dark.svg"],
  },
  alternates: {
    canonical: "https://kifol.io",
  },
  verification: {
    google: "your-google-verification-code", // Add when you have Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsUrl} rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
