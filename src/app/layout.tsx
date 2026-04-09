import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SITE_ORIGIN } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const defaultDescription =
  "Build beautiful digital portfolios for your child and students. Track milestones, school projects, sports achievements, and more — free forever. Start in minutes.";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  title: {
    default: "Kifolio — Free Digital Portfolio Platform for Children & Students",
    template: "%s | Kifolio",
  },
  description: defaultDescription,
  keywords:
    "digital portfolio for kids, student portfolio, children portfolio, achievement tracking, milestone capture, parent tools, child development, educational portfolio, Kifolio",
  authors: [{ name: "Kifolio Team" }],
  creator: "Kifolio",
  publisher: "Kifolio",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_ORIGIN,
    siteName: "Kifolio",
    title: "Kifolio — Capture Every Milestone, Build Their Story",
    description:
      "The free digital portfolio built for kids. Showcase artwork, awards, academic milestones, and achievements — all in one beautiful, shareable place.",
    images: [
      {
        url: `${SITE_ORIGIN}/kifolio_logo_dark.svg`,
        width: 144,
        height: 38,
        alt: "Kifolio — free digital portfolio for kids and students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kifolio — Capture Every Milestone, Build Their Story",
    description:
      "The free digital portfolio built for kids. Showcase artwork, awards, academic milestones, and achievements — all in one beautiful, shareable place.",
    images: [`${SITE_ORIGIN}/kifolio_logo_dark.svg`],
  },
  alternates: {
    canonical: SITE_ORIGIN,
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${interTight.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
