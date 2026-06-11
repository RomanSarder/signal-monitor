import { Radio } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Radio size={48} strokeWidth={1.5} className="text-zinc-300" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">No monitors yet</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Create a monitor to start tracking keywords
      </p>
      <a
        href="/monitors/new"
        className="mt-6 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
      >
        Create your first monitor
      </a>
    </div>
  );
}
