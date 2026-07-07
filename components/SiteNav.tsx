"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, House, MessagesSquare, PenLine, Sparkles, Languages } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: House },
  { href: "/draft", label: "Draft", icon: PenLine },
  { href: "/translate", label: "Translate", icon: Languages },
  { href: "/coach", label: "Coach", icon: MessagesSquare },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <Link href="/" className="brand-link" aria-label="CivicDraft AI home">
          <span className="brand-mark">C</span>
          <span className="brand-copy">
            <span className="brand-title">CivicDraft AI</span>
            <span className="brand-subtitle">Complaint tools for citizens</span>
          </span>
        </Link>

        <nav className="site-nav__links" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`site-nav__link ${active ? "is-active" : ""}`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link href="/draft" className="site-nav__cta">
          <Sparkles size={15} />
          <span>Start Draft</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </header>
  );
}
