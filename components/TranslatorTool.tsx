"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, Loader2, Copy, Check, Sparkles, MessageSquare, BookOpen, Target } from "lucide-react";

type Mode = "citizen_to_official" | "official_to_citizen" | "jargon" | "tone_check";

const MODES: { key: Mode; label: string; placeholder: string; icon: React.ReactNode; desc: string }[] = [
  {
    key: "citizen_to_official",
    label: "Citizen → Official",
    placeholder: "Write your complaint in plain language...\n\nExample: The road near my house has a big pothole that has been there for 3 months and nobody is fixing it.",
    icon: <Sparkles size={15} />,
    desc: "Rewrite your complaint in formal government language",
  },
  {
    key: "official_to_citizen",
    label: "Official → Citizen",
    placeholder: "Paste a government notice or letter...\n\nExample: Your application has been rejected due to non-compliance with Section 14(2) of the Municipal Act.",
    icon: <MessageSquare size={15} />,
    desc: "Decode government notices into plain language",
  },
  {
    key: "jargon",
    label: "Explain Jargon",
    placeholder: "Paste text containing legal or government terms...\n\nExample: The encroachment on public land is subject to jurisdiction of the municipal authority under the relevant tender process.",
    icon: <BookOpen size={15} />,
    desc: "Explain legal and bureaucratic terms simply",
  },
  {
    key: "tone_check",
    label: "Tone Analyzer",
    placeholder: "Paste your complaint to analyze its tone...\n\nExample: This is absolutely ridiculous! Nobody cares about us citizens and the roads are a complete disaster!",
    icon: <Target size={15} />,
    desc: "Check if your complaint tone is effective",
  },
];

type TranslateResult = {
  result?: string;
  toneAnalysis?: { original: string; improved: string; tips: string[] };
  keyPoints?: string[];
  followUpQuestions?: string[];
  explanations?: { term: string; simple: string; example: string }[];
  tone?: string;
  score?: number;
  feedback?: string;
  rewritten?: string;
  suggestions?: string[];
};

export default function TranslatorTool() {
  const [mode, setMode] = useState<Mode>("citizen_to_official");
  const [text, setText] = useState("");
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function run() {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, text }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function copyText(t: string) {
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const currentMode = MODES.find(m => m.key === mode)!;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Mode selector */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {MODES.map(m => (
          <button key={m.key}
            onClick={() => { setMode(m.key); setResult(null); setText(""); }}
            style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
              borderRadius: 14, cursor: "pointer", textAlign: "left",
              border: `1px solid ${mode === m.key ? "rgba(59,130,246,.35)" : "rgba(148,163,184,.1)"}`,
              background: mode === m.key
                ? "linear-gradient(135deg, rgba(59,130,246,.14), rgba(139,92,246,.1))"
                : "rgba(15,22,40,.7)",
              transition: "all 0.2s",
              boxShadow: mode === m.key ? "0 0 20px rgba(59,130,246,.1)" : "none",
            }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0,
              background: mode === m.key ? "rgba(59,130,246,.2)" : "rgba(255,255,255,.04)",
              color: mode === m.key ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${mode === m.key ? "rgba(59,130,246,.25)" : "rgba(255,255,255,.06)"}`,
            }}>
              {m.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: mode === m.key ? "var(--text)" : "var(--text-muted)", marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{m.desc}</div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Input + Transform */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ color: "var(--accent)" }}>{currentMode.icon}</div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{currentMode.label}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4 }}>— {currentMode.desc}</span>
        </div>
        <textarea className="input-field" rows={6} placeholder={currentMode.placeholder}
          value={text} onChange={e => setText(e.target.value)}
          style={{ resize: "vertical", marginBottom: 14, lineHeight: 1.7 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn-primary" disabled={!text.trim() || loading} onClick={run}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 22px" }}>
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Processing…</>
              : <><ArrowRightLeft size={14} /> Transform</>}
          </button>
          {text && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{text.length} characters</span>
          )}
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* citizen_to_official */}
            {mode === "citizen_to_official" && result.result && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="glass" style={{ padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                      ✦ Original
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{text}</p>
                  </div>
                  <div className="glass-accent" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1 }}>✦ Official Version</span>
                      <button onClick={() => copyText(result.result!)}
                        aria-label="Copy official version"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 8px", borderRadius: 6, transition: "color 0.2s" }}>
                        {copied ? <><Check size={12} style={{ color: "var(--success)" }} /> Copied</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{result.result}</p>
                  </div>
                </div>
                {result.toneAnalysis && (
                  <div className="glass" style={{ padding: 16, display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Before</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warning)", padding: "3px 10px", borderRadius: 20, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.2)" }}>{result.toneAnalysis.original}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", color: "var(--text-muted)", paddingTop: 18 }}>→</div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>After</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--success)", padding: "3px 10px", borderRadius: 20, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.2)" }}>{result.toneAnalysis.improved}</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      {result.toneAnalysis.tips.map((t, i) => (
                        <div key={i} style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "flex", gap: 6 }}>
                          <span style={{ color: "var(--accent)", flexShrink: 0 }}>•</span> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* official_to_citizen */}
            {mode === "official_to_citizen" && result.result && (
              <>
                <div className="glass-accent" style={{ padding: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>✦ Plain Language Explanation</div>
                  <p style={{ fontSize: 14, lineHeight: 1.8 }}>{result.result}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {result.keyPoints && (
                    <div className="glass" style={{ padding: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--text)" }}>Key Points</div>
                      {result.keyPoints.map((p, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                          <span style={{ color: "var(--success)", flexShrink: 0, fontWeight: 700 }}>✓</span> {p}
                        </div>
                      ))}
                    </div>
                  )}
                  {result.followUpQuestions && (
                    <div className="glass" style={{ padding: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--text)" }}>Suggested Follow-up Questions</div>
                      {result.followUpQuestions.map((q, i) => (
                        <div key={i} style={{ fontSize: 13, color: "var(--accent)", marginBottom: 8, display: "flex", gap: 8 }}>
                          <span style={{ color: "var(--text-muted)", flexShrink: 0, fontWeight: 600 }}>{i + 1}.</span> {q}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* jargon */}
            {mode === "jargon" && result.explanations && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {result.explanations.map((e, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="glass" style={{ padding: 18 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent)", marginBottom: 8, fontFamily: "var(--font-display)" }}>{e.term}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 10, color: "var(--text)" }}>{e.simple}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,.03)", border: "1px solid var(--border)" }}>
                      Example: {e.example}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* tone_check */}
            {mode === "tone_check" && result.tone && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12 }}>
                  <div className="glass" style={{ padding: 20, minWidth: 160, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Tone Score</div>
                    <div style={{ fontSize: 42, fontWeight: 900, color: (result.score ?? 0) >= 70 ? "var(--success)" : (result.score ?? 0) >= 40 ? "var(--warning)" : "var(--danger)", lineHeight: 1 }}>{result.score}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>/100</div>
                    <span style={{ fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "rgba(245,158,11,.12)", color: "var(--warning)", border: "1px solid rgba(245,158,11,.2)" }}>{result.tone}</span>
                  </div>
                  <div className="glass" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>Analysis</div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.7 }}>{result.feedback}</p>
                    {result.suggestions?.map((s, i) => (
                      <div key={i} style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 5, display: "flex", gap: 7 }}>
                        <span style={{ color: "var(--accent)", flexShrink: 0 }}>→</span> {s}
                      </div>
                    ))}
                  </div>
                </div>
                {result.rewritten && (
                  <div className="glass-accent" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1 }}>✦ Improved Version</span>
                      <button onClick={() => copyText(result.rewritten!)}
                        aria-label="Copy improved version"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                        {copied ? <><Check size={12} style={{ color: "var(--success)" }} /> Copied</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.8 }}>{result.rewritten}</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
