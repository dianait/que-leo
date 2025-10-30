import { MarkArticleAsRead } from "../src/application/MarkArticleAsRead";

describe("MarkArticleAsRead use case", () => {
  it("llama al repositorio con el id y estado correcto", async () => {
    const repo = { markAsRead: jest.fn().mockResolvedValue(undefined) } as any;
    const useCase = new MarkArticleAsRead(repo);

    await useCase.execute(123, true);

    expect(repo.markAsRead).toHaveBeenCalledTimes(1);
    expect(repo.markAsRead).toHaveBeenCalledWith(123, true);
  });

  it("propaga errores del repositorio", async () => {
    const repo = {
      markAsRead: jest.fn().mockRejectedValue(new Error("boom")),
    } as any;
    const useCase = new MarkArticleAsRead(repo);

    await expect(useCase.execute(1, true)).rejects.toThrow("boom");
  });
});
