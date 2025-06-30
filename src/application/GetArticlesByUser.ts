import type { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class GetArticlesByUser {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(userId: string): Promise<Article[]> {
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
    return this.repository.getArticlesByUserPaginated(userId, limit, offset);
  }
}
