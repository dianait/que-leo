import { useState } from "react";
import { Header } from "./ui/Header/Header";
import { RandomArticle } from "./ui/RandomArticle/RandomArticle";
import { Routes, Route } from "react-router-dom";
import { ArticleTable } from "./ui/ListOfArticles/ArticleTable";
import { Footer } from "./ui/Footer/Footer";

export function App() {
  const [articlesVersion, setArticlesVersion] = useState(0);

  return (
    <div className="app-container">
      <Header />
      <main className="app-main-content">
        <Routes>
          <Route
            path="/"
            element={<RandomArticle articlesVersion={articlesVersion} />}
          />
          <Route
            path="/articulos"
            element={
              <ArticleTable
                articlesVersion={articlesVersion}
                setArticlesVersion={setArticlesVersion}
              />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
