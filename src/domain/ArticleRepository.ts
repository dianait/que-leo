import type { Article } from "./Article";

export interface ArticleRepository {
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
    less_15?: boolean | null
  ): Promise<Article>;
  deleteArticle(articleId: number, userId: string): Promise<void>;
  markAsRead(articleId: number, isRead: boolean): Promise<void>;

  // Métodos opcionales para repositorios avanzados (como Supabase)
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
  getArticlesByUserFromUserArticles?(userId: string): Promise<Article[]>;
  getArticlesByUserFromUserArticlesPaginated?(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }>;
}
