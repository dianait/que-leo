import { useState, useEffect } from "react";
import { GetRandomArticle } from "../application/GetRandomArticle";
import { JsonArticleRepository } from "../infrastructure/repositories/JSONArticleRepository";
import { Article } from "../domain/Article";

export function RandomArticle() {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRandom = async () => {
      setLoading(true);
      try {
        const repository = new JsonArticleRepository();
        const useCase = new GetRandomArticle(repository);
        const randomArticle = await useCase.execute();
        setArticle(randomArticle);
      } catch (error) {
        console.error("Error al obtener artículo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRandom();
  }, []);

  const handleGetRandomArticle = async () => {
    setLoading(true);
    try {
      const repository = new JsonArticleRepository();
      const useCase = new GetRandomArticle(repository);
      const randomArticle = await useCase.execute();
      setArticle(randomArticle);
    } catch (error) {
      console.error("Error al obtener artículo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: 260,
      }}
    >
      <div
        style={{
          minHeight: 180,
          width: "100%",
          maxWidth: 520,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="content-card random-article-card"
          style={{
            width: 520, // Fijo
            maxWidth: 520,
            minWidth: 320,
            minHeight: 180,
            margin: "0 auto",
            padding: "2rem 2.5rem 1.5rem 2.5rem",
            border: "1.5px solid #e3e8f0",
            borderRadius: "18px",
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.10)",
            background: "rgba(255,255,255,0.98)",
            transition: "box-shadow 0.2s, border 0.2s",
            animation: article ? "fadeInUp 0.5s ease-out" : undefined,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {article ? (
            <>
              <h3
                style={{
                  color: "#667eea",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  marginBottom: 8,
                }}
              >
                📖 Sugerencia para ti:
              </h3>
              <h4
                style={{
                  color: "#2d3748",
                  fontWeight: 700,
                  fontSize: "1.35rem",
                  marginBottom: 12,
                  lineHeight: 1.4,
                }}
              >
                {article.title}
              </h4>
              <p style={{ marginBottom: 10 }}>
                {article.url === "#" ? (
                  <>
                    <p style={{ padding: 16 }}> 🚫 No URL disponible.</p>
                    <a
                      href={
                        "https://google.com/search?q=" +
                        encodeURIComponent(article.title)
                      }
                      style={{
                        color: "#667eea",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "1.08rem",
                        background: "rgba(102,126,234,0.08)",
                        padding: "0.5rem 1.2rem",
                        borderRadius: 10,
                        transition: "background 0.2s",
                        cursor: "pointer",
                      }}
                    >
                      🔎 Buscar en Google
                    </a>
                  </>
                ) : (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#667eea",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "1.08rem",
                      background: "rgba(102,126,234,0.08)",
                      padding: "0.5rem 1.2rem",
                      borderRadius: 10,
                      transition: "background 0.2s",
                    }}
                  >
                    🔗 Leer artículo
                  </a>
                )}
              </p>
              <p style={{ color: "#888", fontSize: "0.98rem", marginTop: 8 }}>
                Guardado el: {article.dateAdded.toLocaleDateString()}
              </p>
            </>
          ) : null}
        </div>
      </div>
      <button
        onClick={handleGetRandomArticle}
        disabled={loading}
        className="modern-button button-primary"
        style={{ minWidth: 220, marginTop: 24 }}
      >
        {loading ? "🔄 Buscando..." : "Dame otro 🎲"}
      </button>
    </div>
  );
}
