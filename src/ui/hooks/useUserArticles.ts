import { useArticlesCache } from "../context/ArticlesCacheProvider";

export function useUserArticles() {
  const { articles, loading, hasArticles } = useArticlesCache();
  return { articles, loading, hasArticles };
}
