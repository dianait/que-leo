import { useState, useEffect, useContext } from "react";
import { isBefore, subYears } from "date-fns";
import "./RandomArticle.css";
import type { Article } from "../../domain/Article";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";
import articlesData from "../../infrastructure/data/eferro.json";
import { GetArticlesByUser } from "../../application/GetArticlesByUser";
import { TelegramLinkButton } from "../TelegramLinkButton";

export function RandomArticle({
  articlesVersion,
  setArticlesVersion,
}: {
  articlesVersion: number;
  setArticlesVersion: (v: (v: number) => number) => void;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState("");

  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  useEffect(() => {
    if (!repository || !user) return;
    const fetchArticles = async () => {
      const useCase = new GetArticlesByUser(repository);
      const result = await useCase.execute(user.id);
      setArticles(result);
    };
    fetchArticles();
  }, [user, repository, articlesVersion]);

  useEffect(() => {
    // Siempre filtra solo no leídos
    let filtered = articles.filter((a) => !a.isRead);
    if (filtered.length === 0) {
      setArticle(null);
    } else {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      setArticle(filtered[randomIndex]);
    }
  }, [articles]);

  const handleGetRandomArticle = () => {
    let filtered = articles.filter((a) => !a.isRead);
    if (filtered.length === 0) {
      setArticle(null);
    } else {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      setArticle(filtered[randomIndex]);
    }
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
        selected.map((a) =>
          repository.addArticle(
            a.Name ?? "",
            a.Url ?? "",
            user.id,
            a.Language ?? null,
            a.Speakers_Names ?? null,
            a.Topics_Names ?? null,
            a["Less 15"] !== undefined ? Boolean(a["Less 15"]) : null
          )
        )
      );
      // Marcar 3 como leídos (elige 3 aleatorios entre los añadidos)
      const shuffledAdded = [...added].sort(() => 0.5 - Math.random());
      const toMarkRead = shuffledAdded.slice(0, 3);
      for (const art of toMarkRead) {
        await repository.markAsRead(Number(art.id), true);
      }
      // Refrescar el estado local
      await handleGetRandomArticle();
      setImportSuccess(true);
      setTimeout(() => {
        setArticlesVersion((v) => v + 1);
      }, 400);
    } catch (e) {
      setImportError("Error al importar artículos de prueba");
    } finally {
      setImporting(false);
      setTimeout(() => setImportSuccess(false), 2000);
    }
  };

  function getFlagEmoji(language?: string) {
    if (language === "English") return "🇬🇧";
    if (language === "Spanish") return "🇪🇸";
    return "";
  }

  return (
    <div className="random-article-container">
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
                <h4 className="article-title">
                  {getFlagEmoji(article.language)} {article.title}
                </h4>
                {article.authors && article.authors.length > 0 && (
                  <div className="random-article-authors">
                    {article.authors.join(", ")}
                  </div>
                )}
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
              {article.less_15 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 4,
                    fontSize: 15,
                    color: "#888",
                  }}
                >
                  <span role="img" aria-label="Reloj">
                    ⏱️
                  </span>{" "}
                  menos de 15'
                </div>
              )}
              {article.topics && article.topics.length > 0 && (
                <div
                  style={{
                    marginTop: 18,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {article.topics.map((tag, idx) => {
                    // Paleta de colores pastel
                    const colors = [
                      "#E0E7FF", // azul
                      "#FDE68A", // amarillo
                      "#FCA5A5", // rojo
                      "#6EE7B7", // verde
                      "#FBCFE8", // rosa
                      "#A7F3D0", // turquesa
                      "#F9A8D4", // fucsia
                      "#FCD34D", // naranja
                      "#C7D2FE", // lila
                      "#FECACA", // coral
                    ];
                    const bgColor = colors[idx % colors.length];
                    return (
                      <span
                        key={tag}
                        className="random-article-tag"
                        style={{ background: bgColor }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="article-meta-container">
                {isBefore(article.dateAdded, subYears(new Date(), 1)) && (
                  <p className="article-warning">
                    ⚠️ Este artículo podría estar desactualizado.
                  </p>
                )}
              </div>
            </>
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
                  Haz clic en el botón <strong>+ Nuevo</strong> para añadir tu
                  primer artículo y empezar a leer
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    margin: "12px 0",
                  }}
                >
                  <hr className="random-article-divider" />
                  <span className="random-article-or">o</span>
                  <hr className="random-article-divider" />
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
                  <div className="random-article-success-message success-message">
                    ¡Artículos importados!
                  </div>
                )}
                {importError && (
                  <div className="random-article-error-message error-message">
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
        disabled={!article}
        className="modern-button button-primary random-article-button"
      >
        {article ? "Dame otro 🎲" : "No hay artículos"}
      </button>
      {user && (
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            margin: "16px auto 0 auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TelegramLinkButton userId={user.id} />
        </div>
      )}
    </div>
  );
}
