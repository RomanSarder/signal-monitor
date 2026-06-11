import { Bookmark, ExternalLink, X } from "lucide-react";
import type { Result } from "@signal-monitor/shared";
import { useDeleteResult, usePatchResult } from "./queries";

function plainText(html: string): string {
  return new DOMParser().parseFromString(html, "text/html").body.textContent || "";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ScoreBadge({ score }: { score: number }) {
  const style =
    score >= 7
      ? "bg-green-500 text-white"
      : score >= 4
        ? "bg-amber-500 text-white"
        : "bg-zinc-400 text-white";
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums ${style}`}>
      {score}
    </span>
  );
}

const CATEGORY_STYLES: Record<string, string> = {
  hiring: "bg-green-50 text-green-700",
  pain_point: "bg-violet-50 text-violet-700",
  discussion: "bg-amber-50 text-amber-700",
  noise: "bg-zinc-100 text-zinc-500",
};

const CATEGORY_BORDER: Record<string, string> = {
  hiring: "border-l-green-500",
  pain_point: "border-l-violet-500",
  discussion: "border-l-amber-500",
  noise: "border-l-zinc-400",
};

const CATEGORY_LABELS: Record<string, string> = {
  hiring: "Hiring",
  pain_point: "Pain point",
  discussion: "Discussion",
  noise: "Noise",
};

function CategoryChip({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] ?? "bg-zinc-100 text-zinc-500";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

export default function ResultCard({ result }: { result: Result }) {
  const patch = usePatchResult();
  const del = useDeleteResult();
  const isUnread = result.isRead === false || result.isRead === null;
  const borderColor = isUnread
    ? (CATEGORY_BORDER[result.intentCategory ?? ""] ?? "border-l-zinc-400")
    : "border-l-transparent";

  return (
    <li
      className={`bg-white rounded-lg border border-zinc-200 border-l-4 ${borderColor} px-5 py-5 flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {result.intentScore != null && <ScoreBadge score={result.intentScore} />}
          {result.intentCategory != null && <CategoryChip category={result.intentCategory} />}
        </div>
        <span className="text-xs text-zinc-400 shrink-0 uppercase tracking-wide">{result.source}</span>
      </div>

      <p className={`text-sm font-medium text-zinc-900 ${result.title?.trim() ? "" : "line-clamp-2"}`}>
        {result.title?.trim() || plainText(result.snippet)}
      </p>

      <p className="text-xs text-zinc-500">
        {result.author}
        {result.publishedAt ? ` · ${timeAgo(result.publishedAt)}` : ""}
      </p>

      {result.matchedKeywords.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {result.matchedKeywords.map(kw => (
            <li key={kw} className="bg-zinc-100 text-zinc-600 rounded px-1.5 py-0.5 text-xs">
              {kw}
            </li>
          ))}
        </ul>
      )}

      {result.intentReason && (
        <p className="text-xs text-zinc-500 italic">{result.intentReason}</p>
      )}

      <div className="flex items-center justify-end gap-1 pt-1">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => patch.mutate({ id: result.id, body: { isRead: true } })}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent hover:border-zinc-200"
        >
          <ExternalLink size={13} aria-hidden="true" />
          Open
        </a>
        <button
          onClick={() => patch.mutate({ id: result.id, body: { isSaved: !result.isSaved } })}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs border border-transparent hover:border-zinc-200 ${result.isSaved ? "text-indigo-600 hover:text-indigo-700" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"}`}
        >
          <Bookmark size={13} aria-hidden="true" />
          Save
        </button>
        <button
          onClick={() => del.mutate(result.id)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent hover:border-zinc-200"
        >
          <X size={13} aria-hidden="true" />
          Dismiss
        </button>
      </div>
    </li>
  );
}
