import { useState, useEffect, useContext } from "react";
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

export function RandomArticle({
  articlesVersion,
}: {
  articlesVersion: number;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [favoriteModalOpen, setFavoriteModalOpen] = useState(false);
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

  // Sharing is handled via ShareModal

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
                  <ActionButton
                    emoji={loadingRead ? "⏳" : article.isRead ? "✅" : "📖"}
                    text=""
                    onClick={handleToggleRead}
                    title={
                      loadingRead
                        ? "Marcando..."
                        : article.isRead
                        ? "Marcar como no leído"
                        : "Marcar como leído"
                    }
                    type={article.isRead ? "success" : undefined}
                    iconOnly={true}
                  />
                  <ActionButton
                    emoji={loadingFavorite ? "⏳" : article.isFavorite ? "⭐" : ""}
                    text=""
                    onClick={handleToggleFavorite}
                    title={
                      loadingFavorite
                        ? "Marcando..."
                        : article.isFavorite
                        ? "Quitar de favoritos"
                        : "Añadir a favoritos"
                    }
                    type={article.isFavorite ? "favorite" : undefined}
                    iconOnly={true}
                    customIcon={
                      !loadingFavorite && !article.isFavorite
                        ? "/star_unfilled.png"
                        : undefined
                    }
                  />
                  <ActionButton
                    emoji="📣"
                    text=""
                    onClick={() => setShareOpen(true)}
                    title="Abrir opciones para compartir"
                    type="share"
                    iconOnly={true}
                  />
                  <ActionButton
                    emoji="🗑️"
                    text=""
                    onClick={() => {
                      setArticleToDelete(Number(article.id));
                      setModalOpen(true);
                    }}
                    title="Borrar artículo"
                    type="danger"
                    iconOnly={true}
                  />
                </div>

                <div className="article-header">
                  <img
                    src={article.featuredImage || "/placeholder.webp"}
                    alt={
                      article.featuredImage
                        ? "Featured Image"
                        : "Imagen por defecto"
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
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          if (articleToDelete !== null) handleDelete(articleToDelete);
        }}
      />
      <ShareModal
        open={shareOpen}
        article={article}
        onClose={() => setShareOpen(false)}
      />
      <FavoriteModal
        open={favoriteModalOpen}
        article={article}
        onClose={() => setFavoriteModalOpen(false)}
      />
    </div>
  );
}

function ActionButton({
  emoji,
  text,
  onClick,
  title,
  type,
  iconOnly = false,
  customIcon,
}: {
  emoji: string;
  text: string;
  onClick: () => void;
  title: string;
  type?: "linkedin" | "bluesky" | "danger" | "share" | "success" | "favorite";
  iconOnly?: boolean;
  customIcon?: string;
}) {
  return (
    <button
      className={`app-button action-button ${type ? type : ""} ${
        iconOnly ? "icon-only" : ""
      }`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {customIcon ? (
        <img
          src={customIcon}
          alt=""
          className="button-custom-icon"
          style={{ width: "1.5em", height: "1.5em" }}
        />
      ) : (
        <span className="button-emoji">{emoji}</span>
      )}
      {!iconOnly && <span className="button-text">{text}</span>}
    </button>
  );
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

function FavoriteModal({
  open,
  article,
  onClose,
}: {
  open: boolean;
  article: Article | null;
  onClose: () => void;
}) {
  if (!open || !article) return null;
  const shareText = encodeURIComponent(`¡He guardado como favorito: ${article.title}!`);
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
        <h2>¡Genial! ⭐</h2>
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
