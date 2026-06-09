import { isBefore, subYears } from "date-fns";
import type { Article } from "../../domain/Article";
import { getAiRatingTier } from "../../domain/Article";
import type { User } from "@supabase/supabase-js";
import { TelegramLinkButton } from "../TelegramButton/TelegramLinkButton";
import { ActionButton } from "./RandomArticleActionButtons";

function getFlagEmoji(language?: string) {
  if (language === "English") return "🇬🇧";
  if (language === "Spanish") return "🇪🇸";
  return "";
}

 = [
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

type RandomArticleCardProps = {
  article: Article | null;
  user: User | null;
  loadingRead: boolean;
  loadingFavorite: boolean;
  onToggleRead: () => void;
  onToggleFavorite: () => void;
  onOpenShare: () => void;
  onOpenConfirm: (articleId: number) => void;
};

export function RandomArticleCard({
  article,
  user,
  loadingRead,
  loadingFavorite,
  onToggleRead,
  onToggleFavorite,
  onOpenShare,
  onOpenConfirm,
}: RandomArticleCardProps) {
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

  if (!article) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📚</div>
        <h3>¡Tu biblioteca está vacía!</h3>
        <p>
          Vincúlate con Telegram y empieza a guardar artículos para descubrir
          tu próxima gran lectura.
        </p>
        <div className="empty-state-cta">
          {user && (
            <div className="empty-state-telegram">
              <TelegramLinkButton userId={user.id} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="article-actions-container">
        <ActionButton.Read
          loading={loadingRead}
          isRead={article.isRead}
          onClick={onToggleRead}
        />
        <ActionButton.Favorite
          loading={loadingFavorite}
          isFavorite={article.isFavorite ?? false}
          onClick={onToggleFavorite}
        />
        <ActionButton.NativeShare url={article.url} title={article.title} />
        <ActionButton.Share onClick={onOpenShare} />
        <ActionButton.Delete
          onClick={() => onOpenConfirm(Number(article.id))}
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
            <span className="article-ai-rating-label">Valoración: </span>
            <span className="article-ai-rating-score">
              {article.aiRating}/10
            </span>
          </div>
        )}
      </div>
      <div className="article-links-container">
        {article.url === "#" ? (
          <>
            <div className="url-not-available">🚫 No URL disponible.</div>
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
        <div className="random-article-reading-time">
          <span role="img" aria-label="Reloj">
            ⏱️
          </span>{" "}
          menos de 15'
        </div>
      )}
      {article.topics && article.topics.length > 0 && (
        <div className="random-article-topics">
          {article.topics.map((tag, idx) => (
            <span
              key={tag}
              className="random-article-tag"
              style={{ background: TOPIC_TAG_COLORS[idx % TOPIC_TAG_COLORS.length] }}
            >
              {tag}
            </span>
          ))}
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
  );
}
