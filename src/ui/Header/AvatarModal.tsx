import React from "react";
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

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-modal-header">
          <h3>Opciones de usuario</h3>
          <button className="avatar-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="avatar-modal-content">
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
