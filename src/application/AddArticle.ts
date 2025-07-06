import type { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

export class AddArticle {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(
    title: string,
    url: string,
    userId: string,
    language?: string | null,
    authors?: string[] | null,
    topics?: string[] | null,
    less_15?: boolean | null,
    featuredImage?: string | null
  ): Promise<Article> {
    if (typeof this.repository.addArticleToUser === "function") {
      return this.repository.addArticleToUser(
        title,
        url,
        userId,
        language,
        authors,
        topics,
        less_15,
        featuredImage
      );
    }
    if (typeof this.repository.addArticle === "function") {
      return this.repository.addArticle(
        title,
        url,
        userId,
        language,
        authors,
        topics,
        less_15,
        featuredImage
      );
    }
    throw new Error("No se encontró un método válido para añadir artículos");
  }
}
