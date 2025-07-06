import type { ArticleRepository } from "../domain/ArticleRepository";

export class DeleteArticle {
  constructor(private repository: ArticleRepository) {}

  async execute(articleId: number, userId: string): Promise<void> {
    return this.repository.deleteArticle(articleId, userId);
  }
}
