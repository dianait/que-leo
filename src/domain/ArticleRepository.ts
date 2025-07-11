import type { Article } from "./Article";

export interface ArticleRepository {
  // Métodos básicos - deben ser implementados por todos los repositorios
  getAllArticles(): Promise<Article[]>;
  getArticlesByUser(userId: string): Promise<Article[]>;
  getArticlesByUserPaginated(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }>;
  addArticle(
    title: string,
    url: string,
    userId: string,
    language?: string | null,
    authors?: string[] | null,
    topics?: string[] | null,
    less_15?: boolean | null,
    featuredImage?: string | null
  ): Promise<Article>;
  deleteArticle(articleId: number, userId: string): Promise<void>;
  markAsRead(articleId: number, isRead: boolean): Promise<void>;

  // Métodos avanzados - opcionales, para repositorios que soporten estructura relacional
  getArticlesByUserFromUserArticles?(userId: string): Promise<Article[]>;
  getArticlesByUserFromUserArticlesPaginated?(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }>;
  addArticleToUser?(
    title: string,
    url: string,
    userId: string,
    language?: string | null,
    authors?: string[] | null,
    topics?: string[] | null,
    less_15?: boolean | null,
    featuredImage?: string | null
  ): Promise<Article>;
}
