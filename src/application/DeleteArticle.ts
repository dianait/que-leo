import type { ArticleRepository } from "../domain/ArticleRepository";

export class DeleteArticle {
  constructor(private repository: ArticleRepository) {}

  async execute(articleId: number, userId: string): Promise<void> {
    if (typeof this.repository.deleteArticle === "function") {
      return this.repository.deleteArticle(articleId, userId);
    }
    throw new Error("No se encontró un método válido para eliminar artículos");
  }
}
