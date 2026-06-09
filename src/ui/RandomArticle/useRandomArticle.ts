import { useEffect, useReducer, useCallback } from "react";
import type { Article } from "../../domain/Article";
import {
  markArticleAsFavorite,
  markArticleAsUnfavorite,
} from "../../domain/Article";
import { ArticleService } from "../../application/ArticleService";
import { useArticleFetcher } from "../hooks/useArticleFetcher";
import {
  initialRandomArticleState,
  randomArticleReducer,
} from "./randomArticleReducer";

export function useRandomArticle(articlesVersion: number) {
  const { fetchAll, isReady, user, repository } = useArticleFetcher();
  const [state, dispatch] = useReducer(
    randomArticleReducer,
    initialRandomArticleState
  );

  useEffect(() => {
    if (!isReady) return;

    let cancelled = false;

    const loadArticles = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const result = await fetchAll();
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

    loadArticles();

    return () => {
      cancelled = true;
    };
  }, [fetchAll, isReady, articlesVersion]);

  const pickRandom = useCallback(() => {
    dispatch({ type: "PICK_RANDOM_UNREAD" });
  }, []);

  const toggleRead = useCallback(async (): Promise<boolean> => {
    if (!repository || !state.current || !user) return false;

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
  }, [repository, user, state.current]);

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
      if (!repository || !user) return false;

      try {
        const svc = new ArticleService(repository);
        await svc.delete(Number(articleId), user.id);
        dispatch({ type: "REMOVE_ARTICLE", payload: articleId });
        return true;
      } catch (error) {
        console.error("Error al borrar artículo:", error);
        return false;
      }
    },
    [repository, user]
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
