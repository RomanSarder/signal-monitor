import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Card, TextInput, Select, SelectItem } from "@tremor/react";
import { X } from "lucide-react";
import TopNav from "../TopNav";
import { useCreateMonitor } from "./queries";

const INTERVAL_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 360, label: "6 hours" },
  { value: 1440, label: "24 hours" },
  { value: 10080, label: "7 days" },
];

const labelClass = "block text-sm font-medium text-zinc-900 mb-1.5";
const chipClass =
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-sm";

export default function MonitorsNew() {
  const navigate = useNavigate();
  const createMonitor = useCreateMonitor();

  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState("");
  const [kwError, setKwError] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(30);

  function addKeyword(raw: string) {
    const kw = raw.replace(/,/g, "").trim();
    if (!kw || keywords.includes(kw)) return;
    setKeywords((prev) => [...prev, kw]);
    setKwError(false);
  }

  function handleKwKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(kwInput);
      setKwInput("");
    } else if (e.key === ",") {
      e.preventDefault();
      addKeyword(kwInput);
      setKwInput("");
    }
  }

  function handleKwChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val.endsWith(",")) {
      addKeyword(val);
      setKwInput("");
    } else {
      setKwInput(val);
    }
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (keywords.length === 0) {
      setKwError(true);
      return;
    }
    createMonitor.mutate(
      { name, keywords, sources: ["hn"], intervalMinutes },
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

              <div>
                <label htmlFor="kw-input" className={labelClass}>
                  Keywords <span className="text-red-500">*</span>
                </label>
                <input
                  id="kw-input"
                  type="text"
                  value={kwInput}
                  onChange={handleKwChange}
                  onKeyDown={handleKwKeyDown}
                  placeholder="Type a keyword and press Enter or comma"
                  className="w-full rounded-tremor-default border border-tremor-border bg-tremor-background px-3 py-2 text-sm text-tremor-content-strong placeholder:text-tremor-content focus:outline-none focus:ring-2 focus:ring-tremor-brand-subtle"
                  aria-describedby={kwError ? "kw-error" : undefined}
                />
                {keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {keywords.map((kw) => (
                      <span key={kw} className={chipClass}>
                        {kw}
                        <button
                          type="button"
                          onClick={() => removeKeyword(kw)}
                          aria-label={`Remove keyword ${kw}`}
                          className="ml-0.5 hover:text-indigo-900"
                        >
                          <X size={12} strokeWidth={2} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {kwError && (
                  <p id="kw-error" role="alert" className="mt-1.5 text-sm text-red-600">
                    Add at least one keyword.
                  </p>
                )}
              </div>

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
