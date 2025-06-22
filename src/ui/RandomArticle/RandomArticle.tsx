import { useState, useEffect, useContext } from "react";
import "./RandomArticle.css";
import { GetRandomArticle } from "../../application/GetRandomArticle";
import { Article } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";

export function RandomArticle() {
  // Estados para manejar el artículo seleccionado y el estado de carga
  const [article, setArticle] = useState<Article | null>(null);
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  useEffect(() => {
    if (!repository || !user) return;

    const fetchUserArticles = async () => {
      setLoading(true);
      try {
        const articles = await repository.getArticlesByUser(user.id);
        setUserArticles(articles);
        if (articles.length > 0) {
          const randomIndex = Math.floor(Math.random() * articles.length);
          setArticle(articles[randomIndex]);
        }
      } catch (error) {
        console.error("Error al obtener artículos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserArticles();
  }, [user, repository]);

  const handleGetRandomArticle = () => {
    if (userArticles.length > 0) {
      const randomIndex = Math.floor(Math.random() * userArticles.length);
      setArticle(userArticles[randomIndex]);
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
            <div className="loading-state">🔄 Cargando tus artículos...</div>
          ) : (
            <div className="no-articles-state">
              <p>¡No tienes artículos!</p>
              <p>Añade uno para empezar.</p>
            </div>
          )}
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
