import type { Article } from "./Article";
import type { ArticleListFilters } from "./ArticleListFilters";

export interface ArticleRepository {
  // Basic methods - must be implemented by all repositories
  getAllArticles(): Promise<Article[]>;
  getArticlesByUser(userId: string): Promise<Article[]>;
  getArticlesByUserPaginated(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }>;
  deleteArticle(articleId: number, userId: string): Promise<void>;
  markAsRead(articleId: number, isRead: boolean, userId: string): Promise<void>;
  markAsFavorite(
    articleId: number,
    isFavorite: boolean,
    userId: string
  ): Promise<void>;
  getArticlesByUserFiltered?(
    userId: string,
    filters: ArticleListFilters,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }>;

  // Advanced methods - optional, for repositories that support relational structure
  getArticlesByUserFromUserArticles?(userId: string): Promise<Article[]>;
  getArticlesByUserFromUserArticlesPaginated?(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }>;
}
