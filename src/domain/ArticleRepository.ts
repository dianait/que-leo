import { Article } from "./Article";

export interface ArticleRepository {
  getAllArticles(): Promise<Article[]>;
  getArticlesByUser(userId: string): Promise<Article[]>;
  addArticle(title: string, url: string): Promise<Article>;
  deleteArticle(articleId: number, userId: string): Promise<void>;
}
