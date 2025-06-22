import { useState, useEffect } from "react";
import "./RandomArticle.css";
import { GetRandomArticle } from "../../application/GetRandomArticle";
import { Article } from "../../domain/Article";
import { useArticleRepository } from "../../domain/ArticleRepositoryContext";

export function RandomArticle() {
  // Estados para manejar el artículo seleccionado y el estado de carga
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const repository = useArticleRepository();

  useEffect(() => {
    const fetchRandom = async () => {
      setLoading(true);
      try {
        const useCase = new GetRandomArticle(repository);
        const randomArticle = await useCase.execute();
        setArticle(randomArticle);
      } catch (error) {
        console.error("Error al obtener artículo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRandom();
  }, []);

  const handleGetRandomArticle = async () => {
    setLoading(true);
    try {
      const useCase = new GetRandomArticle(repository);
      const randomArticle = await useCase.execute();
      setArticle(randomArticle);
    } catch (error) {
      console.error("Error al obtener artículo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="random-article-container">
      <div className="article-container">
        <div
          className={`content-card random-article-card ${
            article ? "card-animated" : ""
          }`}
        >
          {article ? (
            <>
              <h4 className="article-title">{article.title}</h4>
              <div className="article-links-container">
                {article.url === "#" ? (
                  <>
                    <div className="url-not-available">
                      🚫 No URL disponible.
                    </div>
                    <a
                      href={
                        "https://google.com/search?q=" +
                        encodeURIComponent(article.title)
                      }
                      className="article-link"
                    >
                      🔎 Buscar en Google
                    </a>
                  </>
                ) : (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-link"
                  >
                    🔗 Leer artículo
                  </a>
                )}
              </div>
              <p className="article-date">
                Guardado el: {article.dateAdded.toLocaleDateString()}
              </p>
            </>
          ) : loading ? (
            <div className="loading-state">🔄 Cargando artículo...</div>
          ) : null}
        </div>
      </div>
      <button
        onClick={handleGetRandomArticle}
        disabled={loading}
        className="modern-button button-primary random-article-button"
      >
        {loading ? "🔄 Buscando..." : "Dame otro 🎲"}
      </button>
    </div>
  );
}
