import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Card, TextInput, Select, SelectItem } from "@tremor/react";
import TopNav from "../TopNav";
import { useCreateMonitor } from "./queries";
import { useKeywords } from "./useKeywords";
import KeywordField from "./KeywordField";
import { INTERVAL_OPTIONS, labelClass } from "./constants";

export default function MonitorsNew() {
  const navigate = useNavigate();
  const createMonitor = useCreateMonitor();
  const kw = useKeywords();

  const [name, setName] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState(30);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (kw.keywords.length === 0) {
      kw.setKwError(true);
      return;
    }
    createMonitor.mutate(
      { name, keywords: kw.keywords, sources: ["hn"], intervalMinutes },
      { onSuccess: () => navigate({ to: "/monitors" }) },
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <TopNav />
      <main className="flex-1 flex flex-col">
        <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-lg font-semibold text-zinc-900 mb-5">New monitor</h1>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="monitor-name" className={labelClass}>
                  Name <span className="text-red-500">*</span>
                </label>
                <TextInput
                  id="monitor-name"
                  name="name"
                  placeholder="e.g. Indie hackers talking about payments"
                  required
                  value={name}
                  onValueChange={setName}
                />
              </div>

              <KeywordField id="kw-input" required {...kw} />

              <div>
                <label htmlFor="interval-select" className={labelClass}>
                  Polling interval
                </label>
                <Select
                  id="interval-select"
                  value={String(intervalMinutes)}
                  onValueChange={(v) => setIntervalMinutes(Number(v))}
                >
                  {INTERVAL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <span className={labelClass}>Source</span>
                <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-not-allowed select-none">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    readOnly
                    className="accent-indigo-600"
                  />
                  Hacker News
                </label>
              </div>

              {createMonitor.error && (
                <div role="alert" className="rounded text-sm bg-red-50 px-3 py-2 text-red-700">
                  {createMonitor.error.message}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <Link
                  to="/monitors"
                  className="px-4 py-2 rounded border border-zinc-200 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={createMonitor.isPending}
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
                >
                  {createMonitor.isPending ? "Creating…" : "Create monitor"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
