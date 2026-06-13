import { useState } from "react";

export interface UseKeywordsReturn {
  keywords: string[];
  kwInput: string;
  kwError: boolean;
  setKwError: (v: boolean) => void;
  handleKwChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKwKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  removeKeyword: (kw: string) => void;
  reset: (kws: string[]) => void;
}

export function useKeywords(): UseKeywordsReturn {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState("");
  const [kwError, setKwError] = useState(false);

  function addKeyword(raw: string) {
    const kw = raw.replace(/,/g, "").trim();
    if (!kw || keywords.includes(kw)) return;
    setKeywords((prev) => [...prev, kw]);
    setKwError(false);
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

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  function reset(kws: string[]) {
    setKeywords(kws);
    setKwInput("");
    setKwError(false);
  }

  return { keywords, kwInput, kwError, setKwError, handleKwChange, handleKwKeyDown, removeKeyword, reset };
}
