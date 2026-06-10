import { isBefore, subYears } from "date-fns";
import { useState, useEffect, useRef } from "react";
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

const TOPIC_TAG_COLORS = [
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

function ArticleFeaturedImage({ article }: { article: Article }) {
  return (
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
  );
}

function ArticleTitleBlock({ article }: { article: Article }) {
  return (
    <>
      <h4 className="article-title">
        {getFlagEmoji(article.language)} {article.title}
      </h4>
      {article.authors && article.authors.length > 0 && (
        <div className="random-article-authors">
          {article.authors.join(", ")}
        </div>
      )}
    </>
  );
}

function ArticleAiInsight({ article }: { article: Article }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  const hasRating = article.aiRating != null;
  const tier = hasRating ? getAiRatingTier(article.aiRating!) : null;

  return (
    <div className="article-ai-insight-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`article-ai-rating ${tier ? `rating-${tier}` : "rating-none"} has-popover`}
        aria-label={
          hasRating
            ? `Nota IA: ${article.aiRating} de 10. Toca para ver por qué`
            : "Nota IA. Toca para saber cómo activarla"
        }
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="article-ai-rating-icon" aria-hidden="true">✨</span>
        {hasRating && (
          <span className="article-ai-rating-score">{article.aiRating}/10</span>
        )}
      </button>

      {open && (
        <div className="article-ai-popover" role="tooltip">
          {hasRating && article.aiRatingReason ? (
            <p className="article-ai-popover-reason">{article.aiRatingReason}</p>
          ) : (
            <p className="article-ai-popover-reason">
              En Telegram pon <strong>/gustos</strong> y podrás tener una valoración personalizada para cada artículo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

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

  const hasValidUrl = article.url !== "#";

  return (
    <>
      <div className="article-actions-container">
        <ArticleAiInsight article={article} />
        <div className="article-action-buttons">
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
      </div>

      <div className="article-header">
        {hasValidUrl ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="article-main-link"
            aria-label={`Leer: ${article.title}`}
            onClick={(e) => handleArticleClick(article.url, e)}
          >
            <ArticleFeaturedImage article={article} />
            <ArticleTitleBlock article={article} />
          </a>
        ) : (
          <>
            <ArticleFeaturedImage article={article} />
            <ArticleTitleBlock article={article} />
            <div className="article-links-container">
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
            </div>
          </>
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
