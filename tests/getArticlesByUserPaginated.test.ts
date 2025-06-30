import { GetArticlesByUserPaginated } from "../src/application/GetArticlesByUser";

describe("GetArticlesByUserPaginated use case", () => {
  it("debería llamar al repositorio con los parámetros correctos y devolver los artículos y el total", async () => {
    const mockResult = {
      articles: [
        { id: 1, title: "A", url: "u", dateAdded: new Date(), isRead: false },
      ],
      total: 42,
    };
    const mockRepo = {
      getArticlesByUserPaginated: jest.fn().mockResolvedValue(mockResult),
    };
    const useCase = new GetArticlesByUserPaginated(mockRepo as any);
    const result = await useCase.execute("user-abc", 10, 20);
    expect(mockRepo.getArticlesByUserPaginated).toHaveBeenCalledWith(
      "user-abc",
      10,
      20
    );
    expect(result).toBe(mockResult);
  });

  it("propaga errores del repositorio", async () => {
    const mockRepo = {
      getArticlesByUserPaginated: jest
        .fn()
        .mockRejectedValue(new Error("fail")),
    };
    const useCase = new GetArticlesByUserPaginated(mockRepo as any);
    await expect(useCase.execute("u", 10, 0)).rejects.toThrow("fail");
  });
});
