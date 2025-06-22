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
