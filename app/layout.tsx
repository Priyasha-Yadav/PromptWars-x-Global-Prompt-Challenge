import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "CivicDraft AI",
  description: "Transform your complaint into an effective civic representation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }} className="skip-link">Skip to main content</a>
        <div className="app-shell">
          <SiteNav />
          <main id="main-content" className="app-main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
