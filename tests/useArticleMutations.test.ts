import { ArticleService } from "../src/application/ArticleService";
import type { ArticleRepository } from "../src/domain/ArticleRepository";

describe("useArticleMutations", () => {
  const mockRepository: ArticleRepository = {
    getAllArticles: jest.fn(),
    getArticlesByUser: jest.fn(),
    getArticlesByUserPaginated: jest.fn(),
    deleteArticle: jest.fn().mockResolvedValue(undefined),
    markAsRead: jest.fn().mockResolvedValue(undefined),
    markAsFavorite: jest.fn().mockResolvedValue(undefined),
  };

  it("delegates markRead to ArticleService with userId", async () => {
    const svc = new ArticleService(mockRepository);
    await svc.markRead(1, true, "user-123");
    expect(mockRepository.markAsRead).toHaveBeenCalledWith(1, true, "user-123");
  });

  it("delegates markFavorite to ArticleService with userId", async () => {
    const svc = new ArticleService(mockRepository);
    await svc.markFavorite(2, false, "user-123");
    expect(mockRepository.markAsFavorite).toHaveBeenCalledWith(
      2,
      false,
      "user-123"
    );
  });

  it("delegates delete to ArticleService with userId", async () => {
    const svc = new ArticleService(mockRepository);
    await svc.delete(3, "user-123");
    expect(mockRepository.deleteArticle).toHaveBeenCalledWith(3, "user-123");
  });
});
