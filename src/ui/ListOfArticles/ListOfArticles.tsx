import { useState, useEffect, useContext } from "react";
import "./ListOfArticles.css";
import type { Article } from "../../domain/Article";
import { markArticleAsRead, markArticleAsUnread } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { GetArticlesByUser } from "../../application/GetArticlesByUser";
import { MarkArticleAsRead } from "../../application/MarkArticleAsRead";
import { AddArticle } from "../AddArticle/AddArticleModal";
import { ArticleItemSkeleton } from "./ArticleItemSkeleton";

export function ListOfArticles({
  articlesVersion,
  setArticlesVersion,
}: {
  articlesVersion: number;
  setArticlesVersion: (v: (v: number) => number) => void;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);

  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!repository || !user) {
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
  }, [user, repository, articlesVersion]);

  const handleToggleRead = async (articleToToggle: Article) => {
    if (!repository) return;

    const newArticleState = articleToToggle.isRead
      ? markArticleAsUnread(articleToToggle)
      : markArticleAsRead(articleToToggle);

    try {
      const useCase = new MarkArticleAsRead(repository);
      await useCase.execute(Number(articleToToggle.id), newArticleState.isRead);
      setArticlesVersion((v) => v + 1);
    } catch (error) {
      console.error("Error al marcar como leído:", error);
    }
  };

  const handleArticleClick = (url: string, event: React.MouseEvent) => {
    event.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {isMobile && !sidebarOpen && (
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed",
            top: 15,
            left: 15,
            zIndex: 1101,
            display: "flex",
          }}
          aria-label="Abrir sidebar"
        >
          ☰
        </button>
      )}
      <aside
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        style={{
          minWidth: 340,
          maxWidth: 420,
          display: !sidebarOpen && isMobile ? "none" : undefined,
        }}
      >
        <div className="sidebar-header">
          <div className="sidebar-header-actions">
            <AddArticle />
          </div>
          <h2>Mis Artículos ({articles.length})</h2>
          {isMobile && sidebarOpen && (
            <button
              className="close-btn mobile-only"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar sidebar"
              style={{ marginLeft: 8 }}
            >
              ×
            </button>
          )}
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
                Añade más artículos con el botón <strong>+ Nuevo</strong> para
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
                    onClick={(e) => handleArticleClick(article.url, e)}
                  >
                    🔗 {article.title}
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
              Añade más artículos con el botón <strong>+ Nuevo</strong> de
              arriba para añadir tu primer artículo.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
