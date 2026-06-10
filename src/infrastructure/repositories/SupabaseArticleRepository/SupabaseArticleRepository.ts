import { SupabaseClient } from "@supabase/supabase-js";
import type { Article } from "../../../domain/Article";
import type { ArticleRepository } from "../../../domain/ArticleRepository";
import { createSupabaseClient } from "./supabaseConfig";

// Raw row shape returned by Supabase (snake_case DB columns)
interface ArticleRow {
  id: number;
  title: string;
  url: string;
  created_at: string;
  language?: string;
  authors?: string[];
  topics?: string[];
  less_15?: boolean;
  featured_image?: string;
}

// ⚠️ Best practices:
// - Activa Row Level Security (RLS) en todas las tablas de Supabase.
// - Nunca uses claves de servicio (service role) en el frontend.
// - Solo usa la anon key en el navegador.

interface SupabaseRepoOptions {
  supabaseUrl?: string;
  supabaseKey?: string;
  client?: SupabaseClient;
}

export class SupabaseArticleRepository implements ArticleRepository {
  public supabase: SupabaseClient;
  private static instance: SupabaseArticleRepository | null = null;

  private constructor(options: SupabaseRepoOptions = {}) {
    if (options.client) {
      this.supabase = options.client;
    } else {
      this.supabase = createSupabaseClient(
        options.supabaseUrl,
        options.supabaseKey
      );
    }
  }

  public static getInstance(
    options: SupabaseRepoOptions = {}
  ): SupabaseArticleRepository {
    if (!SupabaseArticleRepository.instance) {
      SupabaseArticleRepository.instance = new SupabaseArticleRepository(
        options
      );
    }
    return SupabaseArticleRepository.instance;
  }

  // Method to reset the instance (useful for tests)
  public static resetInstance(): void {
    SupabaseArticleRepository.instance = null;
  }

  /**
  * Fetch user articles using the user_articles <-> articles relationship
   * Devuelve los datos en el mismo formato Article[] que el resto de métodos
   */
  async getArticlesByUserFromUserArticles(userId: string): Promise<Article[]> {
    try {
      type UserArticleRow = {
        is_read: boolean;
        read_at?: string;
        added_at?: string;
        updated_at?: string;
        article_id: number;
        is_favorite?: boolean;
        ai_rating?: number | null;
        ai_rating_reason?: string | null;
        ai_summary?: string | null;
        ai_decision?: string | null;
        articles: ArticleRow | ArticleRow[] | null | undefined;
      };
      const { data, error } = await this.supabase
        .from("user_articles")
        .select(
          `
          is_read,
          read_at,
          added_at,
          updated_at,
          article_id,
          is_favorite,
          ai_rating,
          ai_rating_reason,
          ai_summary,
          ai_decision,
          articles (
            id,
            title,
            url,
            language,
            authors,
            topics,
            less_15,
            featured_image
          )
        `
        )
        .eq("user_id", userId)
        .order("ai_rating", { ascending: false, nullsFirst: false })
        .order("added_at", { ascending: false });

      if (error) {
        throw new Error(
          `Error al obtener artículos del usuario (user_articles): ${error.message}`
        );
      }

      return ((data as UserArticleRow[]) || [])
        .map((row) => {
          let art = row.articles;
          if (Array.isArray(art)) {
            art = art[0];
          }
          if (!art) return null;
          return {
            id: art.id,
            title: art.title,
            url: art.url,
            dateAdded: new Date(row.added_at || Date.now()),
            isRead: row.is_read,
            readAt: row.read_at ? new Date(row.read_at) : undefined,
            isFavorite: row.is_favorite ?? false,
            language: art.language,
            authors: art.authors,
            topics: art.topics,
            less_15: art.less_15,
            featuredImage: art.featured_image,
            aiRating: row.ai_rating ?? undefined,
            aiRatingReason: row.ai_rating_reason ?? undefined,
            aiSummary: row.ai_summary ?? undefined,
            aiDecision: row.ai_decision ?? undefined,
          };
        })
        .filter(Boolean) as Article[];
    } catch (error) {
      console.error(
        "Error en SupabaseArticleRepository.getArticlesByUserFromUserArticles:",
        error
      );
      throw error;
    }
  }

  async getArticlesByUserFromUserArticlesPaginated(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }> {
    try {
      type UserArticleRow = {
        is_read: boolean;
        read_at?: string;
        added_at?: string;
        updated_at?: string;
        article_id: number;
        is_favorite?: boolean;
        ai_rating?: number | null;
        ai_rating_reason?: string | null;
        ai_summary?: string | null;
        ai_decision?: string | null;
        articles: ArticleRow | ArticleRow[] | null | undefined;
      };
      const { data, error, count } = await this.supabase
        .from("user_articles")
        .select(
          `
          is_read,
          read_at,
          added_at,
          updated_at,
          article_id,
          is_favorite,
          ai_rating,
          ai_rating_reason,
          ai_summary,
          ai_decision,
          articles (
            id,
            title,
            url,
            language,
            authors,
            topics,
            less_15,
            featured_image
          )
        `,
          { count: "exact" }
        )
        .eq("user_id", userId)
        .order("ai_rating", { ascending: false, nullsFirst: false })
        .order("added_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(
          `Error al obtener artículos paginados del usuario (user_articles): ${error.message}`
        );
      }

      const articles = ((data as UserArticleRow[]) || [])
        .map((row) => {
          let art = row.articles;
          if (Array.isArray(art)) {
            art = art[0];
          }
          if (!art) return null;
          return {
            id: art.id,
            title: art.title,
            url: art.url,
            dateAdded: new Date(row.added_at || Date.now()),
            isRead: row.is_read,
            readAt: row.read_at ? new Date(row.read_at) : undefined,
            isFavorite: row.is_favorite ?? false,
            language: art.language,
            authors: art.authors,
            topics: art.topics,
            less_15: art.less_15,
            featuredImage: art.featured_image,
            aiRating: row.ai_rating ?? undefined,
            aiRatingReason: row.ai_rating_reason ?? undefined,
            aiSummary: row.ai_summary ?? undefined,
            aiDecision: row.ai_decision ?? undefined,
          };
        })
        .filter(Boolean) as Article[];
      return { articles, total: count ?? 0 };
    } catch (error) {
      console.error(
        "Error en SupabaseArticleRepository.getArticlesByUserFromUserArticlesPaginated:",
        error
      );
      throw error;
    }
  }

  async getArticlesByUserFromUserArticlesFiltered(
    userId: string,
    filters: import("../../../domain/ArticleListFilters").ArticleListFilters,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }> {
    try {
      type UserArticleRow = {
        is_read: boolean;
        read_at?: string;
        added_at?: string;
        updated_at?: string;
        article_id: number;
        is_favorite?: boolean;
        ai_rating?: number | null;
        ai_rating_reason?: string | null;
        ai_summary?: string | null;
        ai_decision?: string | null;
        articles: ArticleRow | ArticleRow[] | null | undefined;
      };

      const searchTerm = filters.searchTerm?.trim();
      const useInnerJoin = Boolean(searchTerm);

      let query = this.supabase
        .from("user_articles")
        .select(
          `
          is_read,
          read_at,
          added_at,
          updated_at,
          article_id,
          is_favorite,
          ai_rating,
          ai_rating_reason,
          ai_summary,
          ai_decision,
          articles${useInnerJoin ? "!inner" : ""} (
            id,
            title,
            url,
            language,
            authors,
            topics,
            less_15,
            featured_image
          )
        `,
          { count: "exact" }
        )
        .eq("user_id", userId);

      if (filters.readFilter === "read") {
        query = query.eq("is_read", true);
      } else if (filters.readFilter === "unread") {
        query = query.eq("is_read", false);
      }

      if (filters.favoriteFilter === "favorites") {
        query = query.eq("is_favorite", true);
      }

      if (searchTerm) {
        query = query.ilike("articles.title", `%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .order("ai_rating", { ascending: false, nullsFirst: false })
        .order("added_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(
          `Error al obtener artículos filtrados del usuario: ${error.message}`
        );
      }

      const articles = ((data as UserArticleRow[]) || [])
        .map((row) => {
          let art = row.articles;
          if (Array.isArray(art)) {
            art = art[0];
          }
          if (!art) return null;
          return {
            id: art.id,
            title: art.title,
            url: art.url,
            dateAdded: new Date(row.added_at || Date.now()),
            isRead: row.is_read,
            readAt: row.read_at ? new Date(row.read_at) : undefined,
            isFavorite: row.is_favorite ?? false,
            language: art.language,
            authors: art.authors,
            topics: art.topics,
            less_15: art.less_15,
            featuredImage: art.featured_image,
            aiRating: row.ai_rating ?? undefined,
            aiRatingReason: row.ai_rating_reason ?? undefined,
            aiSummary: row.ai_summary ?? undefined,
            aiDecision: row.ai_decision ?? undefined,
          };
        })
        .filter(Boolean) as Article[];

      return { articles, total: count ?? 0 };
    } catch (error) {
      console.error(
        "Error en SupabaseArticleRepository.getArticlesByUserFromUserArticlesFiltered:",
        error
      );
      throw error;
    }
  }

  async getArticlesByUserFiltered(
    userId: string,
    filters: import("../../../domain/ArticleListFilters").ArticleListFilters,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }> {
    return this.getArticlesByUserFromUserArticlesFiltered(
      userId,
      filters,
      limit,
      offset
    );
  }

  async markAsRead(
    articleId: number,
    isRead: boolean,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("user_articles")
        .update({
          is_read: isRead,
          read_at: isRead ? new Date().toISOString() : null,
        })
        .eq("article_id", articleId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(
          `Error al marcar artículo como leído: ${error.message}`
        );
      }
    } catch (error) {
      console.error("Error en SupabaseArticleRepository.markAsRead:", error);
      throw error;
    }
  }

  async markAsFavorite(
    articleId: number,
    isFavorite: boolean,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("user_articles")
        .update({
          is_favorite: isFavorite,
        })
        .eq("article_id", articleId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(
          `Error al marcar artículo como favorito: ${error.message}`
        );
      }
    } catch (error) {
      console.error("Error en SupabaseArticleRepository.markAsFavorite:", error);
      throw error;
    }
  }

  async deleteArticle(articleId: number, userId: string): Promise<void> {
    try {
      // Delete relation in user_articles (new structure)
      const { error: userArticleError } = await this.supabase
        .from("user_articles")
        .delete()
        .eq("article_id", articleId)
        .eq("user_id", userId);

      if (userArticleError) {
        throw new Error(
          `Error al eliminar artículo: ${userArticleError.message}`
        );
      }

      // Check if any relations remain for this article
      const { data: remainingRelations, error: checkError } =
        await this.supabase
          .from("user_articles")
          .select("id")
          .eq("article_id", articleId);

      if (checkError) {
        console.warn("Error verificando relaciones restantes:", checkError);
        return; // User relation already removed; that's what matters
      }

      // If no relations remain, delete the orphaned article from articles
      if (!remainingRelations || remainingRelations.length === 0) {
        const { error: deleteArticleError } = await this.supabase
          .from("articles")
          .delete()
          .eq("id", articleId);

        if (deleteArticleError) {
          console.warn(
            "Error eliminando artículo huérfano de articles:",
            deleteArticleError
          );
        }
      }
    } catch (error) {
      console.error("Error en SupabaseArticleRepository.deleteArticle:", error);
      throw error;
    }
  }

  // Basic methods required by ArticleRepository
  async getAllArticles(): Promise<Article[]> {
    try {
      const { data, error } = await this.supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Error al obtener artículos: ${error.message}`);
      }

      return (data || []).map((row: ArticleRow) => ({
        id: row.id as number,
        title: row.title as string,
        url: row.url as string,
        dateAdded: new Date(row.created_at as string),
        isRead: false, // Not available without user_articles
        readAt: undefined,
        isFavorite: false, // Not available without user_articles
        language: row.language as string | undefined,
        authors: row.authors as string[] | undefined,
        topics: row.topics as string[] | undefined,
        less_15: row.less_15 as boolean | undefined,
        featuredImage: row.featured_image as string | undefined,
      }));
    } catch (error) {
      console.error(
        "Error en SupabaseArticleRepository.getAllArticles:",
        error
      );
      throw error;
    }
  }

  async getArticlesByUser(userId: string): Promise<Article[]> {
    // Use advanced method when available
    if (typeof this.getArticlesByUserFromUserArticles === "function") {
      return this.getArticlesByUserFromUserArticles(userId);
    }

    // Fallback: return all articles (not recommended)
    console.warn(
      "SupabaseArticleRepository: getArticlesByUser no implementado correctamente"
    );
    return this.getAllArticles();
  }

  async getArticlesByUserPaginated(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }> {
    // Use advanced method when available
    if (typeof this.getArticlesByUserFromUserArticlesPaginated === "function") {
      return this.getArticlesByUserFromUserArticlesPaginated(
        userId,
        limit,
        offset
      );
    }

    // Fallback: return all paginated articles (not recommended)
    console.warn(
      "SupabaseArticleRepository: getArticlesByUserPaginated no implementado correctamente"
    );
    const all = await this.getAllArticles();
    return {
      articles: all.slice(offset, offset + limit),
      total: all.length,
    };
  }

}
