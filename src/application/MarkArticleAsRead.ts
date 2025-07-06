import type { ArticleRepository } from "../domain/ArticleRepository";

export class MarkArticleAsRead {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(articleId: number, isRead: boolean): Promise<void> {
    if (typeof this.repository.markAsRead === "function") {
      return this.repository.markAsRead(articleId, isRead);
    }
    throw new Error(
      "No se encontró un método válido para marcar artículos como leídos"
    );
  }
}
