import React, { useState, useContext } from "react";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { AddArticle as AddArticleUseCase } from "../../application/AddArticle";
import "./AddArticle.css";

export const AddArticle: React.FC = () => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

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
      setIsFormVisible(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    setError("");
    setSuccess("");
  };

  return (
    <div className="add-article-container">
      <button
        onClick={toggleForm}
        className="app-button new-button"
        title="Añadir artículo"
      >
        {isFormVisible ? "×" : "+ New"}
      </button>

      {isFormVisible && (
        <div className="add-article-form-container">
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

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Añadiendo..." : "Añadir artículo"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
