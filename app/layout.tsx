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
        <div className="app-shell">
          <SiteNav />
          <main className="app-main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
