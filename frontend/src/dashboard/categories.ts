import type { IntentCategory } from "@signal-monitor/shared";

export const CATEGORY_LABELS: Record<IntentCategory, string> = {
  hiring: "Hiring",
  pain_point: "Pain point",
  discussion: "Discussion",
  noise: "Noise",
};

export const CATEGORY_STYLES: Record<IntentCategory, string> = {
  hiring: "bg-green-50 text-green-700",
  pain_point: "bg-violet-50 text-violet-700",
  discussion: "bg-amber-50 text-amber-700",
  noise: "bg-zinc-100 text-zinc-500",
};

export const CATEGORY_BORDER: Record<IntentCategory, string> = {
  hiring: "border-l-green-500",
  pain_point: "border-l-violet-500",
  discussion: "border-l-amber-500",
  noise: "border-l-zinc-400",
};

export const CATEGORY_LIST: { value: IntentCategory; label: string }[] = [
  { value: "hiring", label: "Hiring" },
  { value: "pain_point", label: "Pain point" },
  { value: "discussion", label: "Discussion" },
  { value: "noise", label: "Noise" },
];
