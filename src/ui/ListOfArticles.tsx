import { useState } from "react";
import { GetAllArticles } from "../application/GetAllArticles";
import { JsonArticleRepository } from "../infrastructure/repositories/JSONArticleRepository";
import { Article } from "../domain/Article";

export function ListOfArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  const handleToggleList = async () => {
    if (!showList && articles.length === 0) {
      // Primera vez: cargar artículos
      setLoading(true);
      try {
        const repository = new JsonArticleRepository();
        const useCase = new GetAllArticles(repository);
        const result = await useCase.execute();
        setArticles(result);
      } catch (error) {
        console.error("Error al cargar artículos:", error);
      } finally {
        setLoading(false);
      }
    }
    setShowList(!showList);
  };

  return (
    <div>
      <button
        onClick={handleToggleList}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: "18px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading
          ? "🔄 Cargando..."
          : showList
          ? "🙈 Ocultar lista"
          : "📋 Ver todos los artículos"}
      </button>

      {showList && articles.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Lista de Artículos ({articles.length})</h2>
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
      )}
    </div>
  );
}
