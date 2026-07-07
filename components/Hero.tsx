"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Drafts",
    desc: "Turn raw complaints into professional civic documents in seconds.",
  },
  {
    icon: Shield,
    title: "Impact Prediction",
    desc: "See how likely your complaint is to get resolved — before you file.",
  },
  {
    icon: Globe,
    title: "Collective Power",
    desc: "Cluster with similar complaints nearby and file petitions together.",
  },
];

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        padding: "clamp(64px, 10vw, 100px) 24px clamp(48px, 6vw, 72px)",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow behind hero */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto" }}
      >
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            marginBottom: 36,
            border: "1px solid rgba(59,130,246,0.18)",
            background: "rgba(59,130,246,0.06)",
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--accent)",
            letterSpacing: "0.02em",
          }}
        >
          <span>🇮🇳</span>
          <span>Built for Indian Citizens</span>
        </motion.div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(38px, 7vw, 62px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            marginBottom: 24,
            color: "var(--text)",
          }}
        >
          Your voice,
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #60a5fa 0%, #a78bfa 55%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            amplified by AI
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          style={{
            fontSize: 16,
            color: "var(--text-muted)",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "0 auto 48px",
            fontWeight: 400,
          }}
        >
          Draft, translate, and file civic complaints with confidence.
          <br />
          AI that speaks bureaucracy so you don't have to.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 56,
          }}
        >
          <Link
            href="/draft"
            className="btn-primary"
            style={{ minWidth: 170, gap: 8 }}
          >
            Start drafting
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/translate"
            className="btn-secondary"
            style={{ minWidth: 170 }}
          >
            Translate text
          </Link>
          <Link
            href="/coach"
            className="btn-secondary"
            style={{ minWidth: 170 }}
          >
            Practice filing
          </Link>
        </motion.div>

        {/* Feature cards — clean, no bouncing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
            textAlign: "left",
          }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;

            return (
              <div
                key={f.title}
                className="glass"
                style={{
                  padding: "24px 20px",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "default",
                }}
              >
                {/* Top accent line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 1,
                    background:
                      "linear-gradient(90deg, transparent, var(--border-accent), transparent)",
                    opacity: 0.35,
                  }}
                />
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.14))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent)",
                    marginBottom: 16,
                  }}
                >
                  <Icon size={17} />
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    marginBottom: 6,
                    color: "var(--text)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                    fontWeight: 400,
                  }}
                >
                  {f.desc}
                </div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
