import { SearchX } from "lucide-react";

export default function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <SearchX size={48} strokeWidth={1.5} className="text-zinc-300" />
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">No results match your filters</h2>
      <p className="mt-1 text-sm text-zinc-500">Try adjusting the filters or clearing them to see all results.</p>
      <button
        onClick={onClear}
        className="mt-6 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
      >
        Clear filters
      </button>
    </div>
  );
}
