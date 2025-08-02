import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
  title: "Kifolio - Showcase Your Child's Achievements",
  description: "Create beautiful portfolios to showcase your children's work, milestones and achievements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsUrl} rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
