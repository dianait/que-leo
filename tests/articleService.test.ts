import { ArticleService } from "../src/application/ArticleService";

describe("ArticleService", () => {
  it("delegates getByUserPaginated to repository", async () => {
    const mockResult = { articles: [], total: 10 };
    const repo = {
      getArticlesByUserPaginated: jest.fn().mockResolvedValue(mockResult),
    } as any;
    const svc = new ArticleService(repo);
    const r = await svc.getByUserPaginated("u", 10, 0);
    expect(repo.getArticlesByUserPaginated).toHaveBeenCalledWith("u", 10, 0);
    expect(r).toBe(mockResult);
  });

  it("delegates add with advanced method when present", async () => {
    const mockArticle = { id: 1 } as any;
    const repo = {
      addArticleToUser: jest.fn().mockResolvedValue(mockArticle),
    } as any;
    const svc = new ArticleService(repo);
    const r = await svc.add({ title: "t", url: "u", userId: "u1" });
    expect(repo.addArticleToUser).toHaveBeenCalled();
    expect(r).toBe(mockArticle);
  });

  it("delegates markRead and delete", async () => {
    const repo = {
      markAsRead: jest.fn().mockResolvedValue(undefined),
      deleteArticle: jest.fn().mockResolvedValue(undefined),
    } as any;
    const svc = new ArticleService(repo);
    await svc.markRead(1, true, "u");
    await svc.delete(1, "u");
    expect(repo.markAsRead).toHaveBeenCalledWith(1, true, "u");
    expect(repo.deleteArticle).toHaveBeenCalledWith(1, "u");
  });

  it("delegates markFavorite to repository", async () => {
    const repo = {
      markAsFavorite: jest.fn().mockResolvedValue(undefined),
    } as any;
    const svc = new ArticleService(repo);
    await svc.markFavorite(1, true, "u");
    expect(repo.markAsFavorite).toHaveBeenCalledWith(1, true, "u");

    await svc.markFavorite(2, false, "u");
    expect(repo.markAsFavorite).toHaveBeenCalledWith(2, false, "u");
  });

  it("delegates getByUserFiltered to repository", async () => {
    const mockResult = { articles: [], total: 0 };
    const repo = {
      getArticlesByUserFiltered: jest.fn().mockResolvedValue(mockResult),
    } as any;
    const svc = new ArticleService(repo);
    const filters = { searchTerm: "react", readFilter: "unread" as const };
    const result = await svc.getByUserFiltered("u", filters, 15, 0);
    expect(repo.getArticlesByUserFiltered).toHaveBeenCalledWith(
      "u",
      filters,
      15,
      0
    );
    expect(result).toBe(mockResult);
  });
});


