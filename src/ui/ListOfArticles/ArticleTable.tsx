import "./ListOfArticles.css";
import { useEffect, useState, useContext } from "react";
import type { Article } from "../../domain/Article";
import { markArticleAsRead, markArticleAsUnread } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { GetArticlesByUserPaginated } from "../../application/GetArticlesByUser";
import { MarkArticleAsRead } from "../../application/MarkArticleAsRead";
import { DeleteArticle } from "../../application/DeleteArticle";

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

export function ArticleTable({
  articlesVersion,
  setArticlesVersion,
}: {
  articlesVersion: number;
  setArticlesVersion: (v: (v: number) => number) => void;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!repository || !user) return;
    setLoading(true);
    const fetchArticles = async () => {
      try {
        const useCase = new GetArticlesByUserPaginated(repository);
        const { articles, total } = await useCase.execute(
          user.id,
          PAGE_SIZE,
          (page - 1) * PAGE_SIZE
        );
        setArticles(articles);
        setTotal(total);
      } catch (error) {
        console.error("Error al cargar artículos del usuario:", error);
      } finally {
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
    try {
      const useCase = new MarkArticleAsRead(repository);
      await useCase.execute(Number(articleToToggle.id), newArticleState.isRead);
      setArticlesVersion((v) => v + 1);
    } catch (error) {
      console.error("Error al marcar como leído:", error);
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
      <Toast message="Artículo borrado correctamente" show={toast} />
      <ConfirmModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          if (articleToDelete !== null) handleDelete(articleToDelete);
        }}
      />
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
            {articles.map((article) => (
              <tr key={article.id} className={article.isRead ? "is-read" : ""}>
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
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5em",
                      alignItems: "center",
                    }}
                  >
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
                      style={{
                        fontSize: "1em",
                        padding: "0.3em 0.9em",
                        whiteSpace: "nowrap",
                      }}
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
                      style={{
                        fontSize: "1em",
                        padding: "0.3em 0.9em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      🗑️ Borrar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-controls">
        <button
          className="app-button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span style={{ margin: "0 1.2em" }}>
          Página {page} de {Math.max(1, Math.ceil(total / PAGE_SIZE))}
        </span>
        <button
          className="app-button"
          onClick={() => setPage((p) => p + 1)}
          disabled={page * PAGE_SIZE >= total}
        >
          Siguiente
        </button>
        <span style={{ marginLeft: "2em", color: "#888", fontSize: "0.95em" }}>
          Total: {total}
        </span>
      </div>
    </div>
  );
}
