import { Article } from "../domain/Article";
import { ArticleRepository } from "../domain/ArticleRepository";

export class GetArticlesByUser {
  constructor(private readonly repository: ArticleRepository) {}

  async execute(userId: string): Promise<Article[]> {
    return this.repository.getArticlesByUser(userId);
  }
}
