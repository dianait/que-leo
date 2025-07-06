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
}
