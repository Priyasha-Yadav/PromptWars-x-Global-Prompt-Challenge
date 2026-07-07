import type { Metadata } from "next";
import TranslatorTool from "@/components/TranslatorTool";

export const metadata: Metadata = {
  title: "Translate | CivicDraft AI",
  description: "Translate between citizen language and official government language.",
};

export default function TranslatePage() {
  return (
    <section className="page-section">
      <div className="page-hero page-hero--compact">
        <span className="eyebrow">Translation desk</span>
        <h1>Make government language easier to read or easier to send.</h1>
        <p>
          Move between plain speech, official wording, jargon explanations, and tone checks without leaving the page.
        </p>
      </div>

      <div className="page-surface page-surface--narrow">
        <TranslatorTool />
      </div>
    </section>
  );
}
