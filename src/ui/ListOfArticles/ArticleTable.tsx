import "./ListOfArticles.css";
import { useEffect, useContext, useReducer } from "react";
import type { Article } from "../../domain/Article";
import {
  markArticleAsRead,
  markArticleAsUnread,
  markArticleAsFavorite,
  markArticleAsUnfavorite,
} from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { ArticleService } from "../../application/ArticleService";
import { ArticleTableSkeleton } from "../AppSkeleton/AppSkeleton";
import { AddArticle } from "../AddArticle/AddArticleModal";

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

// Articles state reducer
type ArticlesState = {
  articles: Article[];
  total: number;
  page: number;
  allArticles: Article[];
  loading: boolean;
};

type ArticlesAction =
  | { type: "SET_ARTICLES"; payload: { articles: Article[]; total: number } }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_ALL_ARTICLES"; payload: Article[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "UPDATE_ARTICLE"; payload: { id: number; updates: Partial<Article> } }
  | { type: "REMOVE_ARTICLE"; payload: number };

function articlesReducer(
  state: ArticlesState,
  action: ArticlesAction
): ArticlesState {
  switch (action.type) {
    case "SET_ARTICLES":
      return {
        ...state,
        articles: action.payload.articles,
        total: action.payload.total,
        loading: false,
      };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_ALL_ARTICLES":
      return { ...state, allArticles: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "UPDATE_ARTICLE": {
      const updateArticle = (articles: Article[]) =>
        articles.map((a) =>
          Number(a.id) === action.payload.id
            ? { ...a, ...action.payload.updates }
            : a
        );
      return {
        ...state,
        articles: updateArticle(state.articles),
        allArticles:
          state.allArticles.length > 0
            ? updateArticle(state.allArticles)
            : state.allArticles,
      };
    }
    case "REMOVE_ARTICLE":
      return {
        ...state,
        articles: state.articles.filter(
          (a) => Number(a.id) !== action.payload
        ),
        allArticles: state.allArticles.filter(
          (a) => Number(a.id) !== action.payload
        ),
      };
    default:
      return state;
  }
}

// Filters state reducer
type FiltersState = {
  readFilter: "all" | "unread" | "read";
  favoriteFilter: "all" | "favorites";
  searchTerm: string;
  isSearching: boolean;
};

type FiltersAction =
  | { type: "SET_READ_FILTER"; payload: "all" | "unread" | "read" }
  | { type: "SET_FAVORITE_FILTER"; payload: "all" | "favorites" }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_IS_SEARCHING"; payload: boolean }
  | { type: "RESET_FILTERS" };

function filtersReducer(
  state: FiltersState,
  action: FiltersAction
): FiltersState {
  switch (action.type) {
    case "SET_READ_FILTER":
      return { ...state, readFilter: action.payload };
    case "SET_FAVORITE_FILTER":
      return { ...state, favoriteFilter: action.payload };
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };
    case "SET_IS_SEARCHING":
      return { ...state, isSearching: action.payload };
    case "RESET_FILTERS":
      return {
        readFilter: "all",
        favoriteFilter: "all",
        searchTerm: "",
        isSearching: false,
      };
    default:
      return state;
  }
}

// UI state reducer
type UIState = {
  modalOpen: boolean;
  articleToDelete: number | null;
  toast: boolean;
  showShareModal: boolean;
  lastReadArticle: Article | null;
};

type UIAction =
  | { type: "OPEN_DELETE_MODAL"; payload: number }
  | { type: "CLOSE_DELETE_MODAL" }
  | { type: "SHOW_TOAST" }
  | { type: "HIDE_TOAST" }
  | { type: "SHOW_SHARE_MODAL"; payload: Article }
  | { type: "CLOSE_SHARE_MODAL" };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "OPEN_DELETE_MODAL":
      return {
        ...state,
        modalOpen: true,
        articleToDelete: action.payload,
      };
    case "CLOSE_DELETE_MODAL":
      return {
        ...state,
        modalOpen: false,
        articleToDelete: null,
      };
    case "SHOW_TOAST":
      return { ...state, toast: true };
    case "HIDE_TOAST":
      return { ...state, toast: false };
    case "SHOW_SHARE_MODAL":
      return {
        ...state,
        showShareModal: true,
        lastReadArticle: action.payload,
      };
    case "CLOSE_SHARE_MODAL":
      return {
        ...state,
        showShareModal: false,
        lastReadArticle: null,
      };
    default:
      return state;
  }
}

export function ArticleTable({
  articlesVersion,
  setArticlesVersion,
}: {
  articlesVersion: number;
  setArticlesVersion: (v: (v: number) => number) => void;
}) {
  const PAGE_SIZE = 15;
  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  // Articles state
  const [articlesState, dispatchArticles] = useReducer(articlesReducer, {
    articles: [],
    total: 0,
    page: 1,
    allArticles: [],
    loading: true,
  });

  // Filters state
  const [filtersState, dispatchFilters] = useReducer(filtersReducer, {
    readFilter: "all",
    favoriteFilter: "all",
    searchTerm: "",
    isSearching: false,
  });

  // UI state
  const [uiState, dispatchUI] = useReducer(uiReducer, {
    modalOpen: false,
    articleToDelete: null,
    toast: false,
    showShareModal: false,
    lastReadArticle: null,
  });

  // Determine if we need to filter (any filter active or search)
  const hasActiveFilters =
    filtersState.readFilter !== "all" ||
    filtersState.favoriteFilter === "favorites";
  const needsAllArticles =
    filtersState.searchTerm !== "" || hasActiveFilters;

  // Build base set - use allArticles if we have filters or search, otherwise use current page
  const base = needsAllArticles
    ? articlesState.allArticles.filter((article) => {
        // Apply search filter if present
        if (
          filtersState.searchTerm &&
          !article.title
            .toLowerCase()
            .includes(filtersState.searchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
    : articlesState.articles;

  const filteredArticles = base.filter((article) => {
    // Apply read filter
    if (filtersState.readFilter === "unread" && article.isRead) return false;
    if (filtersState.readFilter === "read" && !article.isRead) return false;

    // Apply favorite filter
    if (
      filtersState.favoriteFilter === "favorites" &&
      !article.isFavorite
    )
      return false;

    return true;
  });

  // Calculate total based on filtered articles when filters are active
  const effectiveTotal = needsAllArticles
    ? filteredArticles.length
    : articlesState.total;

  // Sort by read date when filter is "read"
  const sortedArticles =
    filtersState.readFilter === "read"
      ? [...filteredArticles].sort((a, b) => {
          const aTime = a.readAt ? new Date(a.readAt).getTime() : 0;
          const bTime = b.readAt ? new Date(b.readAt).getTime() : 0;
          return bTime - aTime; // descending: most recent first
        })
      : filteredArticles;

  // Apply pagination when filters are active (when we have all articles loaded)
  // When no filters, use articles directly (already paginated from server)
  const displayedArticles = needsAllArticles
    ? sortedArticles.slice(
        (articlesState.page - 1) * PAGE_SIZE,
        articlesState.page * PAGE_SIZE
      )
    : articlesState.articles;

  // Load all articles for search purposes
  const fetchAllArticles = async () => {
    if (!repository || !user) return;
    dispatchFilters({ type: "SET_IS_SEARCHING", payload: true });
    try {
      const svc = new ArticleService(repository);
      const { articles } = await svc.getByUserPaginated(user.id, 1000, 0); // Load up to 1000 articles
      dispatchArticles({ type: "SET_ALL_ARTICLES", payload: articles });
    } catch (error) {
      console.error("Error al cargar todos los artículos:", error);
    } finally {
      dispatchFilters({ type: "SET_IS_SEARCHING", payload: false });
    }
  };

  useEffect(() => {
    if (!repository || !user) return;
    const fetchArticles = async () => {
      dispatchArticles({ type: "SET_LOADING", payload: true });
      try {
        const svc = new ArticleService(repository);
        const { articles, total } = await svc.getByUserPaginated(
          user.id,
          PAGE_SIZE,
          (articlesState.page - 1) * PAGE_SIZE
        );
        dispatchArticles({
          type: "SET_ARTICLES",
          payload: { articles, total },
        });
      } catch (error) {
        console.error("Error loading user articles:", error);
        dispatchArticles({ type: "SET_LOADING", payload: false });
      }
    };
    fetchArticles();
  }, [user, repository, articlesVersion, articlesState.page]);

  // Load all articles when there is a search term or active filters
  useEffect(() => {
    const hasActiveFilters =
      filtersState.readFilter !== "all" ||
      filtersState.favoriteFilter === "favorites";
    if (
      (filtersState.searchTerm || hasActiveFilters) &&
      articlesState.allArticles.length === 0
    ) {
      fetchAllArticles();
    }
  }, [
    filtersState.searchTerm,
    filtersState.readFilter,
    filtersState.favoriteFilter,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    dispatchArticles({ type: "SET_PAGE", payload: 1 });
  }, [
    filtersState.readFilter,
    filtersState.favoriteFilter,
    filtersState.searchTerm,
  ]);

  const handleToggleRead = async (articleToToggle: Article) => {
    if (!repository) return;
    const newArticleState = articleToToggle.isRead
      ? markArticleAsUnread(articleToToggle)
      : markArticleAsRead(articleToToggle);

    // Update local state immediately for a snappier UI
    dispatchArticles({
      type: "UPDATE_ARTICLE",
      payload: {
        id: Number(articleToToggle.id),
        updates: { isRead: newArticleState.isRead },
      },
    });

    try {
      const svc = new ArticleService(repository);
      await svc.markRead(Number(articleToToggle.id), newArticleState.isRead);

      if (!articleToToggle.isRead) {
        dispatchUI({
          type: "SHOW_SHARE_MODAL",
          payload: articleToToggle,
        });
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      // Revert local change if it fails
      dispatchArticles({
        type: "UPDATE_ARTICLE",
        payload: {
          id: Number(articleToToggle.id),
          updates: { isRead: articleToToggle.isRead },
        },
      });
    }
  };

  const handleToggleFavorite = async (articleToToggle: Article) => {
    if (!repository) return;
    const newArticleState = articleToToggle.isFavorite
      ? markArticleAsUnfavorite(articleToToggle)
      : markArticleAsFavorite(articleToToggle);

    // Update local state immediately for a snappier UI
    dispatchArticles({
      type: "UPDATE_ARTICLE",
      payload: {
        id: Number(articleToToggle.id),
        updates: { isFavorite: newArticleState.isFavorite },
      },
    });

    try {
      const svc = new ArticleService(repository);
      await svc.markFavorite(
        Number(articleToToggle.id),
        newArticleState.isFavorite ?? false
      );
    } catch (error) {
      console.error("Error marking as favorite:", error);
      // Revert local change if it fails
      dispatchArticles({
        type: "UPDATE_ARTICLE",
        payload: {
          id: Number(articleToToggle.id),
          updates: { isFavorite: articleToToggle.isFavorite },
        },
      });
    }
  };

  const handleDelete = async (articleId: number) => {
    if (!repository || !user) return;
    dispatchUI({ type: "CLOSE_DELETE_MODAL" });
    console.log("Attempting to delete article", { articleId, userId: user.id });
    try {
      const svc = new ArticleService(repository);
      await svc.delete(Number(articleId), user.id);
      console.log("Article deleted successfully", articleId);
      dispatchArticles({ type: "REMOVE_ARTICLE", payload: articleId });
      dispatchUI({ type: "SHOW_TOAST" });
      setTimeout(() => dispatchUI({ type: "HIDE_TOAST" }), 2000);
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

      {/* Search and filters */}
      <div className="search-controls">
        <div className="search-input">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={filtersState.searchTerm}
            onChange={(e) =>
              dispatchFilters({
                type: "SET_SEARCH_TERM",
                payload: e.target.value,
              })
            }
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
        {/* Filtros por estado de lectura y favoritos */}
        <div className="read-filter-group">
          <button
            className={`app-button filter-button filter-all ${
              filtersState.readFilter === "all" &&
              filtersState.favoriteFilter === "all"
                ? "active"
                : ""
            }`}
            onClick={() => {
              dispatchFilters({ type: "SET_READ_FILTER", payload: "all" });
              dispatchFilters({
                type: "SET_FAVORITE_FILTER",
                payload: "all",
              });
            }}
            title="Mostrar todos"
          >
            📚 Todos
          </button>
          <button
            className={`app-button filter-button filter-unread ${
              filtersState.readFilter === "unread" ? "active" : ""
            }`}
            onClick={() => {
              dispatchFilters({ type: "SET_READ_FILTER", payload: "unread" });
              dispatchFilters({
                type: "SET_FAVORITE_FILTER",
                payload: "all",
              });
            }}
            title="Solo no leídos"
          >
            📄 No leídos
          </button>
          <button
            className={`app-button filter-button filter-read ${
              filtersState.readFilter === "read" ? "active" : ""
            }`}
            onClick={() => {
              dispatchFilters({ type: "SET_READ_FILTER", payload: "read" });
              dispatchFilters({
                type: "SET_FAVORITE_FILTER",
                payload: "all",
              });
            }}
            title="Solo leídos"
          >
            ✅ Leídos
          </button>
          <button
            className={`app-button filter-button filter-favorites ${
              filtersState.favoriteFilter === "favorites" ? "active" : ""
            }`}
            onClick={() => {
              dispatchFilters({
                type: "SET_FAVORITE_FILTER",
                payload:
                  filtersState.favoriteFilter === "favorites" ? "all" : "favorites",
              });
              dispatchFilters({ type: "SET_READ_FILTER", payload: "all" });
            }}
            title="Solo favoritos"
          >
            ⭐ Favoritos
          </button>
        </div>
        {filtersState.searchTerm && (
          <div style={{ marginTop: "8px", fontSize: "14px", color: "#6c757d" }}>
            {filtersState.isSearching ? (
              "🔍 Buscando en todos los artículos..."
            ) : (
              <>
                {filteredArticles.length} artículo
                {filteredArticles.length !== 1 ? "s" : ""} encontrado
                {filteredArticles.length !== 1 ? "s" : ""}
                {articlesState.allArticles.length > 0 && (
                  <span style={{ marginLeft: "8px", opacity: 0.7 }}>
                    (de {articlesState.allArticles.length} total)
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <Toast message="Artículo borrado correctamente" show={uiState.toast} />
      <ConfirmModal
        open={uiState.modalOpen}
        onCancel={() => dispatchUI({ type: "CLOSE_DELETE_MODAL" })}
        onConfirm={() => {
          if (uiState.articleToDelete !== null)
            handleDelete(uiState.articleToDelete);
        }}
      />
      <ShareModal
        open={uiState.showShareModal}
        article={uiState.lastReadArticle}
        onClose={() => dispatchUI({ type: "CLOSE_SHARE_MODAL" })}
      />
      {articlesState.loading ? (
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
                  <td>{article.authors ? article.authors.join(", ") : "-"}</td>
                  <td>
                    <div className="article-actions">
                      <button
                        className={`app-button icon-only status ${
                          article.isRead ? "success" : ""
                        }`}
                        onClick={() => handleToggleRead(article)}
                        title={
                          article.isRead
                            ? "Marcar como no leído"
                            : "Marcar como leído"
                        }
                      >
                        <span>{article.isRead ? "✅" : "📖"}</span>
                      </button>
                      <button
                        className="app-button icon-only favorite"
                        onClick={() => handleToggleFavorite(article)}
                        title={
                          article.isFavorite
                            ? "Quitar de favoritos"
                            : "Añadir a favoritos"
                        }
                        style={{
                          backgroundColor: article.isFavorite
                            ? "#ffd700"
                            : undefined,
                          color: article.isFavorite ? "#333" : undefined,
                        }}
                      >
                        {article.isFavorite ? (
                          <span>⭐</span>
                        ) : (
                          <img
                            src="/star_unfilled.png"
                            alt=""
                            style={{ width: "1.5em", height: "1.5em" }}
                          />
                        )}
                      </button>
                      <button
                        className="app-button icon-only danger"
                        onClick={() => {
                          dispatchUI({
                            type: "OPEN_DELETE_MODAL",
                            payload: Number(article.id),
                          });
                        }}
                        title="Borrar artículo"
                      >
                        <span>🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Message when there are no search results */}
          {filtersState.searchTerm && filteredArticles.length === 0 && (
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
                No hay artículos que coincidan con "{filtersState.searchTerm}"
              </p>
              <button
                onClick={() => {
                  dispatchFilters({ type: "SET_SEARCH_TERM", payload: "" });
                  dispatchArticles({ type: "SET_ALL_ARTICLES", payload: [] });
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
          onClick={() =>
            dispatchArticles({
              type: "SET_PAGE",
              payload: Math.max(1, articlesState.page - 1),
            })
          }
          disabled={articlesState.page === 1}
        >
          Anterior
        </button>
        <span className="pagination-info">
          Página {articlesState.page} de{" "}
          {Math.max(1, Math.ceil(effectiveTotal / PAGE_SIZE))}
        </span>
        <button
          className="app-button"
          onClick={() =>
            dispatchArticles({
              type: "SET_PAGE",
              payload: articlesState.page + 1,
            })
          }
          disabled={articlesState.page * PAGE_SIZE >= effectiveTotal}
        >
          Siguiente
        </button>
        <span className="pagination-total">Total: {effectiveTotal}</span>
      </div>
    </div>
  );
}
