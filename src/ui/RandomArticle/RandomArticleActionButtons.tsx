import { useShare } from "./useShare";

export const ActionButton = {
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
            className="button-custom-icon action-button-star-icon"
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
