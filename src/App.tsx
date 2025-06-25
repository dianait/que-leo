import { useState } from "react";
import { Header } from "./ui/Header/Header";
import { ListOfArticles } from "./ui/ListOfArticles/ListOfArticles";
import { RandomArticle } from "./ui/RandomArticle/RandomArticle";

export function App() {
  const [articlesVersion, setArticlesVersion] = useState(0);

  return (
    <>
      <Header />
      <div className="app-container">
        <ListOfArticles
          articlesVersion={articlesVersion}
          setArticlesVersion={setArticlesVersion}
        />
        <RandomArticle
          articlesVersion={articlesVersion}
          setArticlesVersion={setArticlesVersion}
        />
      </div>
    </>
  );
}
