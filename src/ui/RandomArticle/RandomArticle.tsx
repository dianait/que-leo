import { useState, useEffect, useContext, useCallback, createContext, useContext as useReactContext } from "react";
// Modal context and provider
type ModalState = {
  confirm: boolean;
  share: boolean;
  favorite: boolean;
  articleToDelete: number | null;
};
type ModalActions = {
  openConfirm: (articleId: number) => void;
  closeConfirm: () => void;
  openShare: () => void;
  closeShare: () => void;
  openFavorite: () => void;
  closeFavorite: () => void;
};
const ModalContext = createContext<{ state: ModalState; actions: ModalActions } | undefined>(undefined);

function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>({
    confirm: false,
    share: false,
    favorite: false,
    articleToDelete: null,
  });
  const actions: ModalActions = {
    openConfirm: (articleId) => setState((s) => ({ ...s, confirm: true, articleToDelete: articleId })),
    closeConfirm: () => setState((s) => ({ ...s, confirm: false, articleToDelete: null })),
    openShare: () => setState((s) => ({ ...s, share: true })),
    closeShare: () => setState((s) => ({ ...s, share: false })),
    openFavorite: () => setState((s) => ({ ...s, favorite: true })),
    closeFavorite: () => setState((s) => ({ ...s, favorite: false })),
  };
  return <ModalContext.Provider value={{ state, actions }}>{children}</ModalContext.Provider>;
}
function useModals() {
  const ctx = useReactContext(ModalContext);
  if (!ctx) throw new Error("useModals must be used within ModalProvider");
  return ctx;
}
import { isBefore, subYears } from "date-fns";
import "./RandomArticle.css";
import type { Article } from "../../domain/Article";
import {
  markArticleAsFavorite,
  markArticleAsUnfavorite,
} from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { ArticleService } from "../../application/ArticleService";
import { TelegramLinkButton } from "../TelegramButton/TelegramLinkButton";
import { RandomArticleSkeleton } from "../AppSkeleton/AppSkeleton";

export function RandomArticle({ articlesVersion }: { articlesVersion: number }) {
  return (
    <ModalProvider>
      <RandomArticleInner articlesVersion={articlesVersion} />
    </ModalProvider>
  );
}

function RandomArticleInner({ articlesVersion }: { articlesVersion: number }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { state: modalState, actions: modalActions } = useModals();
  const [loadingRead, setLoadingRead] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  useEffect(() => {
    if (!repository || !user) return;
    const fetchArticles = async () => {
      setLoading(true);
      const svc = new ArticleService(repository);
      const result = await svc.getByUser(user.id);
      setArticles(result);
      setLoading(false);
    };
    fetchArticles();
  }, [user, repository, articlesVersion]);

  useEffect(() => {
    // Only pick a random article when none is selected and there are items available
    if (!article && articles.length > 0) {
      let filtered = articles.filter((a) => !a.isRead);
      if (filtered.length === 0) {
        setArticle(null);
      } else {
        const randomIndex = Math.floor(Math.random() * filtered.length);
        setArticle(filtered[randomIndex]);
      }
    }
  }, [articles, article]);

  const handleGetRandomArticle = () => {
    let filtered = articles.filter((a) => !a.isRead);
    if (filtered.length === 0) {
      setArticle(null);
    } else {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      setArticle(filtered[randomIndex]);
    }
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

  const handleDelete = async (articleId: number) => {
    if (!repository || !user) return;
    setModalOpen(false);
    console.log("Attempting to delete article", { articleId, userId: user.id });
    try {
      const svc = new ArticleService(repository);
      await svc.delete(Number(articleId), user.id);
      console.log("Article deleted successfully", articleId);

      // Update local articles list
      setArticles((prev) =>
        prev.filter((a) => Number(a.id) !== Number(articleId))
      );

      // If the deleted article was being displayed, pick a new one
      if (article && Number(article.id) === Number(articleId)) {
        const remainingArticles = articles.filter(
          (a) => Number(a.id) !== Number(articleId)
        );
        const filtered = remainingArticles.filter((a) => !a.isRead);
        if (filtered.length === 0) {
          setArticle(null);
        } else {
          const randomIndex = Math.floor(Math.random() * filtered.length);
          setArticle(filtered[randomIndex]);
        }
      }

      // no toast
    } catch (error) {
      console.error("Error al borrar artículo:", error);
    }
  };


// Compound Modal Component
function Modal({ children, onClose, show }: { children: React.ReactNode; onClose: () => void; show: boolean }) {
  if (!show) return null;
  return (
    <Modal.Overlay onClose={onClose}>
      <Modal.Content>{children}</Modal.Content>
    </Modal.Overlay>
  );
}
Modal.Overlay = function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
};
Modal.Content = function ModalContent({ children }: { children: React.ReactNode }) {
  return <div className="modal-content" style={{ position: "relative" }}>{children}</div>;
};

// Usage for ShareModal
function ShareModal({ article, show, onClose }: { article: Article | null; show: boolean; onClose: () => void }) {
  if (!show || !article) return null;
  const shareText = encodeURIComponent(`¡He leído: ${article.title}!`);
  const url = encodeURIComponent(article.url);
  const blueskyUrl = `https://bsky.app/intent/compose?text=${shareText}%20${url}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  return (
    <Modal show={show} onClose={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Cerrar">
        <span style={{ fontSize: "1.5em", fontWeight: 700, color: "#888" }}>×</span>
      </button>
      <h2 id="share-modal-title-random">¡Genial! 🎉</h2>
      <p>
        Has marcado este artículo como leído.
        <br />
        ¿Quieres compartirlo en tus redes?
      </p>
      <div className="share-buttons-row">
        <a href={blueskyUrl} target="_blank" rel="noopener noreferrer" className="share-button bluesky">
          <img src="/blusky.svg" alt="" className="share-icon" />
          Bluesky
        </a>
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="share-button linkedin">
          <img src="/linkedin.svg" alt="" className="share-icon" />
          LinkedIn
        </a>
      </div>
    </Modal>
  );
}

  const handleToggleRead = async () => {
    if (!repository || !article) return;
    setLoadingRead(true);
    try {
      const nextIsRead = !article.isRead;
      const svc = new ArticleService(repository);
      await svc.markRead(Number(article.id), nextIsRead);
      const nextArticle = {
        ...article,
        isRead: nextIsRead,
        readAt: nextIsRead ? new Date() : undefined,
      } as Article;
      setArticle(nextArticle);
      setArticles((prev) =>
        prev.map((a) => (Number(a.id) === Number(article.id) ? nextArticle : a))
      );
      // No toast on toggle read in card view
    } catch (e) {
      alert("Error al actualizar estado de lectura");
    } finally {
      setLoadingRead(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!repository || !article) return;
    
    // Si ya es favorito, simplemente quitar sin modal
    if (article.isFavorite) {
      setLoadingFavorite(true);
      try {
        const newArticleState = markArticleAsUnfavorite(article);
        const svc = new ArticleService(repository);
        await svc.markFavorite(
          Number(article.id),
          newArticleState.isFavorite ?? false
        );
        const nextArticle = {
          ...article,
          isFavorite: newArticleState.isFavorite,
        } as Article;
        setArticle(nextArticle);
        setArticles((prev) =>
          prev.map((a) => (Number(a.id) === Number(article.id) ? nextArticle : a))
        );
      } catch (e) {
        alert("Error al actualizar estado de favorito");
      } finally {
        setLoadingFavorite(false);
      }
      return;
    }

    // Si no es favorito, marcar como favorito y mostrar modal
    setLoadingFavorite(true);
    try {
      const newArticleState = markArticleAsFavorite(article);
      const svc = new ArticleService(repository);
      await svc.markFavorite(
        Number(article.id),
        newArticleState.isFavorite ?? false
      );
      const nextArticle = {
        ...article,
        isFavorite: newArticleState.isFavorite,
      } as Article;
      setArticle(nextArticle);
      setArticles((prev) =>
        prev.map((a) => (Number(a.id) === Number(article.id) ? nextArticle : a))
      );
      // Mostrar modal de favorito
      setFavoriteModalOpen(true);
    } catch (e) {
      alert("Error al actualizar estado de favorito");
    } finally {
      setLoadingFavorite(false);
    }
  };

  function getFlagEmoji(language?: string) {
    if (language === "English") return "🇬🇧";
    if (language === "Spanish") return "🇪🇸";
    return "";
  }

  return (
    <div className="random-article-container">
      <div className="article-container">
        {loading ? (
          <RandomArticleSkeleton />
        ) : (
          <div
            className={`content-card random-article-card ${
              article ? "card-animated" : ""
            }`}
          >
            {article ? (
              <>
                {/* Actions bar above image/title */}
                <div className="article-actions-container">
                  <ActionButton.Read
                    loading={loadingRead}
                    isRead={article.isRead}
                    onClick={handleToggleRead}
                  />
                  <ActionButton.Favorite
                    loading={loadingFavorite}
                    isFavorite={article.isFavorite ?? false}
                    onClick={handleToggleFavorite}
                  />
                  <ActionButton.Share
                    onClick={() => modalActions.openShare()}
                  />
                  <ActionButton.Delete
                    onClick={() => modalActions.openConfirm(Number(article.id))}
                  />
                </div>

                <div className="article-header">
                  <img
                    src={article.featuredImage || "/placeholder.webp"}
                    alt={
                      article.featuredImage
                        ? `Imagen destacada de: ${article.title}`
                        : ""
                    }
                    className={`article-featured-image ${
                      !article.featuredImage ? "loading" : ""
                    }`}
                    onLoad={(e) => {
                      // Remove loading class when the image is loaded
                      const target = e.target as HTMLImageElement;
                      target.classList.remove("loading");
                    }}
                    onError={(e) => {
                      // If the image fails to load, fallback to custom placeholder
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.webp";
                      target.classList.remove("loading");
                    }}
                  />
                  <h4 className="article-title">
                    {getFlagEmoji(article.language)} {article.title}
                  </h4>
                  {article.authors && article.authors.length > 0 && (
                    <div className="random-article-authors">
                      {article.authors.join(", ")}
                    </div>
                  )}
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
                      🔗 Leer
                    </a>
                  )}
                </div>

                {article.less_15 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 4,
                      fontSize: 15,
                      color: "#888",
                    }}
                  >
                    <span role="img" aria-label="Reloj">
                      ⏱️
                    </span>{" "}
                    menos de 15'
                  </div>
                )}
                {article.topics && article.topics.length > 0 && (
                  <div
                    style={{
                      marginTop: 18,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {article.topics.map((tag, idx) => {
                      // Pastel color palette
                      const colors = [
                        "#E0E7FF", // blue
                        "#FDE68A", // yellow
                        "#FCA5A5", // red
                        "#6EE7B7", // green
                        "#FBCFE8", // pink
                        "#A7F3D0", // turquoise
                        "#F9A8D4", // fuchsia
                        "#FCD34D", // orange
                        "#C7D2FE", // lilac
                        "#FECACA", // coral
                      ];
                      const bgColor = colors[idx % colors.length];
                      return (
                        <span
                          key={tag}
                          className="random-article-tag"
                          style={{ background: bgColor }}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="article-meta-container">
                  {isBefore(article.dateAdded, subYears(new Date(), 1)) && (
                    <p className="article-warning">
                      ⚠️ Este artículo podría estar desactualizado.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <h3>¡Tu biblioteca está vacía!</h3>
                <p>
                  Vincúlate con Telegram y empieza a guardar artículos para
                  descubrir tu próxima gran lectura.
                </p>
                <div
                  className="empty-state-cta"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                    width: "100%",
                    marginTop: 24,
                  }}
                >
                  {user && (
                    <div style={{ width: "100%", maxWidth: "320px" }}>
                      <TelegramLinkButton userId={user.id} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {article && (
        <button
          onClick={handleGetRandomArticle}
          className="modern-button button-primary random-article-button"
        >
          Dame otro 🎲
        </button>
      )}

      {/* toast removed */}
      <ConfirmModal
        show={modalState.confirm}
        onCancel={modalActions.closeConfirm}
        onConfirm={() => {
          if (modalState.articleToDelete !== null) handleDelete(modalState.articleToDelete);
          modalActions.closeConfirm();
        }}
      />
      <ShareModal
        show={modalState.share}
        article={article}
        onClose={modalActions.closeShare}
      />
      <FavoriteModal
        show={modalState.favorite}
        article={article}
        onClose={modalActions.closeFavorite}
      />
    </div>
  );
}


// ActionButton compound variants
const ActionButton = {
  Read: function Read({ loading, isRead, onClick }: { loading: boolean; isRead: boolean; onClick: () => void }) {
    return (
      <button
        className={`app-button action-button success icon-only`}
        onClick={onClick}
        title={loading ? "Marcando..." : isRead ? "Marcar como no leído" : "Marcar como leído"}
        aria-label={loading ? "Marcando..." : isRead ? "Marcar como no leído" : "Marcar como leído"}
      >
        <span className="button-emoji">{loading ? "⏳" : isRead ? "✅" : "📖"}</span>
      </button>
    );
  },
  Favorite: function Favorite({ loading, isFavorite, onClick }: { loading: boolean; isFavorite: boolean; onClick: () => void }) {
    return (
      <button
        className={`app-button action-button favorite icon-only`}
        onClick={onClick}
        title={loading ? "Marcando..." : isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        aria-label={loading ? "Marcando..." : isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        {loading ? (
          <span className="button-emoji">⏳</span>
        ) : isFavorite ? (
          <span className="button-emoji">⭐</span>
        ) : (
          <img src="/star_unfilled.png" alt="" className="button-custom-icon" style={{ width: "1.5em", height: "1.5em" }} />
        )}
      </button>
    );
  },
  Share: function Share({ onClick }: { onClick: () => void }) {
    return (
      <button
        className="app-button action-button share icon-only"
        onClick={onClick}
        title="Abrir opciones para compartir"
        aria-label="Abrir opciones para compartir"
      >
        <span className="button-emoji">📣</span>
      </button>
    );
  },
  Delete: function Delete({ onClick }: { onClick: () => void }) {
    return (
      <button
        className="app-button action-button danger icon-only"
        onClick={onClick}
        title="Borrar artículo"
        aria-label="Borrar artículo"
      >
        <span className="button-emoji">🗑️</span>
      </button>
    );
  },
};


function ConfirmModal({ show, onConfirm, onCancel }: { show: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!show) return null;
  return (
    <Modal show={show} onClose={onCancel}>
      <h2 id="confirm-delete-title-random">¿Borrar artículo?</h2>
      <p id="confirm-delete-desc-random">
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
    </Modal>
  );
}

// Toast removed

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
        <h2>Comparte este artículo</h2>
        <p>Elige una red para compartirlo:</p>
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


function FavoriteModal({ article, show, onClose }: { article: Article | null; show: boolean; onClose: () => void }) {
  if (!show || !article) return null;
  const shareText = encodeURIComponent(`¡He guardado como favorito: ${article.title}!`);
  const url = encodeURIComponent(article.url);
  const blueskyUrl = `https://bsky.app/intent/compose?text=${shareText}%20${url}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  return (
    <Modal show={show} onClose={onClose}>
      <h2 id="favorite-modal-title">¡Genial! ⭐</h2>
      <p>
        Has guardado este artículo como favorito.
        <br />
        ¿Quieres compartirlo en tus redes?
      </p>
      <div className="share-buttons-row">
        <a href={blueskyUrl} target="_blank" rel="noopener noreferrer" className="share-button bluesky">
          <img src="/blusky.svg" alt="" className="share-icon" />
          Bluesky
        </a>
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="share-button linkedin">
          <img src="/linkedin.svg" alt="" className="share-icon" />
          LinkedIn
        </a>
      </div>
    </Modal>
  );
}
