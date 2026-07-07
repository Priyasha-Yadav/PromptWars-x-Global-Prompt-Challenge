"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, FileText, Loader2, Send, Copy, Check } from "lucide-react";

const TEMPLATES = ["RTI", "Complaint", "Appeal", "Reminder", "Escalation"] as const;
type Template = typeof TEMPLATES[number];

interface Message { role: "user" | "officer"; text: string }

export default function ConfidenceCoach() {
  const [coachTab, setCoachTab] = useState<"roleplay" | "templates">("roleplay");

  // Roleplay state
  const [issue, setIssue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMsg, setUserMsg] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [started, setStarted] = useState(false);

  // Template state
  const [templateType, setTemplateType] = useState<Template>("RTI");
  const [templateIssue, setTemplateIssue] = useState("");
  const [template, setTemplate] = useState<{ template: string; instructions: string[] } | null>(null);
  const [tplLoading, setTplLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
    if (!userMsg.trim()) return;
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Sub-tabs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {(["roleplay", "templates"] as const).map(t => (
            <button key={t} className={`tab-btn ${coachTab === t ? "active" : ""}`} onClick={() => setCoachTab(t)}>
              {t === "roleplay" ? "🎭 Officer Roleplay" : "📄 Letter Templates"}
            </button>
          ))}
        </div>
      </motion.div>

      {coachTab === "roleplay" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {!started ? (
            <div className="glass" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <MessageSquare size={15} style={{ color: "var(--accent)" }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Practice with a Municipal Officer</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
                Describe your issue and practice explaining it to a simulated government officer. Get feedback on your communication.
              </p>
              <textarea className="input-field" rows={3} placeholder="Describe your civic issue briefly..."
                value={issue} onChange={e => setIssue(e.target.value)} style={{ marginBottom: 12 }} />
              <button className="btn-primary" disabled={!issue.trim() || chatLoading} onClick={startRoleplay}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "9px 20px" }}>
                {chatLoading ? <><Loader2 size={14} className="animate-spin" /> Starting…</> : "Start Roleplay"}
              </button>
            </div>
          ) : (
            <div className="glass" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>🏛️ Municipal Officer Simulation</span>
                <button onClick={() => { setStarted(false); setMessages([]); setIssue(""); }}
                  style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
                  Reset
                </button>
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "80%", padding: "10px 14px", borderRadius: 12, fontSize: 13, lineHeight: 1.6,
                      background: m.role === "user" ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "rgba(255,255,255,0.06)",
                      border: m.role === "officer" ? "1px solid var(--border)" : "none",
                    }}>
                      <div style={{ fontSize: 10, color: m.role === "user" ? "rgba(255,255,255,0.7)" : "var(--text-muted)", marginBottom: 4 }}>
                        {m.role === "user" ? "You" : "🏛️ Officer"}
                      </div>
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: "flex", gap: 6, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", width: "fit-content" }}>
                    <Loader2 size={14} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Officer is typing…</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input-field" placeholder="Type your response..." value={userMsg}
                  onChange={e => setUserMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} />
                <button className="btn-primary" disabled={!userMsg.trim() || chatLoading} onClick={sendMessage}
                  style={{ padding: "10px 16px", flexShrink: 0 }}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {coachTab === "templates" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <FileText size={15} style={{ color: "var(--accent2)" }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Generate Letter Template</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {TEMPLATES.map(t => (
                <button key={t} className={`tab-btn ${templateType === t ? "active" : ""}`} onClick={() => setTemplateType(t)}>{t}</button>
              ))}
            </div>
            <textarea className="input-field" rows={3} placeholder="Describe your issue briefly..."
              value={templateIssue} onChange={e => setTemplateIssue(e.target.value)} style={{ marginBottom: 12 }} />
            <button className="btn-primary" disabled={!templateIssue.trim() || tplLoading} onClick={generateTemplate}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "9px 20px" }}>
              {tplLoading ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : `Generate ${templateType} Letter`}
            </button>
          </div>

          {template && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="glass" style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Instructions</div>
                {template.instructions.map((ins, i) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>{i + 1}.</span> {ins}
                  </div>
                ))}
              </div>
              <div className="glass-accent" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1 }}>✦ {templateType} Letter</span>
                  <button onClick={() => { navigator.clipboard.writeText(template.template); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <pre style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "inherit", maxHeight: 320, overflowY: "auto" }}>
                  {template.template}
                </pre>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
