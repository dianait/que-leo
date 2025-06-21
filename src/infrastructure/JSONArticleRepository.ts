import { Article } from "../domain/Article";
import type { ArticleRepository } from "../domain/ArticleRepository";

interface ArticleJSON {
  id: string;
  title: string;
  url: string;
  dateAdded: string;
}

export class JsonArticleRepository implements ArticleRepository {
  async getAllArticles(): Promise<Article[]> {
    const data = await import("../data/articles.json");
    const rawArticles = data.default ?? data;
    return rawArticles.map(
      (item: ArticleJSON) =>
        new Article(item.id, item.title, item.url, new Date(item.dateAdded))
    );
  }
}
