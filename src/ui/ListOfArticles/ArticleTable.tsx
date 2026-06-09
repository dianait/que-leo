import "./ListOfArticles.css";
import type { Article } from "../../domain/Article";
import { ArticleTableSkeleton } from "../AppSkeleton/AppSkeleton";
import { AddArticle } from "../AddArticle/AddArticleModal";
import { ConfirmModal } from "../shared/ConfirmModal";
import { ShareModal } from "../shared/ShareModal";
import { useArticleTable } from "./useArticleTable";

function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="toast-notification" role="status" aria-live="polite">
      {message}
    </div>
  );
}

export function ArticleTable() {
  const {
    pageSize,
    articlesState,
    filtersState,
    uiState,
    filteredArticles,
    effectiveTotal,
    displayedArticles,
    dispatchArticles,
    dispatchFilters,
    dispatchUI,
    handleToggleRead,
    handleToggleFavorite,
    handleDelete,
    clearSearch,
    cachedTotal,
  } = useArticleTable();

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
        <AddArticle />
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
            aria-label="Buscar artículos por título"
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
            aria-pressed={
              filtersState.readFilter === "all" &&
              filtersState.favoriteFilter === "all"
            }
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
            aria-pressed={filtersState.readFilter === "unread"}
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
            aria-pressed={filtersState.readFilter === "read"}
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
            aria-pressed={filtersState.favoriteFilter === "favorites"}
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
                {cachedTotal > 0 && (
                  <span style={{ marginLeft: "8px", opacity: 0.7 }}>
                    (de {cachedTotal} total)
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
              {displayedArticles.map((article: Article) => (
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
                onClick={clearSearch}
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
          {Math.max(1, Math.ceil(effectiveTotal / pageSize))}
        </span>
        <button
          className="app-button"
          onClick={() =>
            dispatchArticles({
              type: "SET_PAGE",
              payload: articlesState.page + 1,
            })
          }
          disabled={articlesState.page * pageSize >= effectiveTotal}
        >
          Siguiente
        </button>
        <span className="pagination-total">Total: {effectiveTotal}</span>
      </div>
    </div>
  );
}
