import { GetAllArticles } from "../application/GetAllArticles";
import { JsonArticleRepository } from "../infrastructure/repositories/JSONArticleRepository";
import { Article } from "../domain/Article";
import { useState, useEffect } from "react";

export function ListOfArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      const repository = new JsonArticleRepository();
      const useCase = new GetAllArticles(repository);
      const result = await useCase.execute();
      setArticles(result);
      setLoading(false);
    };

    loadArticles();
  }, []);

  if (loading) {
    return <div>Cargando artículos...</div>;
  }

  return (
    <div>
      <h2>Lista de Artículos</h2>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
            {" - "}
            {article.dateAdded.toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
