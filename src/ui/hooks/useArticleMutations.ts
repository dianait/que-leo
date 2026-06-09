import { useCallback, useMemo } from "react";
import type { ArticleRepository } from "../../domain/ArticleRepository";
import { ArticleService } from "../../application/ArticleService";

export function useArticleMutations(
  repository: ArticleRepository | null,
  userId: string | undefined
) {
  const service = useMemo(
    () => (repository ? new ArticleService(repository) : null),
    [repository]
  );

  const markRead = useCallback(
    async (articleId: number, isRead: boolean): Promise<void> => {
      if (!service || !userId) {
        throw new Error("Repository or user not available");
      }
      await service.markRead(articleId, isRead, userId);
    },
    [service, userId]
  );

  const markFavorite = useCallback(
    async (articleId: number, isFavorite: boolean): Promise<void> => {
      if (!service || !userId) {
        throw new Error("Repository or user not available");
      }
      await service.markFavorite(articleId, isFavorite, userId);
    },
    [service, userId]
  );

  const deleteArticle = useCallback(
    async (articleId: number): Promise<void> => {
      if (!service || !userId) throw new Error("Repository or user not available");
      await service.delete(articleId, userId);
    },
    [service, userId]
  );

  return {
    markRead,
    markFavorite,
    deleteArticle,
    isReady: Boolean(service && userId),
  };
}
