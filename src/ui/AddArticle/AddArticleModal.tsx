import React, { use, useRef, useEffect, useCallback } from "react";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { useAddArticleForm } from "./useAddArticleForm";
import "./AddArticle.css";

function Modal({
  open,
  onClose,
  children,
  labelId,
  ref,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelId?: string;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  if (!open) return null;
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      onKeyDown={handleKeyDown}
    >
      <div className="modal-content" ref={ref}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export const AddArticle: React.FC<{
  setArticlesVersion?: (v: (v: number) => number) => void;
}> = ({ setArticlesVersion }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const repository = use(ArticleRepositoryContext);
  const { user } = useAuth();

  const { state, openModal, closeModal, setTitle, setUrl, handleSubmit } =
    useAddArticleForm(repository, user?.id, setArticlesVersion);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    }

    if (state.isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [state.isModalOpen, closeModal]);

  return (
    <div className="add-article-container">
      <button
        className="app-button new-button"
        onClick={openModal}
        title="Añadir artículo"
      >
        + Nuevo
      </button>
      <Modal
        open={state.isModalOpen}
        onClose={closeModal}
        ref={modalRef}
        labelId="add-article-title"
      >
        <form onSubmit={handleSubmit} className="add-article-form">
          <h3 id="add-article-title">Añadir nuevo artículo</h3>
          {state.error && (
            <div className="error-message" role="alert">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="success-message" role="status">
              {state.success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="url">URL:</label>
            <input
              type="url"
              id="url"
              value={state.url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://ejemplo.com/articulo"
              disabled={state.loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Título (opcional):</label>
            <input
              type="text"
              id="title"
              value={state.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Se extraerá automáticamente si se deja vacío"
              disabled={state.loading}
            />
          </div>

          <button
            type="submit"
            className="modern-button button-primary"
            disabled={state.loading}
          >
            {state.loading ? "Añadiendo..." : "Añadir artículo 📚"}
          </button>
        </form>
      </Modal>
    </div>
  );
};
