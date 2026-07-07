import type { Metadata } from "next";
import DraftWorkspace from "@/components/DraftWorkspace";

export const metadata: Metadata = {
  title: "Draft | CivicDraft AI",
  description: "Turn a rough complaint into a sharper civic case.",
};

export default function DraftPage() {
  return <DraftWorkspace />;
}
