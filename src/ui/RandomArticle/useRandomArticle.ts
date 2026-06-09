import { useEffect, useReducer, useCallback } from "react";
import type { Article } from "../../domain/Article";
import {
  markArticleAsFavorite,
  markArticleAsUnfavorite,
} from "../../domain/Article";
import type { ArticleRepository } from "../../domain/ArticleRepository";
import { ArticleService } from "../../application/ArticleService";
import {
  initialRandomArticleState,
  randomArticleReducer,
} from "./randomArticleReducer";

export function useRandomArticle(
  repository: ArticleRepository | null,
  userId: string | undefined,
  articlesVersion: number
) {
  const [state, dispatch] = useReducer(
    randomArticleReducer,
    initialRandomArticleState
  );

  useEffect(() => {
    if (!repository || !userId) return;

    let cancelled = false;

    const fetchArticles = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const svc = new ArticleService(repository);
        const result = await svc.getByUser(userId);
        if (!cancelled) {
          dispatch({ type: "FETCH_SUCCESS", payload: result });
        }
      } catch (error) {
        console.error("Error loading user articles:", error);
        if (!cancelled) {
          dispatch({ type: "FETCH_ERROR" });
        }
      }
    };

    fetchArticles();

    return () => {
      cancelled = true;
    };
  }, [repository, userId, articlesVersion]);

  const pickRandom = useCallback(() => {
    dispatch({ type: "PICK_RANDOM_UNREAD" });
  }, []);

  const toggleRead = useCallback(async (): Promise<boolean> => {
    if (!repository || !state.current) return false;

    dispatch({ type: "SET_PENDING", payload: "read" });
    try {
      const nextIsRead = !state.current.isRead;
      const svc = new ArticleService(repository);
      await svc.markRead(Number(state.current.id), nextIsRead);
      const nextArticle = {
        ...state.current,
        isRead: nextIsRead,
        readAt: nextIsRead ? new Date() : undefined,
      } as Article;
      dispatch({ type: "UPDATE_ARTICLE", payload: nextArticle });
      return true;
    } catch {
      alert("Error al actualizar estado de lectura");
      return false;
    } finally {
      dispatch({ type: "SET_PENDING", payload: null });
    }
  }, [repository, state.current]);

  const toggleFavorite = useCallback(async (): Promise<boolean> => {
    if (!repository || !state.current) return false;

    const wasFavorite = state.current.isFavorite ?? false;
    dispatch({ type: "SET_PENDING", payload: "favorite" });
    try {
      const newArticleState = wasFavorite
        ? markArticleAsUnfavorite(state.current)
        : markArticleAsFavorite(state.current);
      const svc = new ArticleService(repository);
      await svc.markFavorite(
        Number(state.current.id),
        newArticleState.isFavorite ?? false
      );
      const nextArticle = {
        ...state.current,
        isFavorite: newArticleState.isFavorite,
      } as Article;
      dispatch({ type: "UPDATE_ARTICLE", payload: nextArticle });
      return !wasFavorite;
    } catch {
      alert("Error al actualizar estado de favorito");
      return false;
    } finally {
      dispatch({ type: "SET_PENDING", payload: null });
    }
  }, [repository, state.current]);

  const deleteArticle = useCallback(
    async (articleId: number): Promise<boolean> => {
      if (!repository || !userId) return false;

      try {
        const svc = new ArticleService(repository);
        await svc.delete(Number(articleId), userId);
        dispatch({ type: "REMOVE_ARTICLE", payload: articleId });
        return true;
      } catch (error) {
        console.error("Error al borrar artículo:", error);
        return false;
      }
    },
    [repository, userId]
  );

  return {
    articles: state.articles,
    article: state.current,
    loading: state.loading,
    loadingRead: state.pendingAction === "read",
    loadingFavorite: state.pendingAction === "favorite",
    pickRandom,
    toggleRead,
    toggleFavorite,
    deleteArticle,
  };
}
