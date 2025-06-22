import { ListOfArticles } from "./ui/ListOfArticles/ListOfArticles";
import { RandomArticle } from "./ui/RandomArticle/RandomArticle";
import { ArticleRepositoryContext } from "./domain/ArticleRepositoryContext";
import { SupabaseArticleRepository } from "./infrastructure/repositories/SupabaseArticleRepository";

const repository = SupabaseArticleRepository.getInstance();

function App() {
  return (
    <ArticleRepositoryContext.Provider value={repository}>
      <header className="app-header">
        <h1>📚 ¿Qué leo?</h1>
        <p>Menos decisiones, más lectura.</p>
      </header>
      <RandomArticle />
      <ListOfArticles />
    </ArticleRepositoryContext.Provider>
  );
}

export default App;
