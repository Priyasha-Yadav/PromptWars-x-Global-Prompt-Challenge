"use client";
import { useState } from "react";
import { MapPin, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["Roads", "Water", "Electricity", "Garbage", "Streetlights", "Drainage", "Public Transport", "Other"];

const CATEGORY_ICONS: Record<string, string> = {
  Roads: "🛣️", Water: "💧", Electricity: "⚡", Garbage: "🗑️",
  Streetlights: "💡", Drainage: "🌊", "Public Transport": "🚌", Other: "📋",
};

interface Props {
  onSubmit: (data: { text: string; location: string; category: string }) => void;
  loading: boolean;
}

export default function InputForm({ onSubmit, loading }: Props) {
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const valid = text.trim().length > 20 && location.trim() && category;
  const charColor = text.length === 0 ? "var(--text-subtle)" : text.length > 20 ? "var(--success)" : "var(--warning)";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-accent" style={{ padding: "28px 28px 24px", width: "100%", maxWidth: 580 }}>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>
          Step 1 of 1
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: -0.3 }}>Describe your issue</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Fill in the details below and AI will transform it into a powerful civic complaint.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Location + Category row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 7, display: "block", textTransform: "uppercase", letterSpacing: 0.8 }}>
              Location
            </label>
            <div style={{ position: "relative" }}>
              <MapPin size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input className="input-field" style={{ paddingLeft: 34 }}
                placeholder="e.g. MG Road, Bengaluru"
                value={location} onChange={e => setLocation(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 7, display: "block", textTransform: "uppercase", letterSpacing: 0.8 }}>
              Category
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>
                {category ? CATEGORY_ICONS[category] : "📂"}
              </span>
              <ChevronDown size={13} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}
                style={{ cursor: "pointer", paddingLeft: 34, paddingRight: 32, appearance: "none" }}>
                <option value="" style={{ background: "#090e1c" }}>Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c} style={{ background: "#090e1c" }}>{CATEGORY_ICONS[c]} {c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Complaint textarea */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 7, display: "flex", justifyContent: "space-between", textTransform: "uppercase", letterSpacing: 0.8 }}>
            <span>Your Complaint</span>
            <span style={{ color: charColor, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>
              {text.length < 20 && text.length > 0 ? `${20 - text.length} more chars needed` : `${text.length} chars`}
            </span>
          </label>
          <textarea className="input-field" rows={5}
            placeholder="Describe the issue in your own words. Be specific — mention how long it's been, who is affected, and what you've already tried."
            value={text} onChange={e => setText(e.target.value)}
            style={{ resize: "vertical", lineHeight: 1.7 }} />
        </div>

        {/* Progress indicator */}
        <div style={{ display: "flex", gap: 6 }}>
          {[!!location.trim(), !!category, text.trim().length > 20].map((done, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: done ? "var(--accent)" : "rgba(255,255,255,.08)", transition: "background 0.3s" }} />
          ))}
        </div>

        <button className="btn-primary" disabled={!valid || loading} onClick={() => onSubmit({ text, location, category })}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, padding: "13px 24px" }}>
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Generating your civic draft…</>
            : <><Sparkles size={15} /> Generate Civic Draft</>}
        </button>
      </div>
    </motion.div>
  );
}
