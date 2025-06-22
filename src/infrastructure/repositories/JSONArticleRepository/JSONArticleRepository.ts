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
}
