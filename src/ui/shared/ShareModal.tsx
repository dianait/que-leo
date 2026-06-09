import { useCallback } from "react";
import type { Article } from "../../domain/Article";

export type ShareNetwork = "twitter" | "bluesky" | "linkedin";

export type ShareModalProps = {
  open: boolean;
  article: Article | null;
  onClose: () => void;
  title?: string;
  description?: React.ReactNode;
  shareText?: (article: Article) => string;
  networks?: ShareNetwork[];
  titleId?: string;
};

const defaultDescription = (
  <>
    Has marcado este artículo como leído.
    <br />
    ¿Quieres compartirlo en tus redes?
  </>
);

function buildNetworkUrl(
  network: ShareNetwork,
  shareText: string,
  url: string
): string {
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);

  switch (network) {
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    case "bluesky":
      return `https://bsky.app/intent/compose?text=${encodedText}%20${encodedUrl}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  }
}

const networkConfig: Record<
  ShareNetwork,
  { label: string; className: string; icon: string; iconAlt?: string }
> = {
  twitter: { label: "Twitter", className: "twitter", icon: "/x.svg" },
  bluesky: { label: "Bluesky", className: "bluesky", icon: "/blusky.svg" },
  linkedin: { label: "LinkedIn", className: "linkedin", icon: "/linkedin.svg" },
};

export function ShareModal({
  open,
  article,
  onClose,
  title = "¡Genial! 🎉",
  description = defaultDescription,
  shareText = (item) => `¡He leído: ${item.title}!`,
  networks = ["bluesky", "linkedin"],
  titleId = "share-modal-title",
}: ShareModalProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  if (!open || !article) return null;

  const message = shareText(article);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
    >
      <div className="modal-content" style={{ position: "relative" }}>
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
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
        <div className="share-buttons-row">
          {networks.map((network) => {
            const config = networkConfig[network];
            return (
              <a
                key={network}
                href={buildNetworkUrl(network, message, article.url)}
                target="_blank"
                rel="noopener noreferrer"
                className={`share-button ${config.className}`}
              >
                <img src={config.icon} alt="" className="share-icon" />
                {config.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
