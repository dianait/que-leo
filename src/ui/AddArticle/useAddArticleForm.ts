import { useReducer, useCallback } from "react";
import type { ArticleRepository } from "../../domain/ArticleRepository";
import { ArticleService } from "../../application/ArticleService";
import { MetadataService } from "../../infrastructure/services/MetadataService";
import {
  addArticleFormReducer,
  initialAddArticleFormState,
} from "./addArticleFormReducer";

function normalizeUrl(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

export function useAddArticleForm(
  repository: ArticleRepository | null,
  userId: string | undefined,
  setArticlesVersion?: (v: (v: number) => number) => void
) {
  const [state, dispatch] = useReducer(
    addArticleFormReducer,
    initialAddArticleFormState
  );

  const openModal = useCallback(() => {
    dispatch({ type: "OPEN_MODAL" });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: "CLOSE_MODAL" });
  }, []);

  const setTitle = useCallback((value: string) => {
    dispatch({ type: "SET_FIELD", field: "title", value });
  }, []);

  const setUrl = useCallback((value: string) => {
    dispatch({ type: "SET_FIELD", field: "url", value });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userId || !repository) return;

      dispatch({ type: "SUBMIT_START" });

      const finalUrl = normalizeUrl(state.url);
      let title = state.title;

      try {
        let metadata = null;
        try {
          metadata = await MetadataService.extractMetadata(finalUrl);
          if (!title.trim() && metadata.title) {
            title = metadata.title;
            dispatch({
              type: "SET_FIELD",
              field: "title",
              value: metadata.title,
            });
          }
        } catch (metadataError) {
          console.warn("No se pudieron extraer metadatos:", metadataError);
        }

        const svc = new ArticleService(repository);
        await svc.add({
          title: title || metadata?.title || "Sin título",
          url: finalUrl,
          userId,
          language: metadata?.language || null,
          authors: metadata?.authors || null,
          topics: metadata?.topics || null,
          less_15: null,
          featuredImage: metadata?.featuredimage || null,
        });

        dispatch({ type: "SUBMIT_SUCCESS" });
        if (setArticlesVersion) {
          setArticlesVersion((v) => v + 1);
        }
        setTimeout(() => {
          dispatch({ type: "DISMISS_AFTER_SUCCESS" });
        }, 1000);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Error desconocido al añadir artículo";
        dispatch({ type: "SUBMIT_ERROR", payload: message });
      }
    },
    [repository, userId, state.url, state.title, setArticlesVersion]
  );

  return {
    state,
    openModal,
    closeModal,
    setTitle,
    setUrl,
    handleSubmit,
  };
}
