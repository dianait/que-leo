import type { Article } from "../domain/Article";
import { pickRandomUnreadArticle } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class GetRandomArticleForUser {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(userId: string): Promise<Article | null> {
    let articles: Article[];

    // Use advanced method if available, otherwise the basic one
    if (
      typeof this.repository.getArticlesByUserFromUserArticles === "function"
    ) {
      articles = await this.repository.getArticlesByUserFromUserArticles(
        userId
      );
    } else {
      articles = await this.repository.getArticlesByUser(userId);
    }

    if (articles.length === 0) {
      return null;
    }

    const unreadPick = pickRandomUnreadArticle(articles);
    if (unreadPick) {
      return unreadPick;
    }

    const randomIndex = Math.floor(Math.random() * articles.length);
    return articles[randomIndex];
  }
}
