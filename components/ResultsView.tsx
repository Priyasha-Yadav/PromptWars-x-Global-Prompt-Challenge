"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, CheckSquare, Square, RotateCcw, TrendingUp, AlertTriangle } from "lucide-react";
import ImpactPredictor from "./ImpactPredictor";
import CollectiveAction from "./CollectiveAction";

interface SimilarComplaint { category: string; issue: string; resolvedIn: string; department: string; resolution: string }
interface Impact {
  resolutionLikelihood: "Low" | "Medium" | "High";
  likelihoodReason: string;
  expectedTimeline: string;
  timelineCategory: string;
  similarComplaints: SimilarComplaint[];
  successStory: { problem: string; action: string; outcome: string };
}

interface Result {
  summary: string; professional: string; emotional: string; legal: string;
  department: string; escalation: string[]; evidence: string[];
  priority: string; keywords: string[]; score: number;
  scoreFeedback: string; improvements: string[];
  impact: Impact;
  collective: { clusterKeywords: string[]; severityScore: number };
}

interface Props { result: Result; originalText: string; location: string; category: string; onReset: () => void }

const DRAFT_TABS = ["Professional", "Citizen Appeal", "Legal Draft"] as const;
type DraftTab = typeof DRAFT_TABS[number];
const draftKey: Record<DraftTab, keyof Result> = { "Professional": "professional", "Citizen Appeal": "emotional", "Legal Draft": "legal" };

const MAIN_TABS = ["Draft", "Impact Predictor", "Collective Action"] as const;
type MainTab = typeof MAIN_TABS[number];

const scoreColor = (s: number) => s >= 70 ? "var(--success)" : s >= 40 ? "var(--warning)" : "var(--danger)";

function ScoreRing({ score }: { score: number }) {
  const r = 36, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 90, height: 90 }}>
      <svg width={90} height={90} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <motion.circle cx={45} cy={45} r={r} fill="none" stroke={scoreColor(score)} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }} transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(score) }}>{score}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>/100</span>
      </div>
    </div>
  );
}

const fade = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07 } });

export default function ResultsView({ result, originalText, location, category, onReset }: Props) {
  const [mainTab, setMainTab] = useState<MainTab>("Draft");
  const [draftTab, setDraftTab] = useState<DraftTab>("Professional");
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "0 16px 40px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <motion.div {...fade(0)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: 26, fontWeight: 700 }}>CivicDraft AI</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>{result.summary}</p>
        </div>
        <button onClick={onReset} className="btn-primary" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <RotateCcw size={13} /> Start Over
        </button>
      </motion.div>

      {/* Main Tabs */}
      <motion.div {...fade(1)} className="glass" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {MAIN_TABS.map(t => (
            <button key={t} className={`tab-btn ${mainTab === t ? "active" : ""}`} onClick={() => setMainTab(t)}>{t}</button>
          ))}
        </div>
      </motion.div>

      {/* DRAFT TAB */}
      {mainTab === "Draft" && (
        <>
          {/* Before / After */}
          <motion.div {...fade(2)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="glass" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>✦ Original Complaint</div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{originalText}</p>
            </div>
            <div className="glass-accent" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>✦ AI Professional Draft</div>
              <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result.professional}</p>
            </div>
          </motion.div>

          {/* Draft Tabs */}
          <motion.div {...fade(3)} className="glass" style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {DRAFT_TABS.map(t => <button key={t} className={`tab-btn ${draftTab === t ? "active" : ""}`} onClick={() => setDraftTab(t)}>{t}</button>)}
            </div>
            <motion.p key={draftTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {result[draftKey[draftTab]] as string}
            </motion.p>
          </motion.div>

          {/* Score + Priority + Department */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <motion.div {...fade(4)} className="glass" style={{ padding: 18, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Complaint Strength</div>
              <ScoreRing score={result.score} />
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>{result.scoreFeedback}</p>
            </motion.div>
            <motion.div {...fade(5)} className="glass" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Priority Level</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <AlertTriangle size={18} className={`priority-${result.priority}`} />
                <span style={{ fontSize: 20, fontWeight: 700 }} className={`priority-${result.priority}`}>{result.priority}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {result.keywords.map(k => (
                  <span key={k} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(59,130,246,0.15)", color: "var(--accent)", border: "1px solid rgba(59,130,246,0.2)" }}>{k}</span>
                ))}
              </div>
            </motion.div>
            <motion.div {...fade(6)} className="glass" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Responsible Department</div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <Building2 size={18} style={{ color: "var(--accent2)", flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{result.department}</span>
              </div>
            </motion.div>
          </div>

          {/* Improvements */}
          <motion.div {...fade(7)} className="glass" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <TrendingUp size={14} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>How to Strengthen Your Complaint</span>
            </div>
            {result.improvements.map((imp, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ color: "var(--text-muted)" }}>{imp}</span>
              </div>
            ))}
          </motion.div>

          {/* Escalation + Evidence */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <motion.div {...fade(8)} className="glass" style={{ padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Escalation Path</div>
              {result.escalation.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    {i < result.escalation.length - 1 && <div style={{ width: 2, height: 20, background: "var(--border)", margin: "2px 0" }} />}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", paddingTop: 4 }}>{step}</p>
                </div>
              ))}
            </motion.div>
            <motion.div {...fade(9)} className="glass" style={{ padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Evidence Checklist</div>
              {result.evidence.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer", marginBottom: 8 }} onClick={() => setChecked(p => ({ ...p, [i]: !p[i] }))}>
                  {checked[i] ? <CheckSquare size={15} style={{ color: "var(--success)", flexShrink: 0, marginTop: 1 }} /> : <Square size={15} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 1 }} />}
                  <span style={{ fontSize: 13, color: checked[i] ? "var(--text-muted)" : "var(--text)", textDecoration: checked[i] ? "line-through" : "none" }}>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </>
      )}

      {/* IMPACT TAB */}
      {mainTab === "Impact Predictor" && <ImpactPredictor impact={result.impact} />}

      {/* COLLECTIVE TAB */}
      {mainTab === "Collective Action" && (
        <CollectiveAction current={{ text: originalText, location, category, keywords: result.collective.clusterKeywords, severity: result.collective.severityScore }} />
      )}
    </motion.div>
  );
}
