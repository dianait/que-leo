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
    await svc.markRead(1, true);
    await svc.delete(1, "u");
    expect(repo.markAsRead).toHaveBeenCalledWith(1, true);
    expect(repo.deleteArticle).toHaveBeenCalledWith(1, "u");
  });
});


