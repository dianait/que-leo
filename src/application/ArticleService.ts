import type { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

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

  async add(
    params: {
      title: string;
      url: string;
      userId: string;
      language?: string | null;
      authors?: string[] | null;
      topics?: string[] | null;
      less_15?: boolean | null;
      featuredImage?: string | null;
    }
  ): Promise<Article> {
    const { title, url, userId, language, authors, topics, less_15, featuredImage } = params;
    if (typeof this.repository.addArticleToUser === "function") {
      return this.repository.addArticleToUser(
        title,
        url,
        userId,
        language,
        authors,
        topics,
        less_15,
        featuredImage
      );
    }
    return this.repository.addArticle(
      title,
      url,
      userId,
      language,
      authors,
      topics,
      less_15,
      featuredImage
    );
  }

  async markRead(articleId: number, isRead: boolean): Promise<void> {
    return this.repository.markAsRead(articleId, isRead);
  }

  async delete(articleId: number, userId: string): Promise<void> {
    return this.repository.deleteArticle(articleId, userId);
  }
}


