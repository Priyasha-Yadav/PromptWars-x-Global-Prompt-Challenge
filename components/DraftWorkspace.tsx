"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ShieldCheck, Sparkles, ArrowRight, MapPin } from "lucide-react";
import InputForm from "./InputForm";
import ResultsView from "./ResultsView";

interface SimilarComplaint {
  category: string;
  issue: string;
  resolvedIn: string;
  department: string;
  resolution: string;
}

interface Result {
  summary: string;
  professional: string;
  emotional: string;
  legal: string;
  department: string;
  escalation: string[];
  evidence: string[];
  priority: string;
  keywords: string[];
  score: number;
  scoreFeedback: string;
  improvements: string[];
  impact: {
    resolutionLikelihood: "Low" | "Medium" | "High";
    likelihoodReason: string;
    expectedTimeline: string;
    timelineCategory: string;
    similarComplaints: SimilarComplaint[];
    successStory: { problem: string; action: string; outcome: string };
  };
  collective: { clusterKeywords: string[]; severityScore: number };
}

const HIGHLIGHTS = [
  {
    icon: FileText,
    title: "Formal output",
    description: "Professional, emotional, and legal drafts ready to submit or adapt.",
  },
  {
    icon: ShieldCheck,
    title: "Impact signal",
    description: "See priority, evidence gaps, and likely resolution path before filing.",
  },
  {
    icon: MapPin,
    title: "Local context",
    description: "Tailor every complaint to a location and department instead of generic text.",
  },
];

export default function DraftWorkspace() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [formData, setFormData] = useState({ location: "", category: "" });

  async function handleSubmit({ text, location, category }: { text: string; location: string; category: string }) {
    setLoading(true);
    setOriginalText(text);
    setFormData({ location, category });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, location, category }),
      });

      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section">
      <div className="page-hero">
        <span className="eyebrow">Drafting studio</span>
        <h1>Turn a rough complaint into a sharper civic case.</h1>
        <p>
          Write once, then get a professional letter, a citizen-first appeal, and a legal-style draft that is easier to file.
        </p>
      </div>

      <div className="workspace-layout">
        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="glass-accent workspace-panel"
        >
          <div className="workspace-panel__header">
            <span className="workspace-panel__tag">What you get</span>
            <ArrowRight size={16} />
          </div>

          <div className="workspace-stats">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="workspace-stat">
                  <div className="workspace-stat__icon">
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="workspace-stat__title">{item.title}</div>
                    <div className="workspace-stat__copy">{item.description}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="workspace-note">
            <Sparkles size={16} />
            <p>Better structure usually means faster review from the right department.</p>
          </div>
        </motion.aside>

        <div className="workspace-stage">
          {result ? (
            <ResultsView
              result={result}
              originalText={originalText}
              location={formData.location}
              category={formData.category}
              onReset={() => setResult(null)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <InputForm onSubmit={handleSubmit} loading={loading} />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
