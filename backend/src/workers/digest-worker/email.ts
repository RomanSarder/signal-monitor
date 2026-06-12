export interface DigestResult {
  title: string | null;
  snippet: string;
  url: string;
  intentScore: number;
  intentCategory: "hiring" | "pain_point" | "discussion" | "noise" | null;
  intentReason: string | null;
  author: string;
  publishedAt: Date | null;
}

function getScoreColor(score: number): string {
  if (score >= 7) return "#22c55e";
  if (score >= 4) return "#f59e0b";
  return "#a1a1aa";
}

function getCategoryColor(category: DigestResult["intentCategory"]): string {
  switch (category) {
    case "hiring": return "#22c55e";
    case "pain_point": return "#8b5cf6";
    case "discussion": return "#f59e0b";
    default: return "#a1a1aa";
  }
}

function getCategoryLabel(category: DigestResult["intentCategory"]): string {
  switch (category) {
    case "hiring": return "Hiring";
    case "pain_point": return "Pain Point";
    case "discussion": return "Discussion";
    case "noise": return "Noise";
    default: return "Unknown";
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function renderResultCard(result: DigestResult): string {
  const title = result.title ?? result.url;
  const scoreColor = getScoreColor(result.intentScore);
  const categoryColor = getCategoryColor(result.intentCategory);
  const categoryLabel = getCategoryLabel(result.intentCategory);
  const meta = [
    result.author,
    result.publishedAt ? formatDate(result.publishedAt) : null,
  ].filter(Boolean).join(" · ");

  const intentReasonRow = result.intentReason
    ? `<tr>
        <td style="padding:0 20px 12px 20px;">
          <div style="background:#fafafa;border-left:3px solid #e4e4e7;padding:8px 12px;font-size:12px;color:#71717a;font-style:italic;line-height:1.5;">
            ${result.intentReason}
          </div>
        </td>
      </tr>`
    : "";

  return `<tr>
    <td style="padding:8px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;background:#ffffff;">
        <tr>
          <td style="padding:16px 20px 10px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:top;">
                  <a href="${result.url}"
                     style="font-size:14px;font-weight:600;color:#18181b;text-decoration:none;line-height:1.4;display:block;">
                    ${title}
                  </a>
                </td>
                <td align="right" style="vertical-align:top;white-space:nowrap;padding-left:12px;">
                  <span style="display:inline-block;background:${scoreColor};color:#fff;font-size:11px;font-weight:700;padding:2px 7px;border-radius:999px;">
                    ${result.intentScore}
                  </span>
                  <span style="display:inline-block;background:${categoryColor};color:#fff;font-size:11px;font-weight:600;padding:2px 7px;border-radius:999px;margin-left:4px;">
                    ${categoryLabel}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 20px 12px 20px;font-size:13px;color:#3f3f46;line-height:1.6;">
            ${result.snippet}
          </td>
        </tr>
        ${intentReasonRow}
        <tr>
          <td style="padding:10px 20px;border-top:1px solid #f4f4f5;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:11px;color:#71717a;">${meta}</td>
                <td align="right">
                  <a href="${result.url}"
                     style="font-size:11px;color:#71717a;text-decoration:none;">
                    View &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export function generateDigestEmail(results: DigestResult[], userEmail: string): string {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const count = results.length;
  const signalWord = count === 1 ? "signal" : "signals";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Signal Monitor Digest</title>
</head>
<body style="margin:0;padding:0;background:#fafafa;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:#fafafa;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">

          <!-- Header -->
          <tr>
            <td style="background:#18181b;padding:28px 32px;">
              <div style="font-size:20px;font-weight:600;color:#ffffff;letter-spacing:-0.3px;">
                Signal Monitor
              </div>
              <div style="font-size:12px;color:#71717a;margin-top:4px;">
                Daily Digest &middot; ${date}
              </div>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:20px 32px 8px 32px;">
              <p style="margin:0;font-size:13px;color:#71717a;">
                ${count} ${signalWord} matched your monitors today.
              </p>
            </td>
          </tr>

          <!-- Result cards -->
          ${results.map(renderResultCard).join("\n")}

          <!-- Spacer -->
          <tr><td style="height:16px;"></td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e4e4e7;background:#fafafa;">
              <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;">
                You&rsquo;re receiving this because you have an active Signal Monitor account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
