import "./ListOfArticles.css";
import { useEffect, useState, useContext } from "react";
import type { Article } from "../../domain/Article";
import { markArticleAsRead, markArticleAsUnread } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { GetArticlesByUserPaginated } from "../../application/GetArticlesByUser";
import { MarkArticleAsRead } from "../../application/MarkArticleAsRead";
import { DeleteArticle } from "../../application/DeleteArticle";
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

  // Filtrar artículos basándose en el término de búsqueda
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!repository || !user) return;
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const useCase = new GetArticlesByUserPaginated(repository);
        const { articles, total } = await useCase.execute(
          user.id,
          PAGE_SIZE,
          (page - 1) * PAGE_SIZE
        );
        setArticles(articles);
        setTotal(total);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar artículos del usuario:", error);
        setLoading(false);
      }
    };
    fetchArticles();
  }, [user, repository, articlesVersion, page]);

  const handleToggleRead = async (articleToToggle: Article) => {
    if (!repository) return;
    const newArticleState = articleToToggle.isRead
      ? markArticleAsUnread(articleToToggle)
      : markArticleAsRead(articleToToggle);

    // Actualizar el estado local inmediatamente para una UI más fluida
    setArticles((prev) =>
      prev.map((article) =>
        Number(article.id) === Number(articleToToggle.id)
          ? { ...article, isRead: newArticleState.isRead }
          : article
      )
    );

    try {
      const useCase = new MarkArticleAsRead(repository);
      await useCase.execute(Number(articleToToggle.id), newArticleState.isRead);

      // Solo actualizar la versión si es necesario para otros componentes
      // setArticlesVersion((v) => v + 1);

      if (!articleToToggle.isRead) {
        setLastReadArticle(articleToToggle);
        setShowShareModal(true);
      }
    } catch (error) {
      console.error("Error al marcar como leído:", error);
      // Revertir el cambio local si falla
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
    console.log("Intentando borrar artículo", { articleId, userId: user.id });
    try {
      const useCase = new DeleteArticle(repository);
      await useCase.execute(Number(articleId), user.id);
      console.log("Artículo borrado correctamente", articleId);
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
        <AddArticle
          setArticlesVersion={setArticlesVersion}
        />
      </div>
      
      {/* Campo de búsqueda */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <input
            type="text"
            placeholder="🔍 Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              paddingLeft: "40px",
              border: "2px solid #e1e5e9",
              borderRadius: "8px",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.2s ease",
              backgroundColor: "#fff",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#5a6fd8";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e1e5e9";
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "18px",
              color: "#6c757d",
            }}
          >
            🔍
          </span>
        </div>
        {searchTerm && (
          <div style={{ marginTop: "8px", fontSize: "14px", color: "#6c757d" }}>
            {filteredArticles.length} artículo{filteredArticles.length !== 1 ? 's' : ''} encontrado{filteredArticles.length !== 1 ? 's' : ''}
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
              {filteredArticles.map((article) => (
                <tr
                  key={article.id}
                  className={article.isRead ? "is-read" : ""}
                >
                  <td>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
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
                        {article.isRead ? "✅ Leído" : "📖 No leído"}
                      </button>
                      <button
                        className="app-button danger"
                        onClick={() => {
                          setArticleToDelete(Number(article.id));
                          setModalOpen(true);
                        }}
                        title="Borrar artículo"
                      >
                        🗑️ Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Mensaje cuando no hay resultados de búsqueda */}
          {searchTerm && filteredArticles.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#6c757d",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              marginTop: "20px",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#495057" }}>No se encontraron artículos</h3>
              <p style={{ margin: 0 }}>
                No hay artículos que coincidan con "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
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
