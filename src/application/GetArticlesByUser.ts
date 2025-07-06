import type { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class GetArticlesByUser {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(userId: string): Promise<Article[]> {
    // Usar método avanzado si está disponible, sino usar el básico
    if (
      typeof this.repository.getArticlesByUserFromUserArticles === "function"
    ) {
      return this.repository.getArticlesByUserFromUserArticles(userId);
    }
    return this.repository.getArticlesByUser(userId);
  }
}

export class GetArticlesByUserPaginated {
  constructor(private repository: ArticleRepository) {}

  async execute(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }> {
    // Usar método avanzado si está disponible, sino usar el básico
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
}
