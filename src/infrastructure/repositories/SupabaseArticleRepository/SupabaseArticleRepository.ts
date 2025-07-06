import { SupabaseClient } from "@supabase/supabase-js";
import type { Article } from "../../../domain/Article";
import type { ArticleRepository } from "../../../domain/ArticleRepository";
import { createSupabaseClient } from "./supabaseConfig";

interface ArticleRow {
  id: number;
  title: string;
  url: string;
  dateAdded: string;
  user_id?: string;
  is_read: boolean;
  read_at?: string;
  language?: string;
  authors?: string[];
  topics?: string[];
  less_15?: boolean;
  featuredimage?: string;
}

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

  // Método para resetear la instancia (útil para tests)
  public static resetInstance(): void {
    SupabaseArticleRepository.instance = null;
  }

  async getAllArticles(): Promise<Article[]> {
    try {
      const { data, error } = await this.supabase
        .from("articles")
        .select("*")
        .order("dateAdded", { ascending: false });

      if (error) {
        throw new Error(`Error al obtener artículos: ${error.message}`);
      }

      return (data as ArticleRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        url: row.url,
        dateAdded: new Date(row.dateAdded),
        isRead: row.is_read,
        readAt: row.read_at ? new Date(row.read_at) : undefined,
        language: row.language,
        authors: row.authors,
        topics: row.topics,
        less_15: row.less_15,
        featuredImage: row.featuredimage,
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
    try {
      const { data, error } = await this.supabase
        .from("articles")
        .select("*")
        .eq("user_id", userId)
        .order("dateAdded", { ascending: false });

      if (error) {
        throw new Error(
          `Error al obtener artículos del usuario: ${error.message}`
        );
      }

      return (data as ArticleRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        url: row.url,
        dateAdded: new Date(row.dateAdded),
        isRead: row.is_read,
        readAt: row.read_at ? new Date(row.read_at) : undefined,
        language: row.language,
        authors: row.authors,
        topics: row.topics,
        less_15: row.less_15,
        featuredImage: row.featuredimage,
      }));
    } catch (error) {
      console.error(
        "Error en SupabaseArticleRepository.getArticlesByUser:",
        error
      );
      throw error;
    }
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
    try {
      const { data, error } = await this.supabase
        .from("articles")
        .insert([
          {
            title,
            url,
            user_id: userId,
            language: language ?? null,
            authors: authors ?? null,
            topics: topics ?? null,
            less_15: less_15 ?? null,
            featuredimage: featuredImage ?? null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Error al añadir artículo: ${error.message}`);
      }

      const row = data as ArticleRow;
      return {
        id: row.id,
        title: row.title,
        url: row.url,
        dateAdded: new Date(row.dateAdded),
        isRead: row.is_read,
        readAt: row.read_at ? new Date(row.read_at) : undefined,
        language: row.language,
        authors: row.authors,
        topics: row.topics,
        less_15: row.less_15,
        featuredImage: row.featuredimage,
      };
    } catch (error) {
      console.error("Error en SupabaseArticleRepository.addArticle:", error);
      throw error;
    }
  }

  async deleteArticle(articleId: number, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("articles")
        .delete()
        .eq("id", articleId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Error al eliminar artículo: ${error.message}`);
      }
    } catch (error) {
      console.error("Error en SupabaseArticleRepository.deleteArticle:", error);
      throw error;
    }
  }

  async markAsRead(articleId: number, isRead: boolean): Promise<void> {
    try {
      const updateData = isRead
        ? { is_read: isRead, read_at: new Date().toISOString() }
        : { is_read: isRead, read_at: null };

      const { error } = await this.supabase
        .from("articles")
        .update(updateData)
        .eq("id", articleId);

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

  async getArticlesByUserPaginated(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ articles: Article[]; total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from("articles")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("dateAdded", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(
          `Error al obtener artículos paginados: ${error.message}`
        );
      }

      const articles = (data as ArticleRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        url: row.url,
        dateAdded: new Date(row.dateAdded),
        isRead: row.is_read,
        readAt: row.read_at ? new Date(row.read_at) : undefined,
        language: row.language,
        authors: row.authors,
        topics: row.topics,
        less_15: row.less_15,
        featuredImage: row.featuredimage,
      }));
      return { articles, total: count ?? 0 };
    } catch (error) {
      console.error(
        "Error en SupabaseArticleRepository.getArticlesByUserPaginated:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene los artículos de un usuario usando la relación user_articles y articles2
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
        articles2: any;
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
          articles2 (
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
          let art = row.articles2;
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
        articles2:
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
          articles2 (
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
          let art = row.articles2;
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
   * Añade un artículo a articles2 (si no existe) y lo vincula al usuario en user_articles (si no existe la relación).
   * Devuelve el artículo completo.
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
    type Article2Row = {
      id: number;
      title: string;
      url: string;
      language?: string;
      authors?: string[];
      topics?: string[];
      less_15?: boolean;
      featured_image?: string;
    };
    // 1. Buscar si el artículo ya existe en articles2 por URL
    const { data: existing, error: findError } = await this.supabase
      .from("articles2")
      .select("*")
      .eq("url", url)
      .maybeSingle();
    if (findError) {
      throw new Error(`Error buscando artículo por URL: ${findError.message}`);
    }
    let articleId: number;
    let articleRow: Article2Row;
    if (existing) {
      articleId = existing.id;
      articleRow = existing as Article2Row;
      // 1b. Si hay campos nuevos, actualiza el artículo
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
          .from("articles2")
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
            `Error actualizando artículo en articles2: ${updateError.message}`
          );
        }
        articleRow = updated as Article2Row;
      }
    } else {
      // 2. Insertar en articles2
      const { data: inserted, error: insertError } = await this.supabase
        .from("articles2")
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
          `Error insertando artículo en articles2: ${insertError.message}`
        );
      }
      articleId = inserted.id;
      articleRow = inserted as Article2Row;
    }
    // 3. Insertar en user_articles si no existe la relación
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
    // 4. Devolver el artículo en formato Article
    return {
      id: articleRow.id,
      title: articleRow.title,
      url: articleRow.url,
      dateAdded: new Date(), // No tenemos el added_at exacto aquí
      isRead: false,
      readAt: undefined,
      language: articleRow.language,
      authors: articleRow.authors,
      topics: articleRow.topics,
      less_15: articleRow.less_15,
      featuredImage: articleRow.featured_image,
    };
  }
}
