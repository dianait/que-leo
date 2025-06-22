import { useState, useEffect, useContext } from "react";
import { formatDistanceToNow, isBefore, subYears } from "date-fns";
import { es } from "date-fns/locale";
import "./RandomArticle.css";
import type { Article } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { GetRandomArticleForUser } from "../../application/GetRandomArticleForUser";

export function RandomArticle() {
  // Estados para manejar el artículo seleccionado y el estado de carga
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);

  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  const fetchAndSetRandomArticle = async () => {
    if (!repository || !user) return;
    setLoading(true);
    try {
      const useCase = new GetRandomArticleForUser(repository);
      const randomArticle = await useCase.execute(user.id);
      setArticle(randomArticle); // Puede ser un artículo o null
    } catch (error) {
      console.error("Error al obtener artículo aleatorio:", error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetRandomArticle();
  }, [user, repository]);

  const handleGetRandomArticle = () => {
    fetchAndSetRandomArticle();
  };

  const handleArticleClick = (url: string, event: React.MouseEvent) => {
    event.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleGoogleSearch = (title: string, event: React.MouseEvent) => {
    event.preventDefault();
    const searchUrl =
      "https://google.com/search?q=" + encodeURIComponent(title);
    window.open(searchUrl, "_blank", "noopener,noreferrer");
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
              {article.isRead && (
                <div className="remember-text">
                  <span>🎪 ¿Quieres dar otra vuelta a este artículo?</span>
                </div>
              )}
              <div className="article-header">
                <h4 className="article-title">{article.title}</h4>
              </div>
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
                      onClick={(e) => handleGoogleSearch(article.title, e)}
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
                    onClick={(e) => handleArticleClick(article.url, e)}
                  >
                    🔗 Leer artículo
                  </a>
                )}
              </div>
              <div className="article-meta-container">
                <p className="article-date">
                  {article.isRead && article.readAt ? (
                    <>
                      <span className="read-tag-inline">📖 Leído</span>
                      {` ${formatDistanceToNow(article.readAt, {
                        addSuffix: true,
                        locale: es,
                      })}`}
                    </>
                  ) : (
                    `Guardado ${formatDistanceToNow(article.dateAdded, {
                      addSuffix: true,
                      locale: es,
                    })}`
                  )}
                </p>
                {isBefore(article.dateAdded, subYears(new Date(), 1)) && (
                  <p className="article-warning">
                    ⚠️ Este artículo podría estar desactualizado.
                  </p>
                )}
              </div>
            </>
          ) : loading ? (
            <div className="loading-state">🔄 Buscando en tus artículos...</div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>¡Tu biblioteca está vacía!</h3>
              <p>No tienes artículos guardados todavía.</p>
              <p className="empty-state-cta">
                Haz clic en el botón <strong>+ New</strong> del sidebar para
                añadir tu primer artículo y empezar a leer.
              </p>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleGetRandomArticle}
        disabled={loading || !article}
        className="modern-button button-primary random-article-button"
      >
        {loading
          ? "🔄 Buscando..."
          : !article
          ? "No hay artículos"
          : "Dame otro 🎲"}
      </button>
    </div>
  );
}
