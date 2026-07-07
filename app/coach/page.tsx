import type { Metadata } from "next";
import ConfidenceCoach from "@/components/ConfidenceCoach";

export const metadata: Metadata = {
  title: "Coach | CivicDraft AI",
  description: "Practice filing complaints with a simulated officer or generate ready-to-use letter templates.",
};

export default function CoachPage() {
  return (
    <section className="page-section">
      <div className="page-hero page-hero--compact">
        <span className="eyebrow">Confidence coach</span>
        <h1>Practice before you file.</h1>
        <p>
          Use a roleplay officer or generate structured templates for RTI, complaints, appeals, reminders, and escalations.
        </p>
      </div>

      <div className="page-surface page-surface--narrow">
        <ConfidenceCoach />
      </div>
    </section>
  );
}
