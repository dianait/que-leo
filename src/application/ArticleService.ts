import type { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";
import type { ArticleListFilters } from "../domain/ArticleListFilters";

export class ArticleService {
  constructor(private readonly repository: ArticleRepository) {}

  async getByUser(userId: string): Promise<Article[]> {
    if (typeof this.repository.getArticlesByUserFromUserArticles === "function") {
      return this.repository.getArticlesByUserFromUserArticles(userId);
    }
    return this.repository.getArticlesByUser(userId);
  }

  async getByUserPaginated(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }> {
    if (
      typeof this.repository.getArticlesByUserFromUserArticlesPaginated ===
      "function"
    ) {
      return this.repository.getArticlesByUserFromUserArticlesPaginated(
        userId,
        limit,
        offset
      );
    }
    return this.repository.getArticlesByUserPaginated(userId, limit, offset);
  }

  async getByUserFiltered(
    userId: string,
    filters: ArticleListFilters,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }> {
    if (typeof this.repository.getArticlesByUserFiltered === "function") {
      return this.repository.getArticlesByUserFiltered(
        userId,
        filters,
        limit,
        offset
      );
    }
    throw new Error("Filtered article queries are not supported by this repository");
  }

  async markRead(
    articleId: number,
    isRead: boolean,
    userId: string
  ): Promise<void> {
    return this.repository.markAsRead(articleId, isRead, userId);
  }

  async markFavorite(
    articleId: number,
    isFavorite: boolean,
    userId: string
  ): Promise<void> {
    return this.repository.markAsFavorite(articleId, isFavorite, userId);
  }

  async delete(articleId: number, userId: string): Promise<void> {
    return this.repository.deleteArticle(articleId, userId);
  }
}


