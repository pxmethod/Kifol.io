import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { OrgAuthProvider } from "@/contexts/OrgAuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kifolio for Organizations",
    template: "%s | Kifolio Orgs",
  },
  description: "Organization workspace for Kifolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${interTight.variable} font-sans antialiased`}
      >
        <OrgAuthProvider>{children}</OrgAuthProvider>
      </body>
    </html>
  );
}
