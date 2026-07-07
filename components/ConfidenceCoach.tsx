"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, FileText, Loader2, Send, Copy, Check, RotateCcw } from "lucide-react";

const TEMPLATES = ["RTI", "Complaint", "Appeal", "Reminder", "Escalation"] as const;
type Template = typeof TEMPLATES[number];

const TEMPLATE_DESC: Record<Template, string> = {
  RTI: "Right to Information request under RTI Act 2005",
  Complaint: "Formal complaint to a government department",
  Appeal: "Appeal against a rejected application",
  Reminder: "Follow-up for a pending unresolved complaint",
  Escalation: "Escalation to senior officer when ignored",
};

interface Message { role: "user" | "officer"; text: string }

export default function ConfidenceCoach() {
  const [coachTab, setCoachTab] = useState<"roleplay" | "templates">("roleplay");

  const [issue, setIssue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMsg, setUserMsg] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [templateType, setTemplateType] = useState<Template>("RTI");
  const [templateIssue, setTemplateIssue] = useState("");
  const [template, setTemplate] = useState<{ template: string; instructions: string[] } | null>(null);
  const [tplLoading, setTplLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  async function startRoleplay() {
    if (!issue.trim()) return;
    setChatLoading(true);
    setStarted(true);
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "roleplay", text: issue, history: [] }),
    });
    const data = await res.json();
    setMessages([{ role: "officer", text: data.reply }]);
    setChatLoading(false);
  }

  async function sendMessage() {
    if (!userMsg.trim() || chatLoading) return;
    const newMsg: Message = { role: "user", text: userMsg };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setUserMsg("");
    setChatLoading(true);
    const history = updated.map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] }));
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "roleplay", text: userMsg, history }),
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: "officer", text: data.reply }]);
    setChatLoading(false);
  }

  async function generateTemplate() {
    if (!templateIssue.trim()) return;
    setTplLoading(true);
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "template", text: templateIssue, templateType }),
    });
    setTemplate(await res.json());
    setTplLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Sub-tabs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {(["roleplay", "templates"] as const).map(t => (
          <button key={t} onClick={() => setCoachTab(t)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "14px 18px",
              borderRadius: 14, cursor: "pointer", textAlign: "left",
              border: `1px solid ${coachTab === t ? "rgba(59,130,246,.35)" : "rgba(148,163,184,.1)"}`,
              background: coachTab === t ? "linear-gradient(135deg, rgba(59,130,246,.14), rgba(139,92,246,.1))" : "rgba(15,22,40,.7)",
              transition: "all 0.2s",
            }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0,
              background: coachTab === t ? "rgba(59,130,246,.2)" : "rgba(255,255,255,.04)",
              color: coachTab === t ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${coachTab === t ? "rgba(59,130,246,.25)" : "rgba(255,255,255,.06)"}`,
            }}>
              {t === "roleplay" ? <MessageSquare size={15} /> : <FileText size={15} />}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: coachTab === t ? "var(--text)" : "var(--text-muted)", marginBottom: 2 }}>
                {t === "roleplay" ? "Officer Roleplay" : "Letter Templates"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {t === "roleplay" ? "Practice filing with a simulated officer" : "Generate RTI, appeals & more"}
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {coachTab === "roleplay" && (
          <motion.div key="roleplay" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {!started ? (
              <div className="glass" style={{ padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, rgba(59,130,246,.2), rgba(139,92,246,.2))", display: "grid", placeItems: "center", color: "var(--accent)" }}>
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Practice with a Municipal Officer</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>AI simulates a real government officer asking questions</div>
                  </div>
                </div>
                <textarea className="input-field" rows={3}
                  placeholder="Describe your civic issue briefly... e.g. There is a broken streetlight on my street for 2 months"
                  value={issue} onChange={e => setIssue(e.target.value)} style={{ marginBottom: 14 }} />
                <button className="btn-primary" disabled={!issue.trim() || chatLoading} onClick={startRoleplay}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 22px" }}>
                  {chatLoading ? <><Loader2 size={14} className="animate-spin" /> Starting…</> : "Start Roleplay Session"}
                </button>
              </div>
            ) : (
              <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
                {/* Chat header */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "grid", placeItems: "center", fontSize: 14 }}>🏛️</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>Municipal Officer</div>
                      <div style={{ fontSize: 11, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
                        Active session
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { setStarted(false); setMessages([]); setIssue(""); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", background: "rgba(255,255,255,.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>

                {/* Messages */}
                <div style={{ maxHeight: 340, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {messages.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                      {m.role === "officer" && (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "grid", placeItems: "center", fontSize: 12, flexShrink: 0 }}>🏛️</div>
                      )}
                      <div style={{
                        maxWidth: "78%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        fontSize: 13, lineHeight: 1.65,
                        background: m.role === "user" ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "rgba(255,255,255,.06)",
                        border: m.role === "officer" ? "1px solid var(--border)" : "none",
                        boxShadow: m.role === "user" ? "0 4px 16px rgba(59,130,246,.25)" : "none",
                      }}>
                        {m.text}
                      </div>
                    </motion.div>
                  ))}
                  {chatLoading && (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "grid", placeItems: "center", fontSize: 12 }}>🏛️</div>
                      <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "rgba(255,255,255,.06)", border: "1px solid var(--border)", display: "flex", gap: 5, alignItems: "center" }}>
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                            style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)" }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                  <input className="input-field" placeholder="Type your response to the officer…" value={userMsg}
                    onChange={e => setUserMsg(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    style={{ flex: 1 }} />
                  <button className="btn-primary" disabled={!userMsg.trim() || chatLoading} onClick={sendMessage}
                    style={{ padding: "10px 16px", flexShrink: 0, borderRadius: 12 }}>
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {coachTab === "templates" && (
          <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="glass" style={{ padding: 22 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Choose Template Type</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {TEMPLATES.map(t => (
                  <button key={t} className={`tab-btn ${templateType === t ? "active" : ""}`} onClick={() => setTemplateType(t)}
                    style={{ fontSize: 13 }}>{t}</button>
                ))}
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(59,130,246,.07)", border: "1px solid rgba(59,130,246,.15)", fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
                {TEMPLATE_DESC[templateType]}
              </div>
              <textarea className="input-field" rows={3}
                placeholder="Describe your issue briefly..."
                value={templateIssue} onChange={e => setTemplateIssue(e.target.value)} style={{ marginBottom: 14 }} />
              <button className="btn-primary" disabled={!templateIssue.trim() || tplLoading} onClick={generateTemplate}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 22px" }}>
                {tplLoading ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : `Generate ${templateType} Letter`}
              </button>
            </div>

            <AnimatePresence>
              {template && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="glass" style={{ padding: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>Filing Instructions</div>
                    {template.instructions.map((ins, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--text-muted)", marginBottom: 7 }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(59,130,246,.15)", color: "var(--accent)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                        {ins}
                      </div>
                    ))}
                  </div>
                  <div className="glass-accent" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1 }}>✦ {templateType} Letter</span>
                      <button onClick={() => { navigator.clipboard.writeText(template.template); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        style={{ background: "rgba(59,130,246,.1)", border: "1px solid rgba(59,130,246,.2)", cursor: "pointer", color: "var(--accent)", display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "5px 12px", borderRadius: 8 }}>
                        {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Letter</>}
                      </button>
                    </div>
                    <pre style={{ fontSize: 13, lineHeight: 1.85, whiteSpace: "pre-wrap", fontFamily: "inherit", maxHeight: 360, overflowY: "auto", color: "var(--text)" }}>
                      {template.template}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
