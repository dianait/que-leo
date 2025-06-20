import { mockArticles } from "../../application/GetRandomArticile";

export function ListOfArticles() {
  const articles = mockArticles;

  return (
    <div>
      <h2>Lista de Artículos</h2>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
            {" - "}
            {article.dateAdded.toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
