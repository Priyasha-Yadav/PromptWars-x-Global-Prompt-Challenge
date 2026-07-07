"use client";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Lightbulb, BookOpen } from "lucide-react";

interface SimilarComplaint {
  category: string;
  issue: string;
  resolvedIn: string;
  department: string;
  resolution: string;
}

interface Impact {
  resolutionLikelihood: "Low" | "Medium" | "High";
  likelihoodReason: string;
  expectedTimeline: string;
  timelineCategory: string;
  similarComplaints: SimilarComplaint[];
  successStory: { problem: string; action: string; outcome: string };
}

const likelihoodColor = { Low: "var(--danger)", Medium: "var(--warning)", High: "var(--success)" };
const fade = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1 } });

export default function ImpactPredictor({ impact }: { impact: Impact }) {
  const lc = likelihoodColor[impact.resolutionLikelihood];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Resolution Likelihood + Timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <motion.div {...fade(0)} className="glass" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <TrendingUp size={15} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Estimated AI Prediction</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: lc, marginBottom: 6 }}>{impact.resolutionLikelihood}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Resolution Likelihood</div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{impact.likelihoodReason}</p>
        </motion.div>

        <motion.div {...fade(1)} className="glass" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Clock size={15} style={{ color: "var(--accent2)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Expected Timeline</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent2)", marginBottom: 6 }}>{impact.expectedTimeline}</div>
          <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", fontSize: 12, color: "var(--accent2)" }}>
            {impact.timelineCategory}
          </div>
        </motion.div>
      </div>

      {/* Similar Complaints */}
      <motion.div {...fade(2)} className="glass" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Lightbulb size={15} style={{ color: "var(--warning)" }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Similar Complaint Patterns</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {impact.similarComplaints.map((c, i) => (
            <div key={i} style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "start" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{c.issue}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.department} · {c.resolution}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}>{c.resolvedIn}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.category}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Success Story */}
      <motion.div {...fade(3)} className="glass" style={{ padding: 20, borderLeft: "3px solid var(--success)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <BookOpen size={15} style={{ color: "var(--success)" }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Example Scenario</span>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "var(--success)", border: "1px solid rgba(16,185,129,0.2)" }}>Illustrative · Not a real case</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {[["Problem", impact.successStory.problem], ["Action Taken", impact.successStory.action], ["Outcome", impact.successStory.outcome]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{val}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
