import { useMemo } from "react";
import { sortArticlesByAiRating } from "../../domain/Article";
import type { ArticlesState, FiltersState } from "./articleTableReducers";
import {
  filterArticlesBySearch,
  filterArticlesByStatus,
  needsAllArticlesForFilters,
  paginateArticles,
  computeEffectiveTotal,
} from "./articleTableFiltering";

export function useArticleTableDisplay(
  articlesState: ArticlesState,
  filtersState: FiltersState,
  pageSize: number
) {
  const needsAllArticles = useMemo(
    () => needsAllArticlesForFilters(filtersState),
    [filtersState]
  );

  const searchFilteredArticles = useMemo(() => {
    const base = needsAllArticles
      ? articlesState.allArticles
      : articlesState.articles;
    return filterArticlesBySearch(base, filtersState.searchTerm);
  }, [
    needsAllArticles,
    articlesState.allArticles,
    articlesState.articles,
    filtersState.searchTerm,
  ]);

  const filteredArticles = useMemo(
    () => filterArticlesByStatus(searchFilteredArticles, filtersState),
    [searchFilteredArticles, filtersState]
  );

  const effectiveTotal = useMemo(
    () =>
      computeEffectiveTotal(
        needsAllArticles,
        filteredArticles.length,
        articlesState.total
      ),
    [needsAllArticles, filteredArticles.length, articlesState.total]
  );

  const sortedArticles = useMemo(
    () =>
      sortArticlesByAiRating(
        filteredArticles,
        filtersState.readFilter === "read"
      ),
    [filteredArticles, filtersState.readFilter]
  );

  const displayedArticles = useMemo(
    () =>
      needsAllArticles
        ? paginateArticles(sortedArticles, articlesState.page, pageSize)
        : sortedArticles,
    [needsAllArticles, sortedArticles, articlesState.page, pageSize]
  );

  return {
    needsAllArticles,
    filteredArticles,
    effectiveTotal,
    displayedArticles,
  };
}
