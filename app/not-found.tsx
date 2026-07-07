"use client";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)", width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "-25%", right: "-15%", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 65%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass-accent"
        style={{
          position: "relative", zIndex: 1, textAlign: "center",
          padding: "clamp(40px, 6vw, 64px) clamp(24px, 4vw, 48px)",
          maxWidth: 460, width: "100%",
          background: "linear-gradient(135deg, rgba(239,68,68,0.05), rgba(139,92,246,0.05))",
        }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: "backOut" }}
          style={{ marginBottom: 20 }}
        >
          <span style={{
            fontSize: "clamp(80px, 18vw, 160px)", fontWeight: 900,
            lineHeight: 1, letterSpacing: -3,
            background: "linear-gradient(135deg, var(--danger), var(--accent2))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", display: "block",
          }}>
            404
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            width: 60, height: 4, borderRadius: 2, margin: "0 auto 20px",
            background: "linear-gradient(90deg, var(--danger), var(--accent2))",
            boxShadow: "0 0 30px rgba(239,68,68,0.3)",
          }}
        />

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "var(--text)", letterSpacing: -0.3 }}
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 340, margin: "0 auto 36px", fontWeight: 400 }}
        >
          The page you&#39;re looking for doesn&#39;t exist or has been moved. Let&#39;s get you back to drafting civic complaints.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}
            >
              <Home size={16} />
              Back to Home
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.history.back()}
            style={{
              display: "flex", alignItems: "center", gap: 8, fontSize: 14,
              padding: "12px 28px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--surface)", color: "var(--text-muted)", cursor: "pointer",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} />
            Go Back
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
          style={{
            width: 140, height: 2, borderRadius: 1, marginTop: 48,
            background: "linear-gradient(90deg, transparent, var(--danger), var(--accent2), transparent)",
          }}
        />
      </motion.div>
    </main>
  );
}
