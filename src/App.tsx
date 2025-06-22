import { ListOfArticles } from "./ui/ListOfArticles/ListOfArticles";
import { RandomArticle } from "./ui/RandomArticle/RandomArticle";
import { AddArticle } from "./ui/AddArticle/AddArticle";
import { Header } from "./ui/Header/Header";
import { LoginForm } from "./ui/Auth/LoginForm";
import { ArticleRepositoryContext } from "./domain/ArticleRepositoryContext";
import { useAuth } from "./domain/AuthContext";
import { AuthProvider } from "./ui/Auth/AuthProvider";
import { SupabaseArticleRepository } from "./infrastructure/repositories/SupabaseArticleRepository";

const repository = SupabaseArticleRepository.getInstance();
const supabase = repository.supabase;

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🔄</div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <ArticleRepositoryContext.Provider value={repository}>
      <Header />
      <div className="main-content">
        <RandomArticle />
        <ListOfArticles />
      </div>
    </ArticleRepositoryContext.Provider>
  );
};

function App() {
  return (
    <AuthProvider supabase={supabase}>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
