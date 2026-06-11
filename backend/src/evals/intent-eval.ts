import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import { parse } from "csv-parse/sync";
import { classifyIntent } from "../workers/score-worker/classify-intent";

interface CsvRow {
  title: string;
  snippet: string;
  matched_keywords: string;
  user_intent_category: string;
  user_intent_score: string;
}

interface EvalRecord {
  id: string;
  title: string;
  expectedCategory: string;
  expectedScore: number;
  gotCategory: string;
  gotScore: number;
  passed: boolean;
  categoryMatch: boolean;
  scoreMatch: boolean;
  error?: string;
}

function parsePgArray(value: string): string[] {
  const inner = value.slice(1, -1).trim();
  if (!inner) return [];
  const items: string[] = [];
  let current = "";
  let inQuote = false;
  for (const ch of inner) {
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      items.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) items.push(current.trim());
  return items;
}

async function main() {
  const csvPath = path.join(__dirname, "intent-eval-dataset.csv");
  const raw = fs.readFileSync(csvPath, "utf8");

  const rows: CsvRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true,
  });

  console.log("=== Intent Classification Eval ===");
  console.log(`Loaded ${rows.length} records\n`);

  const results: EvalRecord[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const id = String(i + 1);
    const matchedKeywords = parsePgArray(row.matched_keywords);
    const title = row.title.trim() || null;
    const expectedCategory = row.user_intent_category.trim();
    const expectedScore = parseInt(row.user_intent_score, 10);

    process.stdout.write(`[${id.padStart(2)}/${rows.length}] classifying... `);

    try {
      const result = await classifyIntent({
        id,
        matchedKeywords,
        title,
        snippet: row.snippet,
      });

      const categoryMatch = result.category === expectedCategory;
      const scoreMatch = Math.abs(result.score - expectedScore) <= 2;
      const passed = categoryMatch && scoreMatch;

      results.push({
        id,
        title: title ?? row.snippet.slice(0, 60),
        expectedCategory,
        expectedScore,
        gotCategory: result.category,
        gotScore: result.score,
        passed,
        categoryMatch,
        scoreMatch,
      });

      console.log(passed ? "PASS" : "FAIL");
    } catch (err) {
      results.push({
        id,
        title: title ?? row.snippet.slice(0, 60),
        expectedCategory,
        expectedScore,
        gotCategory: "ERROR",
        gotScore: 0,
        passed: false,
        categoryMatch: false,
        scoreMatch: false,
        error: String(err),
      });
      console.log("ERROR");
    }
  }

  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);
  const pct = ((passed.length / results.length) * 100).toFixed(1);

  console.log("\n=== Results ===");
  console.log(
    `Total: ${results.length} | Passed: ${passed.length} | Failed: ${failed.length} | Pass rate: ${pct}%`,
  );

  const categories = [...new Set(results.map((r) => r.expectedCategory))].sort();
  console.log("\nBy expected category:");
  for (const cat of categories) {
    const inCat = results.filter((r) => r.expectedCategory === cat);
    const passInCat = inCat.filter((r) => r.passed);
    const catPct = ((passInCat.length / inCat.length) * 100).toFixed(1);
    console.log(
      `  ${cat.padEnd(12)} ${String(passInCat.length).padStart(2)}/${inCat.length}  (${catPct}%)`,
    );
  }

  if (failed.length > 0) {
    console.log(`\nFailures (${failed.length}):`);
    for (const r of failed) {
      const tag =
        !r.categoryMatch && !r.scoreMatch
          ? "[CATEGORY+SCORE]"
          : !r.categoryMatch
            ? "[CATEGORY]     "
            : "[SCORE]        ";
      const titleTrunc =
        r.title.length > 60 ? r.title.slice(0, 57) + "..." : r.title;
      console.log(
        `  #${r.id.padStart(2)}  ${tag}  expected=${r.expectedCategory}/${r.expectedScore}  got=${r.gotCategory}/${r.gotScore}`,
      );
      console.log(`         "${titleTrunc}"`);
      if (r.error) {
        console.log(`         ERROR: ${r.error}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
