import Link from "next/link";

const links = {
  tools: [
    { label: "Civic Draft", href: "/draft" },
    { label: "Gov Translator", href: "/translate" },
    { label: "Confidence Coach", href: "/coach" },
  ],
  resources: [
    { label: "API Health", href: "/api/health" },
    { label: "GitHub", href: "https://github.com/Priyasha-Yadav/PromptWars-x-Global-Prompt-Challenge" },
    { label: "RTI Guide", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.04)",
        background: "linear-gradient(180deg, var(--bg) 0%, rgba(6,11,26,1) 100%)",
        padding: "clamp(44px, 5vw, 60px) 24px 28px",
        position: "relative",
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "15%",
          right: "15%",
          height: 1,
          background: "linear-gradient(90deg, transparent, var(--border-accent), transparent)",
          opacity: 0.2,
        }}
      />

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Main grid */}
        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: 48,
            marginBottom: 44,
          }}
        >
          {/* Brand */}
          <div>
            <span
              className="gradient-text"
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 12,
                display: "inline-block",
                letterSpacing: "-0.02em",
              }}
            >
              CivicDraft AI
            </span>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--text-muted)",
                lineHeight: 1.7,
                marginTop: 10,
                maxWidth: 280,
              }}
            >
              Empowering Indian citizens to file better civic complaints with AI.
              Free, open-source, and built for the public.
            </p>
          </div>

          {/* Tools */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              Tools
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.tools.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="footer-link"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              Resources
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.resources.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="footer-link"
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    l.href.startsWith("http") ? "noopener noreferrer" : undefined
                  }
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            paddingTop: 22,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} CivicDraft AI
          </span>
          <a
            href="https://github.com/Priyasha-Yadav/PromptWars-x-Global-Prompt-Challenge"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            style={{ fontSize: 12.5 }}
          >
            View on GitHub ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
