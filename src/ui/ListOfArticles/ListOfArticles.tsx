import { useState, useEffect, useContext } from "react";
import "./ListOfArticles.css";
import { Article } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";

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
    // Si el repositorio no está disponible, no hacemos nada.
    if (!repository) return;

    if (user && sidebarOpen) {
      setLoading(true);
      const fetchArticles = async () => {
        try {
          const result = await repository.getArticlesByUser(user.id);
          setArticles(result);
        } catch (error) {
          console.error("Error al cargar artículos del usuario:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchArticles();
    } else {
      setArticles([]);
    }
  }, [user, sidebarOpen, repository]);

  const handleArticleAdded = (newArticle: Article) => {
    setArticles((prevArticles) => [newArticle, ...prevArticles]);
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
          <button
            className="close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>
        {loading ? (
          <div className="sidebar-loading">Cargando...</div>
        ) : (
          <ul className="sidebar-list">
            {articles.map((article) => (
              <li key={article.id} className="sidebar-list-item">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
                <div className="sidebar-date">
                  {article.dateAdded.toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  );
}
