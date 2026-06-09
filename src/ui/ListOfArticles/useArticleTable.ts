import { useEffect, useReducer, useCallback } from "react";
import type { Article } from "../../domain/Article";
import {
  markArticleAsRead,
  markArticleAsUnread,
  markArticleAsFavorite,
  markArticleAsUnfavorite,
} from "../../domain/Article";
import { useArticleFetcher } from "../hooks/useArticleFetcher";
import { useArticleMutations } from "../hooks/useArticleMutations";
import {
  articlesReducer,
  filtersReducer,
  uiReducer,
  initialArticlesState,
  initialFiltersState,
  initialUIState,
} from "./articleTableReducers";
import { hasActiveTableFilters } from "./articleTableFiltering";
import { useArticleTableDisplay } from "./useArticleTableDisplay";

const PAGE_SIZE = 15;
const ALL_ARTICLES_LIMIT = 1000;

export function useArticleTable(articlesVersion: number) {
  const { fetchPaginated, isReady, user, repository } = useArticleFetcher();
  const { markRead, markFavorite, deleteArticle } = useArticleMutations(
    repository,
    user?.id
  );

  const [articlesState, dispatchArticles] = useReducer(
    articlesReducer,
    initialArticlesState
  );
  const [filtersState, dispatchFilters] = useReducer(
    filtersReducer,
    initialFiltersState
  );
  const [uiState, dispatchUI] = useReducer(uiReducer, initialUIState);

  const { filteredArticles, effectiveTotal, displayedArticles } =
    useArticleTableDisplay(articlesState, filtersState, PAGE_SIZE);

  const fetchAllArticles = useCallback(async () => {
    if (!isReady) return;
    dispatchFilters({ type: "SET_IS_SEARCHING", payload: true });
    try {
      const { articles } = await fetchPaginated(ALL_ARTICLES_LIMIT, 0);
      dispatchArticles({ type: "SET_ALL_ARTICLES", payload: articles });
    } catch (error) {
      console.error("Error al cargar todos los artículos:", error);
    } finally {
      dispatchFilters({ type: "SET_IS_SEARCHING", payload: false });
    }
  }, [fetchPaginated, isReady]);

  useEffect(() => {
    if (!isReady) return;

    const loadArticles = async () => {
      dispatchArticles({ type: "SET_LOADING", payload: true });
      try {
        const { articles, total } = await fetchPaginated(
          PAGE_SIZE,
          (articlesState.page - 1) * PAGE_SIZE
        );
        dispatchArticles({
          type: "SET_ARTICLES",
          payload: { articles, total },
        });
      } catch (error) {
        console.error("Error loading user articles:", error);
        dispatchArticles({ type: "SET_LOADING", payload: false });
      }
    };

    loadArticles();
  }, [isReady, fetchPaginated, articlesVersion, articlesState.page]);

  useEffect(() => {
    if (
      (filtersState.searchTerm || hasActiveTableFilters(filtersState)) &&
      articlesState.allArticles.length === 0
    ) {
      fetchAllArticles();
    }
  }, [
    filtersState.searchTerm,
    filtersState.readFilter,
    filtersState.favoriteFilter,
    articlesState.allArticles.length,
    fetchAllArticles,
  ]);

  useEffect(() => {
    dispatchArticles({ type: "SET_PAGE", payload: 1 });
  }, [
    filtersState.readFilter,
    filtersState.favoriteFilter,
    filtersState.searchTerm,
  ]);

  const handleToggleRead = useCallback(
    async (articleToToggle: Article) => {
      if (!repository) return;
      const newArticleState = articleToToggle.isRead
        ? markArticleAsUnread(articleToToggle)
        : markArticleAsRead(articleToToggle);

      dispatchArticles({
        type: "UPDATE_ARTICLE",
        payload: {
          id: Number(articleToToggle.id),
          updates: { isRead: newArticleState.isRead },
        },
      });

      try {
        await markRead(Number(articleToToggle.id), newArticleState.isRead);

        if (!articleToToggle.isRead) {
          dispatchUI({
            type: "SHOW_SHARE_MODAL",
            payload: articleToToggle,
          });
        }
      } catch (error) {
        console.error("Error marking as read:", error);
        dispatchArticles({
          type: "UPDATE_ARTICLE",
          payload: {
            id: Number(articleToToggle.id),
            updates: { isRead: articleToToggle.isRead },
          },
        });
      }
    },
    [repository, markRead]
  );

  const handleToggleFavorite = useCallback(
    async (articleToToggle: Article) => {
      if (!repository) return;
      const newArticleState = articleToToggle.isFavorite
        ? markArticleAsUnfavorite(articleToToggle)
        : markArticleAsFavorite(articleToToggle);

      dispatchArticles({
        type: "UPDATE_ARTICLE",
        payload: {
          id: Number(articleToToggle.id),
          updates: { isFavorite: newArticleState.isFavorite },
        },
      });

      try {
        await markFavorite(
          Number(articleToToggle.id),
          newArticleState.isFavorite ?? false
        );
      } catch (error) {
        console.error("Error marking as favorite:", error);
        dispatchArticles({
          type: "UPDATE_ARTICLE",
          payload: {
            id: Number(articleToToggle.id),
            updates: { isFavorite: articleToToggle.isFavorite },
          },
        });
      }
    },
    [repository, markFavorite]
  );

  const handleDelete = useCallback(
    async (articleId: number) => {
      if (!repository || !user) return;
      dispatchUI({ type: "CLOSE_DELETE_MODAL" });
      try {
        await deleteArticle(articleId);
        dispatchArticles({ type: "REMOVE_ARTICLE", payload: articleId });
        dispatchUI({ type: "SHOW_TOAST" });
        setTimeout(() => dispatchUI({ type: "HIDE_TOAST" }), 2000);
      } catch (error: unknown) {
        console.error("Error al borrar el artículo:", error);
        const message =
          error instanceof Error ? error.message : String(error);
        alert("Error al borrar el artículo: " + message);
      }
    },
    [repository, user, deleteArticle]
  );

  const clearSearch = useCallback(() => {
    dispatchFilters({ type: "SET_SEARCH_TERM", payload: "" });
    dispatchArticles({ type: "SET_ALL_ARTICLES", payload: [] });
  }, []);

  return {
    pageSize: PAGE_SIZE,
    articlesState,
    filtersState,
    uiState,
    filteredArticles,
    effectiveTotal,
    displayedArticles,
    dispatchArticles,
    dispatchFilters,
    dispatchUI,
    handleToggleRead,
    handleToggleFavorite,
    handleDelete,
    clearSearch,
  };
}
