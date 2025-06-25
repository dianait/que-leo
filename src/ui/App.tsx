import { useState, useEffect, useContext } from "react";
import { ArticleRepositoryContext } from "../domain/ArticleRepositoryContext";
import { useAuth } from "../domain/AuthContext";
import { GetArticlesByUser } from "../application/GetArticlesByUser";
import { ListOfArticles } from "./ListOfArticles/ListOfArticles";
import { RandomArticle } from "./RandomArticle/RandomArticle";

export function App() {
  const [articles, setArticles] = useState([]);
  const [articlesVersion, setArticlesVersion] = useState(0);
  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  console.log("App render", { user, repository });

  useEffect(() => {
    if (!repository || !user) return;
    const fetchArticles = async () => {
      const useCase = new GetArticlesByUser(repository);
      const result = await useCase.execute(user.id);
      setArticles(result);
      console.log("Artículos cargados desde Supabase:", result);
    };
    fetchArticles();
  }, [user, repository, articlesVersion]);

  return (
    <>
      <ListOfArticles setArticlesVersion={setArticlesVersion} />
      <RandomArticle setArticlesVersion={setArticlesVersion} />
    </>
  );
}
