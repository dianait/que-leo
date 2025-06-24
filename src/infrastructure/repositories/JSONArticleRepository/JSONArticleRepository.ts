import type { Article } from "../../../domain/Article";
import type { ArticleRepository } from "../../../domain/ArticleRepository";
import articlesData from "../../data/eferro.json";

export class JsonArticleRepository implements ArticleRepository {
  async getAllArticles(): Promise<Article[]> {
    // Aseguramos que los datos se cargan correctamente
    const rawArticles = articlesData ?? [];
    return rawArticles.map((item: unknown) => {
      const obj = item as Record<string, unknown>;
      return {
        id:
          (obj.airtable_id as string) ||
          `${obj.Name as string}-${obj.Url as string}`,
        title: obj.Name as string,
        url: obj.Url as string,
        dateAdded: new Date(obj.Created as string),
        isRead: false,
        language: obj.Language as string | undefined,
      };
    });
  }

  async getArticlesByUser(userId: string): Promise<Article[]> {
    // Para el repositorio JSON, devolvemos todos los artículos
    // ya que no tenemos información de usuario en el archivo JSON
    void userId; // Suppress unused parameter warning
    return this.getAllArticles();
  }

  async addArticle(
    title: string,
    url: string,
    userId: string,
    language?: string | null,
    authors?: string[] | null,
    topics?: string[] | null,
    less_15?: boolean | null
  ): Promise<Article> {
    void userId;
    const newId = Date.now().toString();
    const newArticle: Article = {
      id: newId,
      title,
      url,
      dateAdded: new Date(),
      isRead: false,
      language: language ?? undefined,
      authors: authors ?? undefined,
      topics: topics ?? undefined,
      less_15: less_15 ?? undefined,
    };
    console.warn(
      "JsonArticleRepository: Los cambios no se persisten en el archivo JSON"
    );
    return newArticle;
  }

  async markAsRead(articleId: number, isRead: boolean): Promise<void> {
    void articleId;
    void isRead;
    console.warn(
      "JsonArticleRepository: La operación markAsRead no se persiste en el archivo JSON"
    );
  }

  async deleteArticle(articleId: number, userId: string): Promise<void> {
    // Para el repositorio JSON, simulamos la eliminación
    // En un entorno real, esto no funcionaría con un archivo JSON estático
    void articleId; // Suppress unused parameter warning
    void userId; // Suppress unused parameter warning
    console.warn(
      "JsonArticleRepository: Los cambios no se persisten en el archivo JSON"
    );
  }
}
