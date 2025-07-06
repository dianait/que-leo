import type { ArticleRepository } from "../domain/ArticleRepository";

export class MarkArticleAsRead {
  private readonly repository: ArticleRepository;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  async execute(articleId: number, isRead: boolean): Promise<void> {
    return this.repository.markAsRead(articleId, isRead);
  }
}
