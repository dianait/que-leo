import { useState, useEffect, useContext } from "react";
import { isBefore, subYears } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./RandomArticle.css";
import type { Article } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { GetArticlesByUser } from "../../application/GetArticlesByUser";
import { DeleteArticle } from "../../application/DeleteArticle";
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
  const [toast, setToast] = useState(false);

  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!repository || !user) return;
    const fetchArticles = async () => {
      setLoading(true);
      const useCase = new GetArticlesByUser(repository);
      const result = await useCase.execute(user.id);
      setArticles(result);
      setLoading(false);
    };
    fetchArticles();
  }, [user, repository, articlesVersion]);

  useEffect(() => {
    // Solo genera un artículo si no hay uno seleccionado y hay artículos disponibles
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

  const handleTitleClick = () => {
    if (article) {
      // Navegar a la lista de artículos con el título como término de búsqueda
      navigate(`/articulos?search=${encodeURIComponent(article.title)}`);
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
    console.log("Intentando borrar artículo", { articleId, userId: user.id });
    try {
      const useCase = new DeleteArticle(repository);
      await useCase.execute(Number(articleId), user.id);
      console.log("Artículo borrado correctamente", articleId);

      // Actualizar la lista de artículos localmente
      setArticles((prev) =>
        prev.filter((a) => Number(a.id) !== Number(articleId))
      );

      // Si el artículo eliminado era el que se mostraba, obtener uno nuevo
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

      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (error) {
      console.error("Error al borrar artículo:", error);
    }
  };

  const handleShareToLinkedIn = (article: Article) => {
    const url = encodeURIComponent(article.url);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareToBluesky = (article: Article) => {
    const shareText = encodeURIComponent(`¡He leído: ${article.title}!`);
    const url = encodeURIComponent(article.url);
    const blueskyUrl = `https://bsky.app/intent/compose?text=${shareText}%20${url}`;
    window.open(blueskyUrl, "_blank", "noopener,noreferrer");
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
                {article.isRead && (
                  <div className="remember-text">
                    <span>🎪 ¿Quieres dar otra vuelta a este artículo?</span>
                  </div>
                )}
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
                      // Remover clase de loading cuando la imagen carga
                      const target = e.target as HTMLImageElement;
                      target.classList.remove("loading");
                    }}
                    onError={(e) => {
                      // Si la imagen falla al cargar, mostrar placeholder personalizado
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.webp";
                      target.classList.remove("loading");
                    }}
                  />
                  <h4 
                    className="article-title clickable-title"
                    onClick={handleTitleClick}
                    title="Hacer clic para buscar este artículo en la lista"
                  >
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
                      🔗 Leer artículo
                    </a>
                  )}
                </div>
                <div className="article-actions-container">
                  <ActionButton
                    emoji="💼"
                    text="LinkedIn"
                    onClick={() => handleShareToLinkedIn(article)}
                    title="Compartir en LinkedIn"
                    type="linkedin"
                  />
                  <ActionButton
                    emoji="🦋"
                    text="Bluesky"
                    onClick={() => handleShareToBluesky(article)}
                    title="Compartir en Bluesky"
                    type="bluesky"
                  />
                  <ActionButton
                    emoji="🗑️"
                    text="Eliminar"
                    onClick={() => {
                      setArticleToDelete(Number(article.id));
                      setModalOpen(true);
                    }}
                    title="Borrar artículo"
                    type="danger"
                  />
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
                      // Paleta de colores pastel
                      const colors = [
                        "#E0E7FF", // azul
                        "#FDE68A", // amarillo
                        "#FCA5A5", // rojo
                        "#6EE7B7", // verde
                        "#FBCFE8", // rosa
                        "#A7F3D0", // turquesa
                        "#F9A8D4", // fucsia
                        "#FCD34D", // naranja
                        "#C7D2FE", // lila
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

      <Toast message="Artículo borrado correctamente" show={toast} />
      <ConfirmModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          if (articleToDelete !== null) handleDelete(articleToDelete);
        }}
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
}: {
  emoji: string;
  text: string;
  onClick: () => void;
  title: string;
  type: "linkedin" | "bluesky" | "danger";
}) {
  return (
    <button
      className={`app-button action-button ${type}`}
      onClick={onClick}
      title={title}
    >
      <span className="button-emoji">{emoji}</span>
      <span className="button-text">{text}</span>
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

function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;
  return <div className="toast-notification">{message}</div>;
}
