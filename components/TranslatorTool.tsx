"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Loader2, BookOpen, Mic, Copy, Check } from "lucide-react";

type Mode = "citizen_to_official" | "official_to_citizen" | "jargon" | "tone_check";

const MODES: { key: Mode; label: string; placeholder: string; icon: string }[] = [
  { key: "citizen_to_official", label: "Citizen → Official", placeholder: "Write your complaint in plain language...", icon: "🏛️" },
  { key: "official_to_citizen", label: "Official → Citizen", placeholder: "Paste a government notice or letter...", icon: "📋" },
  { key: "jargon", label: "Explain Jargon", placeholder: "Paste text with legal/government terms to explain...", icon: "📖" },
  { key: "tone_check", label: "Tone Analyzer", placeholder: "Paste your complaint to analyze its tone...", icon: "🎯" },
];

export default function TranslatorTool() {
  const [mode, setMode] = useState<Mode>("citizen_to_official");
  const [text, setText] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function run() {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, text }),
    });
    setResult(await res.json());
    setLoading(false);
  }

  function copyText(t: string) { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  const currentMode = MODES.find(m => m.key === mode)!;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Mode Tabs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MODES.map(m => (
            <button key={m.key} className={`tab-btn ${mode === m.key ? "active" : ""}`}
              onClick={() => { setMode(m.key); setResult(null); setText(""); }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Input */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <ArrowRightLeft size={15} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>{currentMode.label}</span>
        </div>
        <textarea className="input-field" rows={5} placeholder={currentMode.placeholder}
          value={text} onChange={e => setText(e.target.value)} style={{ resize: "vertical", marginBottom: 12 }} />
        <button className="btn-primary" disabled={!text.trim() || loading} onClick={run}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "9px 20px" }}>
          {loading ? <><Loader2 size={14} className="animate-spin" /> Processing…</> : <><ArrowRightLeft size={14} /> Transform</>}
        </button>
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* citizen_to_official */}
          {mode === "citizen_to_official" && (result as { result?: string; toneAnalysis?: { original: string; improved: string; tips: string[] } }).result && (
            <>
              <div className="glass-accent" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1 }}>✦ Official Version</span>
                  <button onClick={() => copyText((result as { result: string }).result)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{(result as { result: string }).result}</p>
              </div>
              {(result as { toneAnalysis?: { original: string; improved: string; tips: string[] } }).toneAnalysis && (
                <div className="glass" style={{ padding: 16 }}>
                  <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                    <div style={{ fontSize: 13 }}>Before: <span style={{ color: "var(--warning)" }}>{(result as { toneAnalysis: { original: string } }).toneAnalysis.original}</span></div>
                    <div style={{ fontSize: 13 }}>After: <span style={{ color: "var(--success)" }}>{(result as { toneAnalysis: { improved: string } }).toneAnalysis.improved}</span></div>
                  </div>
                  {(result as { toneAnalysis: { tips: string[] } }).toneAnalysis.tips.map((t: string, i: number) => (
                    <div key={i} style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 3 }}>• {t}</div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* official_to_citizen */}
          {mode === "official_to_citizen" && (result as { result?: string }).result && (
            <>
              <div className="glass-accent" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>✦ Plain Language Explanation</div>
                <p style={{ fontSize: 14, lineHeight: 1.8 }}>{(result as { result: string }).result}</p>
              </div>
              {(result as { keyPoints?: string[] }).keyPoints && (
                <div className="glass" style={{ padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Key Points</div>
                  {(result as { keyPoints: string[] }).keyPoints.map((p: string, i: number) => (
                    <div key={i} style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>• {p}</div>
                  ))}
                </div>
              )}
              {(result as { followUpQuestions?: string[] }).followUpQuestions && (
                <div className="glass" style={{ padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Suggested Follow-up Questions</div>
                  {(result as { followUpQuestions: string[] }).followUpQuestions.map((q: string, i: number) => (
                    <div key={i} style={{ fontSize: 13, color: "var(--accent)", marginBottom: 6 }}>
                      <span style={{ color: "var(--text-muted)", marginRight: 6 }}>{i + 1}.</span>{q}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* jargon */}
          {mode === "jargon" && (result as { explanations?: { term: string; simple: string; example: string }[] }).explanations && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(result as { explanations: { term: string; simple: string; example: string }[] }).explanations.map((e, i) => (
                <div key={i} className="glass" style={{ padding: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{e.term}</div>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>{e.simple}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Example: {e.example}</div>
                </div>
              ))}
            </div>
          )}

          {/* tone_check */}
          {mode === "tone_check" && (result as { tone?: string; score?: number; feedback?: string; rewritten?: string; suggestions?: string[] }).tone && (
            <>
              <div className="glass" style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Tone Detected</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--warning)" }}>{(result as { tone: string }).tone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Tone Score</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{(result as { score: number }).score}/100</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>{(result as { feedback: string }).feedback}</p>
                {(result as { suggestions?: string[] }).suggestions?.map((s: string, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 3 }}>• {s}</div>
                ))}
              </div>
              {(result as { rewritten?: string }).rewritten && (
                <div className="glass-accent" style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>✦ Improved Version</div>
                  <p style={{ fontSize: 14, lineHeight: 1.8 }}>{(result as { rewritten: string }).rewritten}</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
