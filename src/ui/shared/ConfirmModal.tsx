import { useCallback } from "react";
import "./ConfirmModal.css";

export type ConfirmModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  titleId?: string;
  descId?: string;
};

export function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  title = "¿Borrar artículo?",
  titleId = "confirm-delete-title",
  descId = "confirm-delete-desc",
}: ConfirmModalProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel]
  );

  if (!open) return null;

  return (
    <div
      className="modal-overlay confirm-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onKeyDown={handleKeyDown}
    >
      <div className="modal-content">
        <h2 id={titleId}>{title}</h2>
        <p id={descId}>
          ¿Seguro que quieres borrar este artículo? <br />
          <strong>Esta acción no se puede deshacer.</strong>
        </p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn confirm-modal-cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="confirm-modal-btn confirm-modal-delete"
            onClick={onConfirm}
          >
            Borrar definitivamente
          </button>
        </div>
      </div>
    </div>
  );
}
