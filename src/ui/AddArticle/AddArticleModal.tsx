import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  forwardRef,
} from "react";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { AddArticle as AddArticleUseCase } from "../../application/AddArticle";
import "./AddArticle.css";

// Modal simple
const Modal = forwardRef<
  HTMLDivElement,
  {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }
>(({ open, onClose, children }, ref) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={ref}>
        <button className="modal-close" onClick={onClose} title="Cerrar">
          ×
        </button>
        {children}
      </div>
    </div>
  );
});

Modal.displayName = "Modal";

export const AddArticle: React.FC = () => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !repository) return;

    setLoading(true);
    setError("");
    setSuccess("");

    let finalUrl = url;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      const useCase = new AddArticleUseCase(repository);
      await useCase.execute(title, finalUrl, user.id);
      setSuccess("¡Artículo añadido con éxito!");
      setTitle("");
      setUrl("");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess("");
      }, 1000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error desconocido al añadir artículo");
      }
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
    setSuccess("");
  };

  return (
    <div className="add-article-container">
      <button
        className="app-button new-button"
        onClick={openModal}
        title="Añadir artículo"
      >
        + Nuevo
      </button>
      <Modal open={isModalOpen} onClose={closeModal} ref={modalRef}>
        <form onSubmit={handleSubmit} className="add-article-form">
          <h3>Añadir nuevo artículo</h3>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <div className="form-group">
            <label htmlFor="title">Título:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Título del artículo"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="url">URL:</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://ejemplo.com/articulo"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="modern-button button-primary"
            disabled={loading}
          >
            {loading ? "Añadiendo..." : "Añadir artículo 📚"}
          </button>
        </form>
      </Modal>
    </div>
  );
};
