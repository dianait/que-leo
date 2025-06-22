import { ListOfArticles } from "./ui/ListOfArticles/ListOfArticles";
import { RandomArticle } from "./ui/RandomArticle/RandomArticle";
import { Header } from "./ui/Header/Header";
import { LoginForm } from "./ui/Auth/LoginForm";
import { ArticleRepositoryContext } from "./domain/ArticleRepositoryContext";
import { useAuth } from "./domain/AuthContext";
import { AuthProvider } from "./ui/Auth/AuthProvider";
import { SupabaseArticleRepository } from "./infrastructure/repositories/SupabaseArticleRepository";
import { AppSkeleton } from "./ui/AppSkeleton/AppSkeleton";

const repository = SupabaseArticleRepository.getInstance();
const supabase = repository.supabase;

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppSkeleton />;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <ArticleRepositoryContext.Provider value={repository}>
      <div className="app-container">
        <Header />
        <div className="main-layout">
          <main className="main-view">
            <RandomArticle />
          </main>
          <ListOfArticles />
        </div>
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
