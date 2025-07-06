import { AddArticle } from "../src/application/AddArticle";
import type { ArticleRepository } from "../src/domain/ArticleRepository";
import type { Article } from "../src/domain/Article";

// Mock del repositorio
const mockRepository: jest.Mocked<ArticleRepository> = {
  getAllArticles: jest.fn(),
  getArticlesByUser: jest.fn(),
  getArticlesByUserPaginated: jest.fn(),
  addArticle: jest.fn(),
  deleteArticle: jest.fn(),
  markAsRead: jest.fn(),
  addArticleToUser: jest.fn(),
  getArticlesByUserFromUserArticles: jest.fn(),
  getArticlesByUserFromUserArticlesPaginated: jest.fn(),
};

describe("AddArticle con metadatos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("debería añadir artículo con metadatos usando addArticleToUser cuando está disponible", async () => {
      const mockArticle: Article = {
        id: 1,
        title: "Test Article",
        url: "https://example.com",
        dateAdded: new Date(),
        isRead: false,
        language: "en",
        authors: ["Test Author"],
        topics: ["technology"],
        featuredImage: "https://example.com/image.jpg",
      };

      mockRepository.addArticleToUser = jest
        .fn()
        .mockResolvedValue(mockArticle);

      const addArticleUseCase = new AddArticle(mockRepository);
      const result = await addArticleUseCase.execute(
        "Test Article",
        "https://example.com",
        "user123",
        "en",
        ["Test Author"],
        ["technology"],
        false,
        "https://example.com/image.jpg"
      );

      expect(mockRepository.addArticleToUser).toHaveBeenCalledWith(
        "Test Article",
        "https://example.com",
        "user123",
        "en",
        ["Test Author"],
        ["technology"],
        false,
        "https://example.com/image.jpg"
      );
      expect(mockRepository.addArticle).not.toHaveBeenCalled();
      expect(result).toEqual(mockArticle);
    });

    it("debería añadir artículo con metadatos usando addArticle cuando addArticleToUser no está disponible", async () => {
      const mockArticle: Article = {
        id: 1,
        title: "Test Article",
        url: "https://example.com",
        dateAdded: new Date(),
        isRead: false,
        language: "es",
        authors: ["Autor Test"],
        topics: ["tecnología"],
        featuredImage: "https://example.com/imagen.jpg",
      };

      // No definir addArticleToUser para que use addArticle
      delete mockRepository.addArticleToUser;
      mockRepository.addArticle = jest.fn().mockResolvedValue(mockArticle);

      const addArticleUseCase = new AddArticle(mockRepository);
      const result = await addArticleUseCase.execute(
        "Test Article",
        "https://example.com",
        "user123",
        "es",
        ["Autor Test"],
        ["tecnología"],
        true,
        "https://example.com/imagen.jpg"
      );

      expect(mockRepository.addArticle).toHaveBeenCalledWith(
        "Test Article",
        "https://example.com",
        "user123",
        "es",
        ["Autor Test"],
        ["tecnología"],
        true,
        "https://example.com/imagen.jpg"
      );
      expect(result).toEqual(mockArticle);
    });

    it("debería manejar valores nulos en metadatos", async () => {
      const mockArticle: Article = {
        id: 1,
        title: "Test Article",
        url: "https://example.com",
        dateAdded: new Date(),
        isRead: false,
      };

      mockRepository.addArticleToUser = jest
        .fn()
        .mockResolvedValue(mockArticle);

      const addArticleUseCase = new AddArticle(mockRepository);
      const result = await addArticleUseCase.execute(
        "Test Article",
        "https://example.com",
        "user123",
        null,
        null,
        null,
        null,
        null
      );

      expect(mockRepository.addArticleToUser).toHaveBeenCalledWith(
        "Test Article",
        "https://example.com",
        "user123",
        null,
        null,
        null,
        null,
        null
      );
      expect(result).toEqual(mockArticle);
    });

    it("debería propagar errores del repositorio", async () => {
      const errorMessage = "Error de base de datos";
      mockRepository.addArticleToUser = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      const addArticleUseCase = new AddArticle(mockRepository);

      await expect(
        addArticleUseCase.execute(
          "Test Article",
          "https://example.com",
          "user123"
        )
      ).rejects.toThrow(errorMessage);
    });
  });
});
