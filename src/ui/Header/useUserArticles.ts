import { useState, useEffect, useContext } from "react";
import { useAuth } from "../../domain/AuthContext";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { ArticleService } from "../../application/ArticleService";
import type { Article } from "../../domain/Article";

export const useUserArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasArticles, setHasArticles] = useState(false);

  const { user } = useAuth();
  const repository = useContext(ArticleRepositoryContext);

  useEffect(() => {
    if (!repository || !user) {
      setLoading(false);
      setHasArticles(false);
      return;
    }

    const fetchArticles = async () => {
      try {
        setLoading(true);
        const svc = new ArticleService(repository);
        const userArticles = await svc.getByUser(user.id);
        setArticles(userArticles);
        setHasArticles(userArticles.length > 0);
      } catch (error) {
        console.error("Error fetching user articles:", error);
        setHasArticles(false);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [user, repository]);

  return { articles, loading, hasArticles };
};
