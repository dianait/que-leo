import { ArticleRepository } from "../domain/ArticleRepository";

export class MarkArticleAsRead {
  constructor(private readonly repository: ArticleRepository) {}

  async execute(articleId: number, isRead: boolean): Promise<void> {
    return this.repository.markAsRead(articleId, isRead);
  }
}
