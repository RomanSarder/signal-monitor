export function isRelevant(
  snippet: string,
  title: string | null,
  matchedKeywords: string[],
): boolean {
  const lowercaseKeywords = matchedKeywords.map((k) => k.toLowerCase());
  const lowercaseSnippet = snippet.toLowerCase();
  const lowercaseTitle = title?.toLowerCase();

  return (
    lowercaseKeywords.some((keyword) => lowercaseSnippet.includes(keyword)) ||
    lowercaseKeywords.some((keyword) => !!lowercaseTitle?.includes(keyword))
  );
}
