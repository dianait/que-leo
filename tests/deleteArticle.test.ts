import { DeleteArticle } from "../src/application/DeleteArticle";

describe("DeleteArticle use case", () => {
  it("debería llamar al repositorio con el id y userId correctos", async () => {
    const mockRepo = {
      deleteArticle: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new DeleteArticle(mockRepo as any);
    await useCase.execute(123, "user-abc");
    expect(mockRepo.deleteArticle).toHaveBeenCalledWith(123, "user-abc");
  });

  it("propaga errores del repositorio", async () => {
    const mockRepo = {
      deleteArticle: jest.fn().mockRejectedValue(new Error("fail")),
    };
    const useCase = new DeleteArticle(mockRepo as any);
    await expect(useCase.execute(1, "u")).rejects.toThrow("fail");
  });
});
