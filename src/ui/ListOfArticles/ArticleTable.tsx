import "./ListOfArticles.css";
import { useEffect, useState, useContext } from "react";
import type { Article } from "../../domain/Article";
import { markArticleAsRead, markArticleAsUnread } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { ArticleService } from "../../application/ArticleService";
import { ArticleTableSkeleton } from "../AppSkeleton/AppSkeleton";
import { AddArticle } from "../AddArticle/AddArticleModal";

function getFlagEmoji(language?: string) {
  if (!language) return "";
  const map: Record<string, string> = {
    es: "🇪🇸",
    en: "🇬🇧",
  };
  return map[language] || "🌐";
}

function ConfirmModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>¿Borrar artículo?</h2>
        <p>
          ¿Seguro que quieres borrar este artículo? <br />
          <strong>Esta acción no se puede deshacer.</strong>
        </p>
        <div className="modal-actions">
          <button className="app-button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="app-button danger" onClick={onConfirm}>
            Borrar definitivamente
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;
  return <div className="toast-notification">{message}</div>;
}

function ShareModal({
  open,
  article,
  onClose,
}: {
  open: boolean;
  article: Article | null;
  onClose: () => void;
}) {
  if (!open || !article) return null;
  const shareText = encodeURIComponent(`¡He leído: ${article.title}!`);
  const url = encodeURIComponent(article.url);
  const blueskyUrl = `https://bsky.app/intent/compose?text=${shareText}%20${url}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ position: "relative" }}>
        <button className="modal-close" onClick={onClose} title="Cerrar">
          <span style={{ fontSize: "1.5em", fontWeight: 700, color: "#888" }}>
            ×
          </span>
        </button>
        <h2>¡Genial! 🎉</h2>
        <p>
          Has marcado este artículo como leído.
          <br />
          ¿Quieres compartirlo en tus redes?
        </p>
        <div className="share-buttons-row">
          <a
            href={blueskyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="share-button bluesky"
          >
            <img src="/blusky.svg" alt="Bluesky" className="share-icon" />
            Bluesky
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="share-button linkedin"
          >
            <img src="/linkedin.svg" alt="LinkedIn" className="share-icon" />
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}

export function ArticleTable({
  articlesVersion,
  setArticlesVersion,
}: {
  articlesVersion: number;
  setArticlesVersion: (v: (v: number) => number) => void;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
  const [toast, setToast] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [lastReadArticle, setLastReadArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">(
    "all"
  );

  // Build base set from search and then apply read filter
  const base = searchTerm
    ? allArticles.filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : articles;
  const filteredArticles = base.filter((article) => {
    if (readFilter === "all") return true;
    if (readFilter === "unread") return !article.isRead;
    return article.isRead;
  });

  // Sort by read date when filter is "read"
  const displayedArticles =
    readFilter === "read"
      ? [...filteredArticles].sort((a, b) => {
          const aTime = a.readAt ? new Date(a.readAt).getTime() : 0;
          const bTime = b.readAt ? new Date(b.readAt).getTime() : 0;
          return bTime - aTime; // descendente: más reciente primero
        })
      : filteredArticles;

  // Load all articles for search purposes
  const fetchAllArticles = async () => {
    if (!repository || !user) return;
    setIsSearching(true);
    try {
      const svc = new ArticleService(repository);
      const { articles } = await svc.getByUserPaginated(user.id, 1000, 0); // Load up to 1000 articles
      setAllArticles(articles);
    } catch (error) {
      console.error("Error al cargar todos los artículos:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!repository || !user) return;
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const svc = new ArticleService(repository);
        const { articles, total } = await svc.getByUserPaginated(
          user.id,
          PAGE_SIZE,
          (page - 1) * PAGE_SIZE
        );
        setArticles(articles);
        setTotal(total);
        setLoading(false);
      } catch (error) {
        console.error("Error loading user articles:", error);
        setLoading(false);
      }
    };
    fetchArticles();
  }, [user, repository, articlesVersion, page]);

  // Load all articles when there is a search term
  useEffect(() => {
    if (searchTerm && allArticles.length === 0) {
      fetchAllArticles();
    }
  }, [searchTerm]);

  const handleToggleRead = async (articleToToggle: Article) => {
    if (!repository) return;
    const newArticleState = articleToToggle.isRead
      ? markArticleAsUnread(articleToToggle)
      : markArticleAsRead(articleToToggle);

    // Update local state immediately for a snappier UI
    setArticles((prev) =>
      prev.map((article) =>
        Number(article.id) === Number(articleToToggle.id)
          ? { ...article, isRead: newArticleState.isRead }
          : article
      )
    );

    try {
      const svc = new ArticleService(repository);
      await svc.markRead(Number(articleToToggle.id), newArticleState.isRead);

      // Only update version if needed elsewhere
      // setArticlesVersion((v) => v + 1);

      if (!articleToToggle.isRead) {
        setLastReadArticle(articleToToggle);
        setShowShareModal(true);
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      // Revert local change if it fails
      setArticles((prev) =>
        prev.map((article) =>
          Number(article.id) === Number(articleToToggle.id)
            ? { ...article, isRead: articleToToggle.isRead }
            : article
        )
      );
    }
  };

  const handleDelete = async (articleId: number) => {
    if (!repository || !user) return;
    setModalOpen(false);
    console.log("Attempting to delete article", { articleId, userId: user.id });
    try {
      const svc = new ArticleService(repository);
      await svc.delete(Number(articleId), user.id);
      console.log("Article deleted successfully", articleId);
      setArticles((prev) =>
        prev.filter((a) => Number(a.id) !== Number(articleId))
      );
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    } catch (error: any) {
      console.error("Error al borrar el artículo:", error);
      alert("Error al borrar el artículo: " + (error?.message || error));
    }
  };

  return (
    <div className="articles-table-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0, color: "#333" }}>Mis artículos</h2>
        <AddArticle setArticlesVersion={setArticlesVersion} />
      </div>

      {/* Búsqueda y filtros */}
      <div className="search-controls">
        <div className="search-input">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-field"
            onFocus={(e) => {
              e.target.style.borderColor = "#5a6fd8";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e1e5e9";
            }}
          />
          <span className="search-input-icon">🔍</span>
        </div>
        {/* Filtro por estado de lectura */}
        <div className="read-filter-group">
          <button
            className={`app-button filter-button filter-all ${
              readFilter === "all" ? "active" : ""
            }`}
            onClick={() => setReadFilter("all")}
            title="Mostrar todos"
          >
            📚 Todos
          </button>
          <button
            className={`app-button filter-button filter-unread ${
              readFilter === "unread" ? "active" : ""
            }`}
            onClick={() => setReadFilter("unread")}
            title="Solo no leídos"
          >
            📄 No leídos
          </button>
          <button
            className={`app-button filter-button filter-read ${
              readFilter === "read" ? "active" : ""
            }`}
            onClick={() => setReadFilter("read")}
            title="Solo leídos"
          >
            ✅ Leídos
          </button>
        </div>
        {searchTerm && (
          <div style={{ marginTop: "8px", fontSize: "14px", color: "#6c757d" }}>
            {isSearching ? (
              "🔍 Buscando en todos los artículos..."
            ) : (
              <>
                {filteredArticles.length} artículo
                {filteredArticles.length !== 1 ? "s" : ""} encontrado
                {filteredArticles.length !== 1 ? "s" : ""}
                {allArticles.length > 0 && (
                  <span style={{ marginLeft: "8px", opacity: 0.7 }}>
                    (de {allArticles.length} total)
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <Toast message="Artículo borrado correctamente" show={toast} />
      <ConfirmModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          if (articleToDelete !== null) handleDelete(articleToDelete);
        }}
      />
      <ShareModal
        open={showShareModal}
        article={lastReadArticle}
        onClose={() => setShowShareModal(false)}
      />
      {loading ? (
        <ArticleTableSkeleton />
      ) : (
        <div className="table-responsive">
          <table className="articles-table">
            <thead>
              <tr>
                <th>
                  <span>📖 Título</span>
                </th>
                <th>
                  <span>🌎 Idioma</span>
                </th>
                <th>
                  <span>👤 Autores</span>
                </th>
                <th>
                  <span>⚡ Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedArticles.map((article) => (
                <tr
                  key={article.id}
                  className={article.isRead ? "is-read" : ""}
                >
                  <td>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-title-link"
                      title={article.title}
                    >
                      {article.title}
                    </a>
                  </td>
                  <td>{getFlagEmoji(article.language)}</td>
                  <td>{article.authors ? article.authors.join(", ") : "-"}</td>
                  <td>
                    <div className="article-actions">
                      <button
                        className={`app-button status ${
                          article.isRead ? "success" : ""
                        }`}
                        onClick={() => handleToggleRead(article)}
                        title={
                          article.isRead
                            ? "Marcar como no leído"
                            : "Marcar como leído"
                        }
                      >
                        {article.isRead ? "✅" : "📖"}
                        <span className="btn-text">
                          {article.isRead ? " Leído" : " No leído"}
                        </span>
                      </button>
                      <button
                        className="app-button danger"
                        onClick={() => {
                          setArticleToDelete(Number(article.id));
                          setModalOpen(true);
                        }}
                        title="Borrar artículo"
                      >
                        🗑️<span className="btn-text"> Borrar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mensaje cuando no hay resultados de búsqueda */}
          {searchTerm && filteredArticles.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#6c757d",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                marginTop: "20px",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#495057" }}>
                No se encontraron artículos
              </h3>
              <p style={{ margin: 0 }}>
                No hay artículos que coincidan con "{searchTerm}"
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setAllArticles([]);
                }}
                style={{
                  marginTop: "16px",
                  padding: "8px 16px",
                  backgroundColor: "#5a6fd8",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Limpiar búsqueda
              </button>
            </div>
          )}
        </div>
      )}
      <div className="pagination-controls">
        <button
          className="app-button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span className="pagination-info">
          Página {page} de {Math.max(1, Math.ceil(total / PAGE_SIZE))}
        </span>
        <button
          className="app-button"
          onClick={() => setPage((p) => p + 1)}
          disabled={page * PAGE_SIZE >= total}
        >
          Siguiente
        </button>
        <span className="pagination-total">Total: {total}</span>
      </div>
    </div>
  );
}
