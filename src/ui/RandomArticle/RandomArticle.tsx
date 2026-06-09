import React, {
  useState,
  useContext,
  useCallback,
  createContext,
} from "react";
import { isBefore, subYears } from "date-fns";
import "./RandomArticle.css";
import type { Article } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { TelegramLinkButton } from "../TelegramButton/TelegramLinkButton";
import { RandomArticleSkeleton } from "../AppSkeleton/AppSkeleton";
import { useShare } from "./useShare";
import { useRandomArticle } from "./useRandomArticle";

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

const ModalContext = createContext<
  { state: ModalState; actions: ModalActions } | undefined
>(undefined);

function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>({
    confirm: false,
    share: false,
    favorite: false,
    articleToDelete: null,
  });
  const actions: ModalActions = {
    openConfirm: (articleId) =>
      setState((s) => ({
        ...s,
        confirm: true,
        articleToDelete: articleId,
      })),
    closeConfirm: () =>
      setState((s) => ({ ...s, confirm: false, articleToDelete: null })),
    openShare: () => setState((s) => ({ ...s, share: true })),
    closeShare: () => setState((s) => ({ ...s, share: false })),
    openFavorite: () => setState((s) => ({ ...s, favorite: true })),
    closeFavorite: () => setState((s) => ({ ...s, favorite: false })),
  };
  return (
    <ModalContext.Provider value={{ state, actions }}>
      {children}
    </ModalContext.Provider>
  );
}

function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals must be used within ModalProvider");
  return ctx;
}

export function RandomArticle({
  articlesVersion,
}: {
  articlesVersion: number;
}) {
  return (
    <ModalProvider>
      <RandomArticleInner articlesVersion={articlesVersion} />
    </ModalProvider>
  );
}

function RandomArticleInner({
  articlesVersion,
}: {
  articlesVersion: number;
}) {
  const { state: modalState, actions: modalActions } = useModals();
  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  const {
    article,
    loading,
    loadingRead,
    loadingFavorite,
    pickRandom,
    toggleRead,
    toggleFavorite,
    deleteArticle,
  } = useRandomArticle(repository, user?.id, articlesVersion);

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
    modalActions.closeConfirm();
    await deleteArticle(articleId);
  };

  const handleToggleRead = async () => {
    await toggleRead();
  };

  const handleToggleFavorite = async () => {
    const markedAsFavorite = await toggleFavorite();
    if (markedAsFavorite) {
      modalActions.openFavorite();
    }
  };

  function getFlagEmoji(language?: string) {
    if (language === "English") return "🇬🇧";
    if (language === "Spanish") return "🇪🇸";
    return "";
  }

  function getAiRatingTier(rating: number): "low" | "medium" | "high" {
    if (rating <= 4) return "low";
    if (rating <= 7) return "medium";
    return "high";
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
                  <ActionButton.NativeShare
                    url={article.url}
                    title={article.title}
                  />
                  <ActionButton.Share
                    onClick={() => modalActions.openShare()}
                  />
                  <ActionButton.Delete
                    onClick={() =>
                      modalActions.openConfirm(Number(article.id))
                    }
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
                      const target = e.target as HTMLImageElement;
                      target.classList.remove("loading");
                    }}
                    onError={(e) => {
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
                  {article.aiRating != null && (
                    <div
                      className={`article-ai-rating rating-${getAiRatingTier(
                        article.aiRating
                      )}`}
                      title={article.aiRatingReason ?? undefined}
                    >
                      <span className="article-ai-rating-label">
                        Valoración:{" "}
                      </span>
                      <span className="article-ai-rating-score">
                        {article.aiRating}/10
                      </span>
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
                      const colors = [
                        "#E0E7FF",
                        "#FDE68A",
                        "#FCA5A5",
                        "#6EE7B7",
                        "#FBCFE8",
                        "#A7F3D0",
                        "#F9A8D4",
                        "#FCD34D",
                        "#C7D2FE",
                        "#FECACA",
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
          onClick={pickRandom}
          className="modern-button button-primary random-article-button"
        >
          Dame otro 🎲
        </button>
      )}

      <ConfirmModal
        show={modalState.confirm}
        onCancel={modalActions.closeConfirm}
        onConfirm={() => {
          if (modalState.articleToDelete !== null) {
            handleDelete(modalState.articleToDelete);
          }
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

const ActionButton = {
  Read: function Read({
    loading,
    isRead,
    onClick,
  }: {
    loading: boolean;
    isRead: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        className="app-button action-button success icon-only"
        onClick={onClick}
        title={
          loading
            ? "Marcando..."
            : isRead
              ? "Marcar como no leído"
              : "Marcar como leído"
        }
        aria-label={
          loading
            ? "Marcando..."
            : isRead
              ? "Marcar como no leído"
              : "Marcar como leído"
        }
      >
        <span className="button-emoji">
          {loading ? "⏳" : isRead ? "✅" : "📖"}
        </span>
      </button>
    );
  },
  Favorite: function Favorite({
    loading,
    isFavorite,
    onClick,
  }: {
    loading: boolean;
    isFavorite: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        className="app-button action-button favorite icon-only"
        onClick={onClick}
        title={
          loading
            ? "Marcando..."
            : isFavorite
              ? "Quitar de favoritos"
              : "Añadir a favoritos"
        }
        aria-label={
          loading
            ? "Marcando..."
            : isFavorite
              ? "Quitar de favoritos"
              : "Añadir a favoritos"
        }
      >
        {loading ? (
          <span className="button-emoji">⏳</span>
        ) : isFavorite ? (
          <span className="button-emoji">⭐</span>
        ) : (
          <img
            src="/star_unfilled.png"
            alt=""
            className="button-custom-icon"
            style={{ width: "1.5em", height: "1.5em" }}
          />
        )}
      </button>
    );
  },
  NativeShare: function NativeShare({
    url,
    title,
  }: {
    url: string;
    title: string;
  }) {
    const share = useShare();
    return (
      <button
        className="app-button action-button share icon-only"
        onClick={() => share({ url, title })}
        title="Compartir"
        aria-label="Compartir"
      >
        <span className="button-emoji">📤</span>
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

function Modal({
  children,
  onClose,
  show,
}: {
  children: React.ReactNode;
  onClose: () => void;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <Modal.Overlay onClose={onClose}>
      <Modal.Content>{children}</Modal.Content>
    </Modal.Overlay>
  );
}

Modal.Overlay = function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

Modal.Content = function ModalContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="modal-content" style={{ position: "relative" }}>
      {children}
    </div>
  );
};

function ConfirmModal({
  show,
  onConfirm,
  onCancel,
}: {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
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

function ShareModal({
  article,
  show,
  onClose,
}: {
  article: Article | null;
  show: boolean;
  onClose: () => void;
}) {
  if (!show || !article) return null;
  const shareText = `¡He leído: ${article.title}!`;
  const url = article.url;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  return (
    <Modal show={show} onClose={onClose}>
      <button
        className="modal-close"
        onClick={onClose}
        title="Cerrar"
        aria-label="Cerrar"
      >
        <span style={{ fontSize: "1.5em", fontWeight: 700, color: "#888" }}>
          ×
        </span>
      </button>
      <h2 id="share-modal-title-random">¡Genial! 🎉</h2>
      <p>
        Has marcado este artículo como leído.
        <br />
        ¿Quieres compartirlo en tus redes?
      </p>
      <div className="share-buttons-row">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="share-button twitter"
        >
          <img src="/x.svg" alt="" className="share-icon" />
          Twitter
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="share-button linkedin"
        >
          <img src="/linkedin.svg" alt="" className="share-icon" />
          LinkedIn
        </a>
      </div>
    </Modal>
  );
}

function FavoriteModal({
  article,
  show,
  onClose,
}: {
  article: Article | null;
  show: boolean;
  onClose: () => void;
}) {
  if (!show || !article) return null;
  const shareText = encodeURIComponent(
    `¡He guardado como favorito: ${article.title}!`
  );
  const url = encodeURIComponent(article.url);
  const blueskyUrl = `https://bsky.app/intent/compose?text=${shareText}%20${url}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  return (
    <Modal show={show} onClose={onClose}>
      <button
        className="modal-close"
        onClick={onClose}
        title="Cerrar"
        aria-label="Cerrar"
      >
        <span style={{ fontSize: "1.5em", fontWeight: 700, color: "#888" }}>
          ×
        </span>
      </button>
      <h2 id="favorite-modal-title">¡Genial! ⭐</h2>
      <p>
        Has guardado este artículo como favorito.
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
          <img src="/blusky.svg" alt="" className="share-icon" />
          Bluesky
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="share-button linkedin"
        >
          <img src="/linkedin.svg" alt="" className="share-icon" />
          LinkedIn
        </a>
      </div>
    </Modal>
  );
}
