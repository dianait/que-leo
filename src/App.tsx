import { useState } from "react";
import { Header } from "./ui/Header/Header";
import { ListOfArticles } from "./ui/ListOfArticles/ListOfArticles";
import { RandomArticle } from "./ui/RandomArticle/RandomArticle";

export function App() {
  const [articlesVersion, setArticlesVersion] = useState(0);

  return (
    <div className="app-container">
      <Header />
      <main className="app-main-content">
        <ListOfArticles
          articlesVersion={articlesVersion}
          setArticlesVersion={setArticlesVersion}
        />
        <RandomArticle
          articlesVersion={articlesVersion}
          setArticlesVersion={setArticlesVersion}
        />
      </main>
    </div>
  );
}
