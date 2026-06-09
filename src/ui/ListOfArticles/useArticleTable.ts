import { useEffect, useReducer, useCallback, useMemo } from "react";
import type { Article } from "../../domain/Article";
import {
  markArticleAsRead,
  markArticleAsUnread,
  markArticleAsFavorite,
  markArticleAsUnfavorite,
  sortArticlesByAiRating,
} from "../../domain/Article";
import { useArticleFetcher } from "../hooks/useArticleFetcher";
import { useArticleMutations } from "../hooks/useArticleMutations";
import { useArticlesRefresh } from "../context/ArticlesRefreshContext";
import { useArticlesCache } from "../context/ArticlesCacheProvider";
import {
  articlesReducer,
  filtersReducer,
  uiReducer,
  initialArticlesState,
  initialFiltersState,
  initialUIState,
  type FiltersState,
} from "./articleTableReducers";
import {
  needsAllArticlesForFilters,
  paginateArticles,
} from "./articleTableFiltering";
import { useArticleTableDisplay } from "./useArticleTableDisplay";

const PAGE_SIZE = 15;

const neutralDisplayFilters: FiltersState = {
  readFilter: "all",
  favoriteFilter: "all",
  searchTerm: "",
  isSearching: false,
};

export function useArticleTable() {
  const { version } = useArticlesRefresh();
  const {
    articles: cachedArticles,
    loading: cacheLoading,
    patchArticle,
    removeArticle,
  } = useArticlesCache();
  const { fetchFiltered, isReady, user, repository } = useArticleFetcher();
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

  const serverFiltered = useMemo(
    () => needsAllArticlesForFilters(filtersState),
    [filtersState]
  );

  const displayState = useMemo(
    () =>
      serverFiltered
        ? { ...articlesState, allArticles: [] }
        : articlesState,
    [serverFiltered, articlesState]
  );

  const displayFilters = useMemo(
    () => (serverFiltered ? neutralDisplayFilters : filtersState),
    [serverFiltered, filtersState]
  );

  const { filteredArticles, effectiveTotal, displayedArticles } =
    useArticleTableDisplay(displayState, displayFilters, PAGE_SIZE);

  useEffect(() => {
    if (!isReady || serverFiltered) return;

    dispatchArticles({ type: "SET_LOADING", payload: cacheLoading });
    if (cacheLoading) return;

    const sorted = sortArticlesByAiRating(cachedArticles, false);
    dispatchArticles({
      type: "SET_ARTICLES",
      payload: {
        articles: paginateArticles(sorted, articlesState.page, PAGE_SIZE),
        total: cachedArticles.length,
      },
    });
  }, [
    isReady,
    cacheLoading,
    cachedArticles,
    articlesState.page,
    version,
    serverFiltered,
  ]);

  useEffect(() => {
    if (!isReady || !serverFiltered) return;

    let cancelled = false;

    const loadFiltered = async () => {
      dispatchFilters({ type: "SET_IS_SEARCHING", payload: true });
      dispatchArticles({ type: "SET_LOADING", payload: true });
      try {
        const { articles, total } = await fetchFiltered(
          PAGE_SIZE,
          (articlesState.page - 1) * PAGE_SIZE,
          {
            searchTerm: filtersState.searchTerm,
            readFilter: filtersState.readFilter,
            favoriteFilter: filtersState.favoriteFilter,
          }
        );
        if (!cancelled) {
          dispatchArticles({
            type: "SET_ARTICLES",
            payload: { articles, total },
          });
        }
      } catch (error) {
        console.error("Error loading filtered articles:", error);
        if (!cancelled) {
          dispatchArticles({ type: "SET_LOADING", payload: false });
        }
      } finally {
        if (!cancelled) {
          dispatchFilters({ type: "SET_IS_SEARCHING", payload: false });
        }
      }
    };

    loadFiltered();

    return () => {
      cancelled = true;
    };
  }, [
    isReady,
    serverFiltered,
    fetchFiltered,
    filtersState.searchTerm,
    filtersState.readFilter,
    filtersState.favoriteFilter,
    articlesState.page,
    version,
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
        patchArticle(Number(articleToToggle.id), {
          isRead: newArticleState.isRead,
          readAt: newArticleState.readAt,
        });

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
    [repository, markRead, patchArticle]
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
        patchArticle(Number(articleToToggle.id), {
          isFavorite: newArticleState.isFavorite,
        });
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
    [repository, markFavorite, patchArticle]
  );

  const handleDelete = useCallback(
    async (articleId: number) => {
      if (!repository || !user) return;
      dispatchUI({ type: "CLOSE_DELETE_MODAL" });
      try {
        await deleteArticle(articleId);
        dispatchArticles({ type: "REMOVE_ARTICLE", payload: articleId });
        removeArticle(articleId);
        dispatchUI({ type: "SHOW_TOAST" });
        setTimeout(() => dispatchUI({ type: "HIDE_TOAST" }), 2000);
      } catch (error: unknown) {
        console.error("Error al borrar el artículo:", error);
        const message =
          error instanceof Error ? error.message : String(error);
        alert("Error al borrar el artículo: " + message);
      }
    },
    [repository, user, deleteArticle, removeArticle]
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
    cachedTotal: cachedArticles.length,
  };
}
