import { useEffect, useReducer, useCallback } from "react";
import type { Article } from "../../domain/Article";
import {
  markArticleAsFavorite,
  markArticleAsUnfavorite,
} from "../../domain/Article";
import { useArticleFetcher } from "../hooks/useArticleFetcher";
import { useArticleMutations } from "../hooks/useArticleMutations";
import { useArticlesRefresh } from "../context/ArticlesRefreshContext";
import { useArticlesCache } from "../context/ArticlesCacheProvider";
import {
  initialRandomArticleState,
  randomArticleReducer,
} from "./randomArticleReducer";

export function useRandomArticle() {
  const { version } = useArticlesRefresh();
  const { articles, loading, patchArticle, removeArticle } = useArticlesCache();
  const { isReady, user, repository } = useArticleFetcher();
  const { markRead, markFavorite, deleteArticle } = useArticleMutations(
    repository,
    user?.id
  );
  const [state, dispatch] = useReducer(
    randomArticleReducer,
    initialRandomArticleState
  );

  useEffect(() => {
    if (!isReady || !user) {
      dispatch({ type: "RESET" });
      return;
    }

    if (loading) {
      dispatch({ type: "FETCH_START" });
      return;
    }

    dispatch({ type: "FETCH_SUCCESS", payload: articles });
  }, [articles, loading, isReady, user, version]);

  const pickRandom = useCallback(() => {
    dispatch({ type: "PICK_RANDOM_UNREAD" });
  }, []);

  /**
   * Shows the AI search results: the first one in the card, the rest queued
   * for "Dame otro". False if none of them is loaded.
   */
  const showSearchResults = useCallback(
    (articleIds: number[]): boolean => {
      const found = articleIds.some((id) =>
        state.articles.some((article) => Number(article.id) === id)
      );
      if (found) dispatch({ type: "SHOW_SEARCH_RESULTS", payload: articleIds });
      return found;
    },
    [state.articles]
  );

  /** Shows one of the user's loaded articles in the card; false if not loaded. */
  const showArticle = useCallback(
    (articleId: number): boolean => {
      const found = state.articles.some(
        (article) => Number(article.id) === articleId
      );
      if (found) dispatch({ type: "SHOW_ARTICLE", payload: articleId });
      return found;
    },
    [state.articles]
  );

  const toggleRead = useCallback(async (): Promise<boolean> => {
    if (!repository || !state.current || !user) return false;

    dispatch({ type: "SET_PENDING", payload: "read" });
    try {
      const nextIsRead = !state.current.isRead;
      await markRead(Number(state.current.id), nextIsRead);
      const nextArticle = {
        ...state.current,
        isRead: nextIsRead,
        readAt: nextIsRead ? new Date() : undefined,
      } as Article;
      dispatch({ type: "UPDATE_ARTICLE", payload: nextArticle });
      patchArticle(Number(state.current.id), {
        isRead: nextIsRead,
        readAt: nextIsRead ? new Date() : undefined,
      });
      return true;
    } catch {
      alert("Error al actualizar estado de lectura");
      return false;
    } finally {
      dispatch({ type: "SET_PENDING", payload: null });
    }
  }, [repository, user, state.current, markRead, patchArticle]);

  const toggleFavorite = useCallback(async (): Promise<boolean> => {
    if (!repository || !state.current) return false;

    const wasFavorite = state.current.isFavorite ?? false;
    dispatch({ type: "SET_PENDING", payload: "favorite" });
    try {
      const newArticleState = wasFavorite
        ? markArticleAsUnfavorite(state.current)
        : markArticleAsFavorite(state.current);
      await markFavorite(
        Number(state.current.id),
        newArticleState.isFavorite ?? false
      );
      const nextArticle = {
        ...state.current,
        isFavorite: newArticleState.isFavorite,
      } as Article;
      dispatch({ type: "UPDATE_ARTICLE", payload: nextArticle });
      patchArticle(Number(state.current.id), {
        isFavorite: newArticleState.isFavorite,
      });
      return !wasFavorite;
    } catch {
      alert("Error al actualizar estado de favorito");
      return false;
    } finally {
      dispatch({ type: "SET_PENDING", payload: null });
    }
  }, [repository, state.current, markFavorite, patchArticle]);

  const removeArticleFromLibrary = useCallback(
    async (articleId: number): Promise<boolean> => {
      if (!repository || !user) return false;

      try {
        await deleteArticle(articleId);
        dispatch({ type: "REMOVE_ARTICLE", payload: articleId });
        removeArticle(articleId);
        return true;
      } catch (error) {
        console.error("Error al borrar artículo:", error);
        return false;
      }
    },
    [repository, user, deleteArticle, removeArticle]
  );

  return {
    articles: state.articles,
    article: state.current,
    loading: state.loading,
    loadingRead: state.pendingAction === "read",
    loadingFavorite: state.pendingAction === "favorite",
    pickRandom,
    showArticle,
    showSearchResults,
    toggleRead,
    toggleFavorite,
    deleteArticle: removeArticleFromLibrary,
  };
}
