import React, { useEffect } from "react";
import { TelegramLinkButton } from "../TelegramButton/TelegramLinkButton";
import "./AvatarModal.css";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userId: string;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  userId,
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="avatar-modal-overlay"
      onClick={onClose}
      data-testid="modal-overlay"
    >
      <div
        className="avatar-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-modal-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        data-testid="modal-content"
      >
        <div className="avatar-modal-header">
          <h3 id="avatar-modal-title">Opciones de usuario</h3>
          <button
            className="avatar-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="avatar-modal-content">
          <div className="avatar-modal-option">
            <a
              href="/articulos"
              className="avatar-modal-link-button"
              onClick={onClose}
              aria-label="Ir a Mis artículos"
            >
              📚 Mis artículos
            </a>
          </div>
          <div className="avatar-modal-option">
            <TelegramLinkButton userId={userId} />
          </div>
          <div className="avatar-modal-option">
            <button
              onClick={onLogout}
              className="avatar-modal-logout-button"
              title="Cerrar sesión"
            >
              🚪 Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
