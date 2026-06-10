export interface SourceAdapter {
  fetchKeyword(
    keyword: string,
    sinceTimestamp: number,
  ): Promise<SourceAdapterResult[]>;
}

export interface SourceAdapterResult {
  source_id: string;
  title: string | null;
  snippet: string;
  url: string;
  author: string;
  published_at: Date;
}
