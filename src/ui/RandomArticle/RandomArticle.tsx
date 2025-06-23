import { useState, useEffect, useContext } from "react";
import { formatDistanceToNow, isBefore, subYears } from "date-fns";
import { es } from "date-fns/locale";
import "./RandomArticle.css";
import type { Article } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import { ChangeEvent } from "react";
import articlesData from "../../infrastructure/data/articles.json";

export function RandomArticle({
  setArticlesVersion,
}: {
  setArticlesVersion: (v: (v: number) => number) => void;
}) {
  // Estados para manejar el artículo seleccionado y el estado de carga
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState("");

  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  const fetchAndSetRandomArticle = async () => {
    if (!repository || !user) return;
    setLoading(true);
    try {
      let articles = await repository.getArticlesByUser(user.id);
      if (onlyUnread) {
        articles = articles.filter((a) => !a.isRead);
      }
      if (articles.length === 0) {
        setArticle(null);
      } else {
        const randomIndex = Math.floor(Math.random() * articles.length);
        setArticle(articles[randomIndex]);
      }
    } catch (error) {
      console.error("Error al obtener artículo aleatorio:", error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetRandomArticle();
  }, [user, repository, onlyUnread]);

  const handleGetRandomArticle = () => {
    fetchAndSetRandomArticle();
  };

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

  const handleSwitchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOnlyUnread(e.target.checked);
  };

  const handleImportDemoArticles = async () => {
    if (!repository || !user) return;
    setImporting(true);
    setImportSuccess(false);
    setImportError("");
    try {
      // Seleccionar 7 artículos aleatorios
      const shuffled = [...articlesData].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 7);
      // Añadir todos
      const added = await Promise.all(
        selected.map((a) => repository.addArticle(a.title, a.url, user.id))
      );
      // Marcar 3 como leídos (elige 3 aleatorios entre los añadidos)
      const shuffledAdded = [...added].sort(() => 0.5 - Math.random());
      const toMarkRead = shuffledAdded.slice(0, 3);
      for (const art of toMarkRead) {
        await repository.markAsRead(Number(art.id), true);
      }
      // Refrescar el estado local
      await fetchAndSetRandomArticle();
      setImportSuccess(true);
      setArticlesVersion((v) => v + 1);
    } catch (e) {
      setImportError("Error al importar artículos de prueba");
    } finally {
      setImporting(false);
      setTimeout(() => setImportSuccess(false), 2000);
    }
  };

  return (
    <div className="random-article-container">
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          margin: "0 auto 16px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 500,
            color: "#5a6fd8",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={onlyUnread}
            onChange={handleSwitchChange}
            style={{ accentColor: "#5a6fd8", width: 18, height: 18 }}
          />
          Solo no leídos
        </label>
      </div>
      <div className="article-container">
        <div
          className={`content-card random-article-card ${
            article ? "card-animated" : ""
          }`}
        >
          {article ? (
            <>
              {article.isRead && (
                <div className="remember-text">
                  <span>🎪 ¿Quieres dar otra vuelta a este artículo?</span>
                </div>
              )}
              <div className="article-header">
                <h4 className="article-title">{article.title}</h4>
              </div>
              <div className="article-links-container">
                {article.url === "#" ? (
                  <>
                    <div className="url-not-available">
                      🚫 No URL disponible.
                    </div>
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
                  </>
                ) : (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-link"
                    onClick={(e) => handleArticleClick(article.url, e)}
                  >
                    🔗 Leer artículo
                  </a>
                )}
              </div>
              <div className="article-meta-container">
                <p className="article-date">
                  {article.isRead && article.readAt ? (
                    <>
                      <span className="read-tag-inline">📖 Leído</span>
                      {` ${formatDistanceToNow(article.readAt, {
                        addSuffix: true,
                        locale: es,
                      })}`}
                    </>
                  ) : (
                    `Guardado ${formatDistanceToNow(article.dateAdded, {
                      addSuffix: true,
                      locale: es,
                    })}`
                  )}
                </p>
                {isBefore(article.dateAdded, subYears(new Date(), 1)) && (
                  <p className="article-warning">
                    ⚠️ Este artículo podría estar desactualizado.
                  </p>
                )}
              </div>
            </>
          ) : loading ? (
            <div className="loading-state">🔄 Buscando en tus artículos...</div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>¡Tu biblioteca está vacía!</h3>
              <p>No tienes artículos guardados todavía.</p>
              <div
                className="empty-state-cta"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                }}
              >
                <span>
                  Haz clic en el botón <strong>+ Nuevo</strong> del sidebar para
                  añadir tu primer artículo y empezar a leer
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    margin: "12px 0",
                  }}
                >
                  <hr
                    style={{
                      flex: 1,
                      border: 0,
                      borderTop: "1px solid #e0e0e0",
                      margin: 0,
                    }}
                  />
                  <span
                    style={{ margin: "0 12px", color: "#888", fontWeight: 600 }}
                  >
                    o
                  </span>
                  <hr
                    style={{
                      flex: 1,
                      border: 0,
                      borderTop: "1px solid #e0e0e0",
                      margin: 0,
                    }}
                  />
                </div>
                <button
                  className="app-button"
                  onClick={handleImportDemoArticles}
                  disabled={importing}
                  style={{ marginTop: 4 }}
                >
                  {importing ? "Importando..." : "Importar artículos de prueba"}
                </button>
                {importSuccess && (
                  <div className="success-message" style={{ marginTop: 8 }}>
                    ¡Artículos importados!
                  </div>
                )}
                {importError && (
                  <div className="error-message" style={{ marginTop: 8 }}>
                    {importError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleGetRandomArticle}
        disabled={loading || !article}
        className="modern-button button-primary random-article-button"
      >
        {loading
          ? "🔄 Buscando..."
          : !article
          ? "No hay artículos"
          : "Dame otro 🎲"}
      </button>
    </div>
  );
}
