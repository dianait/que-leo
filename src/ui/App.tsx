import { useState } from "react";
import { ListOfArticles } from "./ListOfArticles/ListOfArticles";
import { RandomArticle } from "./RandomArticle/RandomArticle";

export function App() {
  const [articlesVersion, setArticlesVersion] = useState(0);

  return (
    <>
      <ListOfArticles
        articlesVersion={articlesVersion}
        setArticlesVersion={setArticlesVersion}
      />
      <RandomArticle
        articlesVersion={articlesVersion}
        setArticlesVersion={setArticlesVersion}
      />
    </>
  );
}
