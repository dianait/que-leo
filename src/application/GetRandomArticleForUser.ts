import { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class GetRandomArticleForUser {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(userId: string): Promise<Article | null> {
    const articles = await this.repository.getArticlesByUser(userId);
    if (articles.length === 0) {
      return null;
    }

    // Primero intentar con artículos no leídos
    const unreadArticles = articles.filter((article) => !article.isRead);

    if (unreadArticles.length > 0) {
      // Si hay artículos no leídos, elegir uno aleatorio
      const randomIndex = Math.floor(Math.random() * unreadArticles.length);
      return unreadArticles[randomIndex];
    } else {
      // Si todos están leídos, elegir uno aleatorio de todos
      const randomIndex = Math.floor(Math.random() * articles.length);
      return articles[randomIndex];
    }
  }
}
