import type { Article } from "../../src/domain/Article";
import type { ArticleListFilters } from "../../src/domain/ArticleListFilters";
import {
  filterArticlesBySearch,
  filterArticlesByStatus,
} from "../../src/ui/ListOfArticles/articleTableFiltering";

export function makeArticleRepoMock(
  articles: Article[],
  total?: number
) {
  const applyFilters = (filters: ArticleListFilters) => {
    const filtersState = {
      readFilter: filters.readFilter ?? "all",
      favoriteFilter: filters.favoriteFilter ?? "all",
      searchTerm: filters.searchTerm ?? "",
      isSearching: false,
    } as const;

    const searchFiltered = filterArticlesBySearch(
      articles,
      filtersState.searchTerm
    );
    return filterArticlesByStatus(searchFiltered, filtersState);
  };

  return {
    getAllArticles: jest.fn().mockResolvedValue(articles),
    getArticlesByUser: jest.fn().mockResolvedValue(articles),
    getArticlesByUserFromUserArticles: jest.fn().mockResolvedValue(articles),
    getArticlesByUserPaginated: jest.fn().mockImplementation(
      (_userId: string, limit: number, offset: number) =>
        Promise.resolve({
          articles: articles.slice(offset, offset + limit),
          total: total ?? articles.length,
        })
    ),
    getArticlesByUserFiltered: jest.fn().mockImplementation(
      (
        _userId: string,
        filters: ArticleListFilters,
        limit: number,
        offset: number
      ) => {
        const filtered = applyFilters(filters);
        return Promise.resolve({
          articles: filtered.slice(offset, offset + limit),
          total: filtered.length,
        });
      }
    ),
    addArticle: jest.fn(),
    deleteArticle: jest.fn().mockResolvedValue(undefined),
    markAsRead: jest.fn().mockResolvedValue(undefined),
    markAsFavorite: jest.fn().mockResolvedValue(undefined),
  };
}
