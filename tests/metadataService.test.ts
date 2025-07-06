import {
  MetadataService,
  type ArticleMetadata,
} from "../src/infrastructure/services/MetadataService";

// Mock de fetch global
global.fetch = jest.fn();

describe("MetadataService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("extractMetadata", () => {
    it("debería extraer metadatos correctamente de una URL válida", async () => {
      const mockMetadata: ArticleMetadata = {
        title: "Mozilla - Internet for people, not profit (US)",
        description: "Mozilla es una organización sin fines de lucro",
        language: "en",
        authors: ["Mozilla Team"],
        topics: ["technology", "privacy"],
        featuredimage:
          "https://www.mozilla.org/media/img/m24/og.3a69dffad83e.png",
      };

      const mockResponse = {
        success: true,
        data: mockMetadata,
        url: "https://www.mozilla.org",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await MetadataService.extractMetadata(
        "https://www.mozilla.org"
      );

      expect(fetch).toHaveBeenCalledWith(
        "https://queleotelegrambot-production.up.railway.app/api/extract-metadata?url=https%3A%2F%2Fwww.mozilla.org"
      );
      expect(result).toEqual(mockMetadata);
    });

    it("debería manejar URLs sin protocolo (el servicio recibe la URL tal como se envía)", async () => {
      const mockMetadata: ArticleMetadata = {
        title: "Test Article",
        description: null,
        language: "es",
        authors: [],
        topics: [],
        featuredimage: null,
      };

      const mockResponse = {
        success: true,
        data: mockMetadata,
        url: "example.com",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await MetadataService.extractMetadata("example.com");

      expect(fetch).toHaveBeenCalledWith(
        "https://queleotelegrambot-production.up.railway.app/api/extract-metadata?url=example.com"
      );
    });

    it("debería lanzar error cuando la respuesta no es exitosa", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(
        MetadataService.extractMetadata("https://example.com")
      ).rejects.toThrow(
        "Error al extraer metadatos: 500 Internal Server Error"
      );
    });

    it("debería lanzar error cuando la respuesta del servidor indica fallo", async () => {
      const mockResponse = {
        success: false,
        data: null,
        url: "https://example.com",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(
        MetadataService.extractMetadata("https://example.com")
      ).rejects.toThrow("Error en la respuesta del servidor de metadatos");
    });

    it("debería lanzar error cuando hay un error de red", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      await expect(
        MetadataService.extractMetadata("https://example.com")
      ).rejects.toThrow("No se pudieron extraer los metadatos: Network error");
    });

    it("debería lanzar error cuando la respuesta JSON es inválida", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(
        MetadataService.extractMetadata("https://example.com")
      ).rejects.toThrow("No se pudieron extraer los metadatos: Invalid JSON");
    });
  });
});
