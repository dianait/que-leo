import { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class GetRandomArticle {
  private repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Article> {
    const articles = await this.repository.getAllArticles();
    const randomIndex = Math.floor(Math.random() * articles.length);
    return articles[randomIndex];
  }
}
