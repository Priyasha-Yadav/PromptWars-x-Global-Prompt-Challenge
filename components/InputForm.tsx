"use client";
import { useState } from "react";
import { MapPin, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["Roads", "Water", "Electricity", "Garbage", "Streetlights", "Drainage", "Public Transport", "Other"];

interface Props {
  onSubmit: (data: { text: string; location: string; category: string }) => void;
  loading: boolean;
}

export default function InputForm({ onSubmit, loading }: Props) {
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const valid = text.trim().length > 20 && location.trim() && category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-accent p-8 w-full max-w-2xl mx-auto"
    >
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-2">CivicDraft AI</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Transform your complaint into a powerful civic narrative
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Location */}
        <div>
          <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>
            Location
          </label>
          <div style={{ position: "relative" }}>
            <MapPin size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="input-field"
              style={{ paddingLeft: 34 }}
              placeholder="e.g. MG Road, Sector 14, Bengaluru"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>
            Category
          </label>
          <select
            className="input-field"
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ cursor: "pointer" }}
          >
            <option value="" style={{ background: "#0a0f1a" }}>Select a category</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c} style={{ background: "#0a0f1a" }}>{c}</option>
            ))}
          </select>
        </div>

        {/* Complaint */}
        <div>
          <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
            <span>Your Complaint</span>
            <span style={{ color: text.length > 20 ? "var(--success)" : "var(--text-muted)" }}>{text.length} chars</span>
          </label>
          <textarea
            className="input-field"
            rows={5}
            placeholder="Describe the issue in your own words... (min 20 characters)"
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>

        <button
          className="btn-primary"
          disabled={!valid || loading}
          onClick={() => onSubmit({ text, location, category })}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Generating...</>
          ) : (
            <><Sparkles size={16} /> Generate Civic Draft</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
