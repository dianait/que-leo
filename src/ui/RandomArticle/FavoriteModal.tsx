import { useCallback } from "react";
import type { Article } from "../../domain/Article";

function ModalOverlay({
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
}

function ModalContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="modal-content modal-content-relative">{children}</div>
  );
}

export function FavoriteModal({
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
    <ModalOverlay onClose={onClose}>
      <ModalContent>
        <button
          className="modal-close"
          onClick={onClose}
          title="Cerrar"
          aria-label="Cerrar"
        >
          <span className="modal-close-icon">×</span>
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
      </ModalContent>
    </ModalOverlay>
  );
}
