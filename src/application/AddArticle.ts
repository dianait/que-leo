import type { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class AddArticle {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(title: string, url: string, userId: string): Promise<Article> {
    if (typeof this.repository.addArticleToUser === "function") {
      return this.repository.addArticleToUser(title, url, userId);
    }
    return this.repository.addArticle(title, url, userId);
  }
}
