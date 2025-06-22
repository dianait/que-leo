import { Article } from "../domain/Article";
import { ArticleRepository } from "../domain/ArticleRepository";

export class GetRandomArticleForUser {
  constructor(private readonly repository: ArticleRepository) {}

  async execute(userId: string): Promise<Article | null> {
    const articles = await this.repository.getArticlesByUser(userId);
    if (articles.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * articles.length);
    return articles[randomIndex];
  }
}
