import type { Article } from "../../domain/Article";
import { sortArticlesByAiRating } from "../../domain/Article";
import type { ArticlesState, FiltersState } from "./articleTableReducers";

export function hasActiveTableFilters(filtersState: FiltersState): boolean {
  return (
    filtersState.readFilter !== "all" ||
    filtersState.favoriteFilter === "favorites"
  );
}

export function needsAllArticlesForFilters(filtersState: FiltersState): boolean {
  return filtersState.searchTerm !== "" || hasActiveTableFilters(filtersState);
}

/** Lowercase without accents, so "programacion" finds "Programación". */
function normalizeForSearch(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function searchableText(article: Article): string {
  return normalizeForSearch(
    [
      article.title,
      ...(article.authors ?? []),
      ...(article.topics ?? []),
      article.aiSummary ?? "",
      article.aiRatingReason ?? "",
    ].join("\n")
  );
}

/**
 * Matches every word of the search, in any order, against the title,
 * authors, topics and the AI summary and rating reason.
 */
export function filterArticlesBySearch(
  articles: Article[],
  searchTerm: string
): Article[] {
  const words = normalizeForSearch(searchTerm).split(/\s+/).filter(Boolean);
  if (words.length === 0) return articles;

  return articles.filter((article) => {
    const text = searchableText(article);
    return words.every((word) => text.includes(word));
  });
}

export function filterArticlesByStatus(
  articles: Article[],
  filtersState: FiltersState
): Article[] {
  return articles.filter((article) => {
    if (filtersState.readFilter === "unread" && article.isRead) return false;
    if (filtersState.readFilter === "read" && !article.isRead) return false;
    if (filtersState.favoriteFilter === "favorites" && !article.isFavorite) {
      return false;
    }
    return true;
  });
}

export function paginateArticles(
  articles: Article[],
  page: number,
  pageSize: number
): Article[] {
  return articles.slice((page - 1) * pageSize, page * pageSize);
}

export function computeEffectiveTotal(
  needsAllArticles: boolean,
  filteredCount: number,
  serverTotal: number
): number {
  return needsAllArticles ? filteredCount : serverTotal;
}

export function buildDisplayedArticles(
  articlesState: ArticlesState,
  filtersState: FiltersState,
  pageSize: number
): {
  needsAllArticles: boolean;
  filteredArticles: Article[];
  effectiveTotal: number;
  displayedArticles: Article[];
} {
  const needsAllArticles = needsAllArticlesForFilters(filtersState);

  const base = needsAllArticles
    ? filterArticlesBySearch(articlesState.allArticles, filtersState.searchTerm)
    : articlesState.articles;

  const filteredArticles = filterArticlesByStatus(base, filtersState);
  const effectiveTotal = computeEffectiveTotal(
    needsAllArticles,
    filteredArticles.length,
    articlesState.total
  );

  const sortedArticles = sortArticlesByAiRating(
    filteredArticles,
    filtersState.readFilter === "read"
  );

  const displayedArticles = needsAllArticles
    ? paginateArticles(sortedArticles, articlesState.page, pageSize)
    : sortedArticles;

  return {
    needsAllArticles,
    filteredArticles,
    effectiveTotal,
    displayedArticles,
  };
}
