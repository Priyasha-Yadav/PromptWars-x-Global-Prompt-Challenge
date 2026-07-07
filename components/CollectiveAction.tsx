"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Users, Flame, FileText, Loader2, Copy, Check } from "lucide-react";

interface StoredComplaint {
  id: string;
  text: string;
  location: string;
  category: string;
  keywords: string[];
  severity: number;
  timestamp: number;
}

interface Props {
  current: { text: string; location: string; category: string; keywords: string[]; severity: number };
}

const STORAGE_KEY = "civic_complaints";

function readStoredComplaints(): StoredComplaint[] {
  if (typeof window === "undefined") {
    return [];
  }

  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function subscribeStoredComplaints(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("civic-complaints-changed", callback as EventListener);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("civic-complaints-changed", callback as EventListener);
  };
}

function useStoredComplaints() {
  return useSyncExternalStore(subscribeStoredComplaints, readStoredComplaints, () => []);
}

function pressureScore(reports: number, severity: number, daysPending: number) {
  return Math.min(100, Math.round((reports * severity * Math.log(daysPending + 1)) / 3));
}

function similarity(a: StoredComplaint, b: { location: string; category: string; keywords: string[] }) {
  let score = 0;
  if (a.location.toLowerCase().includes(b.location.toLowerCase().split(",")[0].toLowerCase())) score += 40;
  if (a.category === b.category) score += 35;
  const shared = a.keywords.filter(k => b.keywords.some(bk => bk.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(bk.toLowerCase())));
  score += Math.min(25, shared.length * 8);
  return score;
}

export default function CollectiveAction({ current }: Props) {
  const [petition, setPetition] = useState<{ petition: string; title: string; demands: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const complaints = useStoredComplaints();

  useEffect(() => {
    const exists = complaints.find(c => c.text === current.text);

    if (!exists) {
      const newEntry: StoredComplaint = { id: Date.now().toString(), ...current, timestamp: Date.now() };
      const updated = [newEntry, ...complaints].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("civic-complaints-changed"));
    }
  }, [current, complaints]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const similar = complaints.filter(c => c.text !== current.text && similarity(c, current) >= 40);

  const daysPending = 42; // demo value
  const totalReports = similar.length + 1;
  const pScore = pressureScore(totalReports, current.severity, daysPending);
  const scoreColor = pScore >= 70 ? "var(--danger)" : pScore >= 40 ? "var(--warning)" : "var(--success)";

  async function generatePetition() {
    setLoading(true);
    const texts = [current.text, ...similar.map(c => c.text)].slice(0, 5);
    const res = await fetch("/api/petition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaints: texts, location: current.location, category: current.category }),
    });
    setPetition(await res.json());
    setLoading(false);
  }

  function copyPetition() {
    if (petition) { navigator.clipboard.writeText(petition.petition); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  const circ = 2 * Math.PI * 36;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Community Pressure Score */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Flame size={15} style={{ color: scoreColor }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Community Pressure Score</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center" }}>
          <div style={{ position: "relative", width: 90, height: 90 }}>
            <svg width={90} height={90} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={45} cy={45} r={36} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
              <motion.circle cx={45} cy={45} r={36} fill="none" stroke={scoreColor} strokeWidth={8} strokeLinecap="round"
                strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - (pScore / 100) * circ }}
                transition={{ duration: 1.2, ease: "easeOut" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor }}>{pScore}</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>/100</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[["Reports", totalReports], ["Severity", `${current.severity}/10`], ["Days Pending", daysPending]].map(([label, val]) => (
              <div key={label as string} style={{ textAlign: "center", padding: "10px 8px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{val}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
          Formula: reports × severity × log(days+1) / 3
        </div>
      </motion.div>

      {/* Similar Complaints Nearby */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={15} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Similar Complaints Nearby</span>
          </div>
          <span style={{ fontSize: 13, padding: "3px 10px", borderRadius: 20, background: "rgba(59,130,246,0.15)", color: "var(--accent)", border: "1px solid rgba(59,130,246,0.2)" }}>
            {totalReports} report{totalReports !== 1 ? "s" : ""}
          </span>
        </div>
        {similar.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            No similar complaints found yet. Submit more complaints to see clustering in action. Try submitting another complaint with the same category and location.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {similar.map(c => (
              <div key={c.id} style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 13, marginBottom: 3 }}>{c.text.slice(0, 100)}{c.text.length > 100 ? "…" : ""}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.category} · {c.location} · {Math.max(1, Math.round((now - c.timestamp) / 60000))}m ago</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Generate Petition */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={15} style={{ color: "var(--accent2)" }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Generate Collective Petition</span>
          </div>
          {!petition && (
            <button className="btn-primary" style={{ padding: "7px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              onClick={generatePetition} disabled={loading}>
              {loading ? <><Loader2 size={13} className="animate-spin" /> Generating…</> : "Generate Petition"}
            </button>
          )}
        </div>

        {petition && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{petition.title}</div>
            <div style={{ marginBottom: 12 }}>
              {petition.demands.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>{i + 1}.</span> {d}
                </div>
              ))}
            </div>
            <div style={{ padding: 16, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 240, overflowY: "auto" }}>
              {petition.petition}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={copyPetition}>
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Petition</>}
              </button>
              <button onClick={() => setPetition(null)} style={{ padding: "7px 14px", fontSize: 13, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" }}>
                Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
