import Hero from "../components/Hero";
import Link from "next/link";
import { ArrowRight, FileText, Languages, MessageSquareMore } from "lucide-react";

const toolCards = [
  {
    href: "/draft",
    icon: FileText,
    title: "Civic Draft",
    description: "Turn a rough complaint into a formal submission, citizen appeal, and legal-style text — all in one go.",
  },
  {
    href: "/translate",
    icon: Languages,
    title: "Gov Translator",
    description: "Decode dense government language into plain words, or polish your text for official submission.",
  },
  {
    href: "/coach",
    icon: MessageSquareMore,
    title: "Confidence Coach",
    description: "Roleplay with a simulated officer or generate ready-to-file templates for RTIs, appeals, and escalations.",
  },
];

export default function Home() {
  return (
    <main className="page-section page-section--landing">
      <Hero />

      {/* Tool grid */}
      <section className="page-section__block">
        <div className="section-heading">
          <span className="eyebrow">Focused workflows</span>
          <h2>Three tools, one purpose.</h2>
          <p>
            Each tool lives on its own route so you stay in flow — no tab switching, no context loss.
          </p>
        </div>

        <div className="tool-grid">
          {toolCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link key={card.href} href={card.href} className="tool-card glass">
                <div className="tool-card__icon">
                  <Icon size={18} />
                </div>
                <div className="tool-card__body">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <span className="tool-card__link">
                  Open tool <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Banner */}
      <section className="page-section__block">
        <div className="page-banner glass-accent">
          <div style={{ flex: 1 }}>
            <span className="eyebrow">Built for production</span>
            <h2>
              Purpose-built routing, intentional hierarchy, and API-powered AI.
            </h2>
            <p>
              The same AI workflows, now with a product-grade experience — dedicated URLs,
              shared chrome, and a consistent visual system.
            </p>
          </div>

          <div className="page-banner__stats">
            <div>
              <span>3</span>
              <p>Dedicated routes</p>
            </div>
            <div>
              <span>1</span>
              <p>Shared shell</p>
            </div>
            <div>
              <span>Live</span>
              <p>Gemini-powered</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
