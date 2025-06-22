import type { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class AddArticle {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(title: string, url: string, userId: string): Promise<Article> {
    return this.repository.addArticle(title, url, userId);
  }
}
