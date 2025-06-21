import { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class GetAllArticles {
  private repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Article[]> {
    return await this.repository.getAllArticles();
  }
}
