import { Article } from "../domain/Article";
import { ArticleRepository } from "../domain/ArticleRepository";

export class AddArticle {
  constructor(private readonly repository: ArticleRepository) {}

  async execute(title: string, url: string, userId: string): Promise<Article> {
    return this.repository.addArticle(title, url, userId);
  }
}
