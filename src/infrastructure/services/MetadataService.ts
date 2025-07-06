export interface ArticleMetadata {
  title: string;
  description: string | null;
  language: string;
  authors: string[];
  topics: string[];
  featuredimage: string | null;
}

export interface MetadataResponse {
  success: boolean;
  data: ArticleMetadata;
  url: string;
}

export class MetadataService {
  private static readonly BASE_URL =
    "https://queleotelegrambot-production.up.railway.app/api";

  static async extractMetadata(url: string): Promise<ArticleMetadata> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/extract-metadata?url=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        throw new Error(
          `Error al extraer metadatos: ${response.status} ${response.statusText}`
        );
      }

      const data: MetadataResponse = await response.json();

      if (!data.success) {
        throw new Error("Error en la respuesta del servidor de metadatos");
      }

      return data.data;
    } catch (error) {
      console.error("Error extrayendo metadatos:", error);
      throw new Error(
        `No se pudieron extraer los metadatos: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }
}
