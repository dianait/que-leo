import { SupabaseClient } from "@supabase/supabase-js";
import type { Article } from "../../../domain/Article";
import type { ArticleRepository } from "../../../domain/ArticleRepository";
import { createSupabaseClient } from "./supabaseConfig";

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        articles: any;
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
            language: art.language,
            authors: art.authors,
            topics: art.topics,
            less_15: art.less_15,
            featuredImage: art.featured_image,
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
        articles:
          | {
              id: number;
              title: string;
              url: string;
              language?: string;
              authors?: string[];
              topics?: string[];
              less_15?: boolean;
              featured_image?: string;
            }
          | null
          | undefined
          | Array<{
              id: number;
              title: string;
              url: string;
              language?: string;
              authors?: string[];
              topics?: string[];
              less_15?: boolean;
              featured_image?: string;
            }>;
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
            language: art.language,
            authors: art.authors,
            topics: art.topics,
            less_15: art.less_15,
            featuredImage: art.featured_image,
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

  /**
  * Insert article into articles (if it does not exist) and link it to the user in user_articles (if the relation does not exist).
  * Returns the full article entity.
   */
  async addArticleToUser(
    title: string,
    url: string,
    userId: string,
    language?: string | null,
    authors?: string[] | null,
    topics?: string[] | null,
    less_15?: boolean | null,
    featuredImage?: string | null
  ): Promise<Article> {
    type ArticleRow = {
      id: number;
      title: string;
      url: string;
      language?: string;
      authors?: string[];
      topics?: string[];
      less_15?: boolean;
      featured_image?: string;
    };
    // 1) Look up article by URL in articles
    const { data: existing, error: findError } = await this.supabase
      .from("articles")
      .select("*")
      .eq("url", url)
      .maybeSingle();
    if (findError) {
      throw new Error(`Error buscando artículo por URL: ${findError.message}`);
    }
    let articleId: number;
    let articleRow: ArticleRow;
    if (existing) {
      articleId = existing.id;
      articleRow = existing as ArticleRow;
      // 1b) If there are new fields, update the existing article
      const needsUpdate =
        (title && title !== existing.title) ||
        (language && language !== existing.language) ||
        (authors &&
          JSON.stringify(authors) !== JSON.stringify(existing.authors)) ||
        (topics &&
          JSON.stringify(topics) !== JSON.stringify(existing.topics)) ||
        (less_15 !== undefined && less_15 !== existing.less_15) ||
        (featuredImage && featuredImage !== existing.featured_image);
      if (needsUpdate) {
        const { data: updated, error: updateError } = await this.supabase
          .from("articles")
          .update({
            title,
            language,
            authors,
            topics,
            less_15,
            featured_image: featuredImage,
          })
          .eq("id", articleId)
          .select()
          .single();
        if (updateError) {
          throw new Error(
            `Error actualizando artículo en articles: ${updateError.message}`
          );
        }
        articleRow = updated as ArticleRow;
      }
    } else {
      // 2) Insert into articles
      const { data: inserted, error: insertError } = await this.supabase
        .from("articles")
        .insert([
          {
            title,
            url,
            language: language ?? null,
            authors: authors ?? null,
            topics: topics ?? null,
            less_15: less_15 ?? null,
            featured_image: featuredImage ?? null,
          },
        ])
        .select()
        .single();
      if (insertError) {
        throw new Error(
          `Error insertando artículo en articles: ${insertError.message}`
        );
      }
      articleId = inserted.id;
      articleRow = inserted as ArticleRow;
    }
    // 3) Insert into user_articles if the relation doesn't exist
    type UserArticleRow = {
      id: number;
      user_id: string;
      article_id: number;
      is_read: boolean;
      read_at?: string;
      added_at?: string;
      updated_at?: string;
    };
    const { data: userArticle, error: relError } = await this.supabase
      .from("user_articles")
      .select("*")
      .eq("user_id", userId)
      .eq("article_id", articleId)
      .maybeSingle();
    if (relError) {
      throw new Error(
        `Error comprobando relación en user_articles: ${relError.message}`
      );
    }
    if (!(userArticle as UserArticleRow | null)) {
      const { error: insertRelError } = await this.supabase
        .from("user_articles")
        .insert([
          {
            user_id: userId,
            article_id: articleId,
            is_read: false,
            read_at: null,
          },
        ]);
      if (insertRelError) {
        throw new Error(
          `Error insertando relación en user_articles: ${insertRelError.message}`
        );
      }
    }
    // 4) Return article as domain entity
    return {
      id: articleRow.id,
      title: articleRow.title,
      url: articleRow.url,
      dateAdded: new Date(), // Not the exact added_at here
      isRead: false,
      readAt: undefined,
      language: articleRow.language,
      authors: articleRow.authors,
      topics: articleRow.topics,
      less_15: articleRow.less_15,
      featuredImage: articleRow.featured_image,
    };
  }

  async markAsRead(articleId: number, isRead: boolean): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("user_articles")
        .update({
          is_read: isRead,
          read_at: isRead ? new Date().toISOString() : null,
        })
        .eq("article_id", articleId);

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

      return (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as number,
        title: row.title as string,
        url: row.url as string,
        dateAdded: new Date(row.created_at as string),
        isRead: false, // Not available without user_articles
        readAt: undefined,
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

  async addArticle(
    title: string,
    url: string,
    userId: string,
    language?: string | null,
    authors?: string[] | null,
    topics?: string[] | null,
    less_15?: boolean | null,
    featuredImage?: string | null
  ): Promise<Article> {
    // Use advanced method when available
    if (typeof this.addArticleToUser === "function") {
      return this.addArticleToUser(
        title,
        url,
        userId,
        language,
        authors,
        topics,
        less_15,
        featuredImage
      );
    }

    // Fallback: insert directly into articles
    try {
      const { data, error } = await this.supabase
        .from("articles")
        .insert([
          {
            title,
            url,
            language: language ?? null,
            authors: authors ?? null,
            topics: topics ?? null,
            less_15: less_15 ?? null,
            featured_image: featuredImage ?? null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Error al añadir artículo: ${error.message}`);
      }

      return {
        id: data.id,
        title: data.title,
        url: data.url,
        dateAdded: new Date(data.created_at),
        isRead: false,
        readAt: undefined,
        language: data.language,
        authors: data.authors,
        topics: data.topics,
        less_15: data.less_15,
        featuredImage: data.featured_image,
      };
    } catch (error) {
      console.error("Error en SupabaseArticleRepository.addArticle:", error);
      throw error;
    }
  }
}
