import { useState, useEffect } from "react";
import type { Article } from "../../domain/Article";
import { useArticleFetcher } from "./useArticleFetcher";

export function useUserArticles(refreshKey = 0) {
  const { fetchAll, isReady } = useArticleFetcher();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) {
      setArticles([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchAll();
        if (!cancelled) setArticles(result);
      } catch (error) {
        console.error("Error fetching user articles:", error);
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchAll, isReady, refreshKey]);

  const hasArticles = articles.length > 0;

  return { articles, loading, hasArticles };
}
