import { Radio } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMe } from "../auth/queries";
import { useMonitors } from "./queries";
import { useFilters } from "./useFilters";
import FilterBar from "./FilterBar";

export default function Dashboard() {
  const { data: me } = useMe();
  const { data: monitors = [] } = useMonitors();
  const { filters, setCategories, setMinScore, setMonitorId, setFrom, setTo, clearFilters } =
    useFilters();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <nav className="h-14 flex items-center justify-between gap-4 px-4 sm:px-6 bg-white border-b border-zinc-200">
        <span className="font-semibold text-zinc-900 shrink-0">Signal Monitor</span>
        {me?.email && <span className="text-sm text-zinc-500 truncate min-w-0">{me.email}</span>}
      </nav>

      <FilterBar
        filters={filters}
        monitors={monitors}
        onCategoriesChange={setCategories}
        onMinScoreChange={setMinScore}
        onMonitorIdChange={setMonitorId}
        onFromChange={setFrom}
        onToChange={setTo}
        onClear={clearFilters}
      />

      <main className="flex-1 flex flex-col items-center justify-center">
        <Radio size={48} strokeWidth={1.5} className="text-zinc-300" />
        <h1 className="mt-4 text-xl font-semibold text-zinc-900">No results yet</h1>
        <p className="mt-1 text-sm text-zinc-500">Create a monitor to get started</p>
        <Link
          to="/monitors/new"
          className="mt-6 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
        >
          Create a monitor
        </Link>
      </main>
    </div>
  );
}
