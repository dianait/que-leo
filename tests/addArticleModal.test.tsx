import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AddArticle } from "../src/ui/AddArticle/AddArticleModal";
import { MetadataService } from "../src/infrastructure/services/MetadataService";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import type { ArticleRepository } from "../src/domain/ArticleRepository";
import type { Article } from "../src/domain/Article";

// Mock del MetadataService
jest.mock("../src/infrastructure/services/MetadataService");
const MockedMetadataService = MetadataService as jest.Mocked<
  typeof MetadataService
>;

// Mock del contexto de autenticación
const mockUser = {
  id: "user123",
  email: "test@example.com",
  name: "Test User",
};

const mockAuthContext = {
  user: mockUser,
  signIn: jest.fn(),
  signOut: jest.fn(),
  loading: false,
};

jest.mock("../src/domain/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}));

const mockBumpRefresh = jest.fn();
jest.mock("../src/ui/context/ArticlesRefreshContext", () => ({
  useArticlesRefresh: () => ({ version: 0, bumpRefresh: mockBumpRefresh }),
}));

// Helper para renderizar con el contexto del repositorio
function renderWithRepo(ui: React.ReactElement, repo: ArticleRepository) {
  return render(
    <ArticleRepositoryContext.Provider value={repo}>
      {ui}
    </ArticleRepositoryContext.Provider>
  );
}

// Mock del repositorio
let mockRepository: jest.Mocked<ArticleRepository>;

beforeEach(() => {
  mockRepository = {
    getAllArticles: jest.fn(),
    getArticlesByUser: jest.fn(),
    getArticlesByUserPaginated: jest.fn(),
    addArticle: jest.fn(),
    deleteArticle: jest.fn(),
    markAsRead: jest.fn(),
    markAsFavorite: jest.fn(),
    addArticleToUser: jest.fn(),
    getArticlesByUserFromUserArticles: jest.fn(),
    getArticlesByUserFromUserArticlesPaginated: jest.fn(),
  };
  jest.clearAllMocks();
  mockBumpRefresh.mockClear();
});

describe("AddArticleModal con extracción automática de metadatos", () => {
  describe("extracción automática de metadatos", () => {
    it("debería extraer metadatos automáticamente al añadir artículo", async () => {
      const mockMetadata = {
        title: "Mozilla - Internet for people, not profit (US)",
        description: "Mozilla es una organización sin fines de lucro",
        language: "en",
        authors: ["Mozilla Team"],
        topics: ["technology", "privacy"],
        featuredimage:
          "https://www.mozilla.org/media/img/m24/og.3a69dffad83e.png",
      };

      const mockArticle: Article = {
        id: 1,
        title: mockMetadata.title,
        url: "https://www.mozilla.org",
        dateAdded: new Date(),
        isRead: false,
        language: mockMetadata.language,
        authors: mockMetadata.authors,
        topics: mockMetadata.topics,
        featuredImage: mockMetadata.featuredimage || undefined,
      };

      MockedMetadataService.extractMetadata.mockResolvedValue(mockMetadata);
      (mockRepository.addArticleToUser as jest.Mock).mockResolvedValue(
        mockArticle
      );

      renderWithRepo(<AddArticle />, mockRepository);

      // Abrir modal
      fireEvent.click(screen.getByText("+ Nuevo"));

      // Ingresar URL
      const urlInput = screen.getByPlaceholderText(
        "https://ejemplo.com/articulo"
      );
      fireEvent.change(urlInput, {
        target: { value: "https://www.mozilla.org" },
      });

      // Enviar formulario
      fireEvent.click(screen.getByText("Añadir artículo 📚"));

      await waitFor(() => {
        expect(MockedMetadataService.extractMetadata).toHaveBeenCalledWith(
          "https://www.mozilla.org"
        );
        expect(mockRepository.addArticleToUser).toHaveBeenCalledWith(
          mockMetadata.title,
          "https://www.mozilla.org",
          "user123",
          mockMetadata.language,
          mockMetadata.authors,
          mockMetadata.topics,
          null,
          mockMetadata.featuredimage
        );
        expect(mockBumpRefresh).toHaveBeenCalled();
      });
    });

    it("debería usar título ingresado por usuario si está disponible", async () => {
      const mockMetadata = {
        title: "Título Extraído Automáticamente",
        description: null,
        language: "es",
        authors: [],
        topics: [],
        featuredimage: null,
      };

      const mockArticle: Article = {
        id: 1,
        title: "Título del Usuario",
        url: "https://example.com",
        dateAdded: new Date(),
        isRead: false,
        language: mockMetadata.language,
        authors: mockMetadata.authors,
        topics: mockMetadata.topics,
        featuredImage: mockMetadata.featuredimage || undefined,
      };

      MockedMetadataService.extractMetadata.mockResolvedValue(mockMetadata);
      (mockRepository.addArticleToUser as jest.Mock).mockResolvedValue(
        mockArticle
      );

      renderWithRepo(<AddArticle />, mockRepository);

      // Abrir modal
      fireEvent.click(screen.getByText("+ Nuevo"));

      // Ingresar URL y título
      const urlInput = screen.getByPlaceholderText(
        "https://ejemplo.com/articulo"
      );
      const titleInput = screen.getByPlaceholderText(
        "Se extraerá automáticamente si se deja vacío"
      );

      fireEvent.change(urlInput, { target: { value: "https://example.com" } });
      fireEvent.change(titleInput, { target: { value: "Título del Usuario" } });

      // Enviar formulario
      fireEvent.click(screen.getByText("Añadir artículo 📚"));

      await waitFor(() => {
        expect(mockRepository.addArticleToUser).toHaveBeenCalledWith(
          "Título del Usuario", // Usa el título del usuario, no el extraído
          "https://example.com",
          "user123",
          mockMetadata.language,
          mockMetadata.authors,
          mockMetadata.topics,
          null,
          mockMetadata.featuredimage
        );
      });
    });

    it("debería continuar sin metadatos si falla la extracción", async () => {
      const mockArticle: Article = {
        id: 1,
        title: "Título del Usuario",
        url: "https://example.com",
        dateAdded: new Date(),
        isRead: false,
      };

      MockedMetadataService.extractMetadata.mockRejectedValue(
        new Error("Error de red")
      );
      (mockRepository.addArticleToUser as jest.Mock).mockResolvedValue(
        mockArticle
      );

      renderWithRepo(<AddArticle />, mockRepository);

      // Abrir modal
      fireEvent.click(screen.getByText("+ Nuevo"));

      // Ingresar URL y título
      const urlInput = screen.getByPlaceholderText(
        "https://ejemplo.com/articulo"
      );
      const titleInput = screen.getByPlaceholderText(
        "Se extraerá automáticamente si se deja vacío"
      );

      fireEvent.change(urlInput, { target: { value: "https://example.com" } });
      fireEvent.change(titleInput, { target: { value: "Título del Usuario" } });

      // Enviar formulario
      fireEvent.click(screen.getByText("Añadir artículo 📚"));

      await waitFor(() => {
        expect(mockRepository.addArticleToUser).toHaveBeenCalledWith(
          "Título del Usuario",
          "https://example.com",
          "user123",
          null,
          null,
          null,
          null,
          null
        );
      });
    });

    it("debería agregar https:// si la URL no tiene protocolo", async () => {
      const mockMetadata = {
        title: "Test Article",
        description: null,
        language: "en",
        authors: [],
        topics: [],
        featuredimage: null,
      };

      const mockArticle: Article = {
        id: 1,
        title: mockMetadata.title,
        url: "https://example.com",
        dateAdded: new Date(),
        isRead: false,
      };

      MockedMetadataService.extractMetadata.mockResolvedValue(mockMetadata);
      (mockRepository.addArticleToUser as jest.Mock).mockResolvedValue(
        mockArticle
      );

      const { container } = renderWithRepo(<AddArticle />, mockRepository);

      // Abrir modal
      fireEvent.click(screen.getByText("+ Nuevo"));

      // Ingresar URL sin protocolo
      fireEvent.change(
        screen.getByPlaceholderText("https://ejemplo.com/articulo"),
        { target: { value: "example.com" } }
      );

      // Enviar formulario directamente (saltando validación del input url)
      const form = container.querySelector("form.add-article-form");
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(MockedMetadataService.extractMetadata).toHaveBeenCalledWith(
          "https://example.com"
        );
        expect(mockRepository.addArticleToUser).toHaveBeenCalledWith(
          mockMetadata.title,
          "https://example.com",
          "user123",
          mockMetadata.language,
          mockMetadata.authors,
          mockMetadata.topics,
          null,
          mockMetadata.featuredimage
        );
      });
    });
  });

  describe("manejo de errores", () => {
    it("debería mostrar error si falla la inserción en la base de datos", async () => {
      const mockMetadata = {
        title: "Test Article",
        description: null,
        language: "en",
        authors: [],
        topics: [],
        featuredimage: null,
      };

      MockedMetadataService.extractMetadata.mockResolvedValue(mockMetadata);
      (mockRepository.addArticleToUser as jest.Mock).mockRejectedValue(
        new Error("Error de base de datos")
      );

      renderWithRepo(<AddArticle />, mockRepository);

      // Abrir modal
      fireEvent.click(screen.getByText("+ Nuevo"));

      // Ingresar URL
      const urlInput = screen.getByPlaceholderText(
        "https://ejemplo.com/articulo"
      );
      fireEvent.change(urlInput, { target: { value: "https://example.com" } });

      // Enviar formulario
      fireEvent.click(screen.getByText("Añadir artículo 📚"));

      await waitFor(() => {
        expect(screen.getByText("Error de base de datos")).toBeInTheDocument();
      });
    });
  });
});
