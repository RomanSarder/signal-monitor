import { Radio, Clock, SearchX } from "lucide-react";

type Variant = "no-monitors" | "no-results" | "all-caught-up";

interface Props {
  variant: Variant;
  onClear?: () => void;
}

export default function EmptyState({ variant, onClear }: Props) {
  if (variant === "no-monitors") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Radio size={48} strokeWidth={1.5} className="text-zinc-300" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold text-zinc-900">No monitors yet</h2>
        <p className="mt-1 text-sm text-zinc-500">Create a monitor to start tracking keywords.</p>
        <a
          href="/monitors/new"
          className="mt-6 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
        >
          Create your first monitor
        </a>
      </div>
    );
  }

  if (variant === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Clock size={48} strokeWidth={1.5} className="text-zinc-300" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold text-zinc-900">No results yet</h2>
        <p className="mt-1 text-sm text-zinc-500">Your monitors are running. Results will appear here shortly.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <SearchX size={48} strokeWidth={1.5} className="text-zinc-300" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">All caught up</h2>
      <p className="mt-1 text-sm text-zinc-500">No results match your current filters.</p>
      <button
        onClick={onClear}
        className="mt-6 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
      >
        Clear filters
      </button>
    </div>
  );
}
