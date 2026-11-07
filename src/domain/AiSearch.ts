export type AiSearchIntent = "recomendar" | "recordar" | "otro";

export interface AiSearchResult {
  readonly id: number;
  /** Same id as Article.id, to show the result in the article card. */
  readonly articleId: number;
  readonly title: string | null;
  readonly url: string;
  readonly rating: number | null;
  readonly reason: string | null;
  readonly summary: string | null;
  readonly isRead: boolean;
}

export type AiSearchOutcome =
  | { readonly ok: true; readonly intent: AiSearchIntent; readonly results: AiSearchResult[] }
  | { readonly ok: false; readonly message: string };
