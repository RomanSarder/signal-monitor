import { X } from "lucide-react";
import { chipClass, labelClass } from "./constants";
import type { UseKeywordsReturn } from "./useKeywords";

interface Props extends UseKeywordsReturn {
  id: string;
  required?: boolean;
}

export default function KeywordField({ id, required, keywords, kwInput, kwError, handleKwChange, handleKwKeyDown, removeKeyword }: Props) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        Keywords {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={kwInput}
        onChange={handleKwChange}
        onKeyDown={handleKwKeyDown}
        placeholder="Type a keyword and press Enter or comma"
        className="w-full rounded-tremor-default border border-tremor-border bg-tremor-background px-3 py-2 text-sm text-tremor-content-strong placeholder:text-tremor-content focus:outline-none focus:ring-2 focus:ring-tremor-brand-subtle"
        aria-describedby={kwError ? `${id}-error` : undefined}
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
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
          Add at least one keyword.
        </p>
      )}
    </div>
  );
}
