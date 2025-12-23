import { useState, Suspense, lazy } from "react";
import { Header } from "./ui/Header/Header";
import { Routes, Route } from "react-router-dom";
import { Footer } from "./ui/Footer/Footer";
import { AppSkeleton } from "./ui/AppSkeleton/AppSkeleton";

const RandomArticle = lazy(() =>
  import("./ui/RandomArticle/RandomArticle").then((module) => ({
    default: module.RandomArticle,
  }))
);

const ArticleTable = lazy(() =>
  import("./ui/ListOfArticles/ArticleTable").then((module) => ({
    default: module.ArticleTable,
  }))
);

export function App() {
  const [articlesVersion, setArticlesVersion] = useState(0);

  return (
    <div className="app-container">
      <Header />
      <main className="app-main-content">
        <Suspense fallback={<AppSkeleton />}>
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
        </Suspense>
      </main>
      <a
        href="https://www.buymeacoffee.com/dianait"
        target="_blank"
        rel="noopener noreferrer"
        className="bmc-floating"
      >
        <img src="/buymeacoffe.webp" alt="Buy me a coffee" />
      </a>
      <Footer />
    </div>
  );
}
