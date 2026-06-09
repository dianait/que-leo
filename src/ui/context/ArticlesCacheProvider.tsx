import {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
} from "react";
import type { Article } from "../../domain/Article";
import { useArticleFetcher } from "../hooks/useArticleFetcher";
import { useArticlesRefresh } from "./ArticlesRefreshContext";

type ArticlesCacheContextValue = {
  articles: Article[];
  loading: boolean;
  hasArticles: boolean;
  patchArticle: (id: number, updates: Partial<Article>) => void;
  removeArticle: (id: number) => void;
};

const ArticlesCacheContext = createContext<
  ArticlesCacheContextValue | undefined
>(undefined);

export function ArticlesCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { version } = useArticlesRefresh();
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
        console.error("Error fetching articles cache:", error);
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchAll, isReady, version]);

  const patchArticle = useCallback((id: number, updates: Partial<Article>) => {
    setArticles((prev) =>
      prev.map((article) =>
        Number(article.id) === id ? { ...article, ...updates } : article
      )
    );
  }, []);

  const removeArticle = useCallback((id: number) => {
    setArticles((prev) =>
      prev.filter((article) => Number(article.id) !== id)
    );
  }, []);

  return (
    <ArticlesCacheContext.Provider
      value={{
        articles,
        loading,
        hasArticles: articles.length > 0,
        patchArticle,
        removeArticle,
      }}
    >
      {children}
    </ArticlesCacheContext.Provider>
  );
}

export function useArticlesCache() {
  const context = use(ArticlesCacheContext);
  if (!context) {
    throw new Error(
      "useArticlesCache must be used within an ArticlesCacheProvider"
    );
  }
  return context;
}
