"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import InputForm from "../components/InputForm";
import ResultsView from "../components/ResultsView";
import TranslatorTool from "../components/TranslatorTool";
import ConfidenceCoach from "../components/ConfidenceCoach";

interface SimilarComplaint { category: string; issue: string; resolvedIn: string; department: string; resolution: string }
interface Result {
  summary: string; professional: string; emotional: string; legal: string;
  department: string; escalation: string[]; evidence: string[];
  priority: string; keywords: string[]; score: number;
  scoreFeedback: string; improvements: string[];
  impact: {
    resolutionLikelihood: "Low" | "Medium" | "High";
    likelihoodReason: string; expectedTimeline: string; timelineCategory: string;
    similarComplaints: SimilarComplaint[];
    successStory: { problem: string; action: string; outcome: string };
  };
  collective: { clusterKeywords: string[]; severityScore: number };
}

type NavTab = "draft" | "translator" | "coach";

const NAV: { key: NavTab; label: string; icon: string }[] = [
  { key: "draft", label: "Civic Draft", icon: "✍️" },
  { key: "translator", label: "Gov Speak Translator", icon: "🔄" },
  { key: "coach", label: "Confidence Coach", icon: "🎯" },
];

export default function Home() {
  const [nav, setNav] = useState<NavTab>("draft");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [formData, setFormData] = useState({ location: "", category: "" });

  async function handleSubmit({ text, location, category }: { text: string; location: string; category: string }) {
    setLoading(true);
    setOriginalText(text);
    setFormData({ location, category });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, location, category }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)" }} />
      </div>

      {/* Top Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid var(--border)", background: "rgba(10,15,26,0.85)", backdropFilter: "blur(16px)", padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 4, height: 56 }}>
          <span className="gradient-text" style={{ fontSize: 18, fontWeight: 800, marginRight: 24, letterSpacing: -0.5 }}>CivicDraft AI</span>
          {NAV.map(n => (
            <button key={n.key}
              onClick={() => setNav(n.key)}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none",
                background: nav === n.key ? "rgba(59,130,246,0.15)" : "transparent",
                color: nav === n.key ? "var(--accent)" : "var(--text-muted)",
                transition: "all 0.2s",
              }}>
              {n.icon} {n.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, padding: "32px 16px" }}>
        {nav === "draft" && (
          result
            ? <ResultsView result={result} originalText={originalText} location={formData.location} category={formData.category} onReset={() => setResult(null)} />
            : <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
                <InputForm onSubmit={handleSubmit} loading={loading} />
              </div>
        )}
        {nav === "translator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>🔄 Government Speak Translator</h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Translate between citizen language and official government language — instantly.</p>
            </div>
            <TranslatorTool />
          </motion.div>
        )}
        {nav === "coach" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>🎯 Civic Confidence Coach</h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Practice filing complaints with a simulated officer, or generate ready-to-use letter templates.</p>
            </div>
            <ConfidenceCoach />
          </motion.div>
        )}
      </div>
    </main>
  );
}
