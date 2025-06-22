import { Article } from "../../../domain/Article";
import type { ArticleRepository } from "../../../domain/ArticleRepository";
import articlesData from "../../data/articles.json";

interface ArticleJSON {
  id: string;
  title: string;
  url: string;
  dateAdded: string;
}

export class JsonArticleRepository implements ArticleRepository {
  async getAllArticles(): Promise<Article[]> {
    // Aseguramos que los datos se cargan correctamente
    const rawArticles = articlesData ?? [];
    return rawArticles.map(
      (item: ArticleJSON) =>
        new Article(item.id, item.title, item.url, new Date(item.dateAdded))
    );
  }

  async getArticlesByUser(userId: string): Promise<Article[]> {
    // Para el repositorio JSON, devolvemos todos los artículos
    // ya que no tenemos información de usuario en el archivo JSON
    void userId; // Suppress unused parameter warning
    return this.getAllArticles();
  }

   
  async addArticle(title: string, url: string): Promise<Article> {
    // Para el repositorio JSON, simulamos la adición
    // En un entorno real, esto no funcionaría con un archivo JSON estático
    const newId = Date.now().toString();
    const newArticle = new Article(newId, title, url, new Date());

    // Nota: En un entorno real, esto no persistiría los cambios
    console.warn(
      "JsonArticleRepository: Los cambios no se persisten en el archivo JSON"
    );

    return newArticle;
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
