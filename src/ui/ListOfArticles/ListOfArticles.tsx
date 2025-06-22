import { useState, useEffect, useContext } from "react";
import "./ListOfArticles.css";
import { Article } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { GetArticlesByUser } from "../../application/GetArticlesByUser";
import { MarkArticleAsRead } from "../../application/MarkArticleAsRead";
import { AddArticle } from "../AddArticle/AddArticle";
import { ArticleItemSkeleton } from "./ArticleItemSkeleton";

export function ListOfArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!repository || !user) {
      return;
    }

    if (articles.length > 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchArticles = async () => {
      try {
        const useCase = new GetArticlesByUser(repository);
        const result = await useCase.execute(user.id);
        setArticles(result);
      } catch (error) {
        console.error("Error al cargar artículos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [user, repository]);

  const handleToggleRead = async (articleToToggle: Article) => {
    if (!repository) return;

    const newArticleState = articleToToggle.isRead
      ? articleToToggle.markAsUnread()
      : articleToToggle.markAsRead();

    setArticles((currentArticles) =>
      currentArticles.map((article) =>
        article.id === articleToToggle.id ? newArticleState : article
      )
    );

    try {
      const useCase = new MarkArticleAsRead(repository);
      await useCase.execute(Number(articleToToggle.id), newArticleState.isRead);
    } catch (error) {
      console.error("Error al marcar como leído:", error);
      // Revertir en caso de error
      setArticles((currentArticles) =>
        currentArticles.map((article) =>
          article.id === articleToToggle.id ? articleToToggle : article
        )
      );
    }
  };

  return (
    <>
      <button
        className={`sidebar-toggle${sidebarOpen ? " hidden" : ""}`}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        onClick={() => setSidebarOpen((open) => !open)}
      >
        <span className="hamburger-icon">☰</span>
      </button>

      {sidebarOpen && isMobile && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        style={{ minWidth: 340, maxWidth: 420 }}
      >
        <div className="sidebar-header">
          <h2>Mis Artículos ({articles.length})</h2>
          <div className="sidebar-header-actions">
            <AddArticle />
            <button
              className="close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              ×
            </button>
          </div>
        </div>
        {loading ? (
          <ul className="sidebar-list">
            {[...Array(5)].map((_, index) => (
              <ArticleItemSkeleton key={index} />
            ))}
          </ul>
        ) : articles.length > 0 ? (
          articles.every((article) => article.isRead) ? (
            <div className="all-read-message">
              <div className="empty-state-icon">🎉</div>
              <h3>¡Todo leído!</h3>
              <p>Has repasado todos tus artículos pendientes. ¡Buen trabajo!</p>
              <p className="empty-state-cta">
                Añade más artículos con el botón <strong>+ New</strong> para
                seguir leyendo.
              </p>
            </div>
          ) : (
            <ul className="sidebar-list">
              {articles.map((article) => (
                <li
                  key={article.id}
                  className={`sidebar-list-item ${
                    article.isRead ? "is-read" : ""
                  }`}
                >
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.title}
                  </a>
                  <div className="item-meta">
                    <span className="sidebar-date">
                      {article.isRead && article.readAt
                        ? `Leído: ${new Date(
                            article.readAt
                          ).toLocaleDateString()}`
                        : new Date(article.dateAdded).toLocaleDateString()}
                    </span>
                    <button
                      className={`app-button ${
                        article.isRead ? "success" : ""
                      }`}
                      onClick={() => handleToggleRead(article)}
                      title={
                        article.isRead
                          ? "Marcar como no leído"
                          : "Marcar como leído"
                      }
                    >
                      {article.isRead ? "Leído" : "Marcar como leído"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="empty-state-sidebar">
            <div className="empty-state-icon">📖</div>
            <h3>¡Comienza tu colección!</h3>
            <p>No tienes artículos guardados todavía.</p>
            <p className="empty-state-cta">
              Usa el botón <strong>+ New</strong> de arriba para añadir tu
              primer artículo.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
