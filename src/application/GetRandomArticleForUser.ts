import type { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class GetRandomArticleForUser {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(userId: string): Promise<Article | null> {
    let articles: Article[];

    // Intentar usar el método nuevo primero
    if (
      typeof this.repository.getArticlesByUserFromUserArticles === "function"
    ) {
      articles = await this.repository.getArticlesByUserFromUserArticles(
        userId
      );
    } else if (typeof this.repository.getArticlesByUser === "function") {
      articles = await this.repository.getArticlesByUser(userId);
    } else {
      throw new Error(
        "No se encontró un método válido para obtener artículos del usuario"
      );
    }

    if (articles.length === 0) {
      return null;
    }

    // Priorizar artículos no leídos
    const unreadArticles = articles.filter((article) => !article.isRead);

    if (unreadArticles.length > 0) {
      const randomIndex = Math.floor(Math.random() * unreadArticles.length);
      return unreadArticles[randomIndex];
    }

    // Si todos están leídos, devolver uno aleatorio
    const randomIndex = Math.floor(Math.random() * articles.length);
    return articles[randomIndex];
  }
}
