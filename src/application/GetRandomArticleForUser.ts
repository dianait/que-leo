import type { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class GetRandomArticleForUser {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(userId: string): Promise<Article | null> {
    let articles: Article[];

    // Usar método avanzado si está disponible, sino usar el básico
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

    // Prioritize unread articles
    const unreadArticles = articles.filter((article) => !article.isRead);

    if (unreadArticles.length > 0) {
      const randomIndex = Math.floor(Math.random() * unreadArticles.length);
      return unreadArticles[randomIndex];
    }

    // If everything is read, return a random one
    const randomIndex = Math.floor(Math.random() * articles.length);
    return articles[randomIndex];
  }
}
