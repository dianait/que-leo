import { use, useCallback } from "react";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { ArticleService } from "../../application/ArticleService";
import type { Article } from "../../domain/Article";
import type { ArticleListFilters } from "../../domain/ArticleListFilters";

export function useArticleFetcher() {
  const repository = use(ArticleRepositoryContext);
  const { user } = useAuth();

  const fetchAll = useCallback(async (): Promise<Article[]> => {
    if (!repository || !user) return [];
    const svc = new ArticleService(repository);
    return svc.getByUser(user.id);
  }, [repository, user]);

  const fetchPaginated = useCallback(
    async (
      limit: number,
      offset: number
    ): Promise<{ articles: Article[]; total: number }> => {
      if (!repository || !user) return { articles: [], total: 0 };
      const svc = new ArticleService(repository);
      return svc.getByUserPaginated(user.id, limit, offset);
    },
    [repository, user]
  );

  const fetchFiltered = useCallback(
    async (
      limit: number,
      offset: number,
      filters: ArticleListFilters
    ): Promise<{ articles: Article[]; total: number }> => {
      if (!repository || !user) return { articles: [], total: 0 };
      const svc = new ArticleService(repository);
      return svc.getByUserFiltered(user.id, filters, limit, offset);
    },
    [repository, user]
  );

  return {
    user,
    repository,
    fetchAll,
    fetchPaginated,
    fetchFiltered,
    isReady: Boolean(repository && user),
  };
}
