import type { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class GetArticlesByUser {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(userId: string): Promise<Article[]> {
    if (
      typeof this.repository.getArticlesByUserFromUserArticles === "function"
    ) {
      return this.repository.getArticlesByUserFromUserArticles(userId);
    }
    if (typeof this.repository.getArticlesByUser === "function") {
      return this.repository.getArticlesByUser(userId);
    }
    throw new Error(
      "No se encontró un método válido para obtener artículos del usuario"
    );
  }
}

export class GetArticlesByUserPaginated {
  constructor(private repository: ArticleRepository) {}

  async execute(
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
    if (typeof this.repository.getArticlesByUserPaginated === "function") {
      return this.repository.getArticlesByUserPaginated(userId, limit, offset);
    }
    throw new Error(
      "No se encontró un método válido para obtener artículos paginados del usuario"
    );
  }
}
