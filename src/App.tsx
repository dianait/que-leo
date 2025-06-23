import { ListOfArticles } from "./ui/ListOfArticles/ListOfArticles";
import { RandomArticle } from "./ui/RandomArticle/RandomArticle";
import { Header } from "./ui/Header/Header";
import { LoginForm } from "./ui/Auth/LoginForm";
import { ArticleRepositoryContext } from "./domain/ArticleRepositoryContext";
import { useAuth } from "./domain/AuthContext";
import { AuthProvider } from "./ui/Auth/AuthProvider";
import { SupabaseArticleRepository } from "./infrastructure/repositories/SupabaseArticleRepository";
import { AppSkeleton } from "./ui/AppSkeleton/AppSkeleton";
import { useIsMobile } from "./ui/utils/useIsMobile";
import { useState } from "react";

const repository = SupabaseArticleRepository.getInstance();
const supabase = repository.supabase;

const AppContent: React.FC<{
  articlesVersion: number;
  setArticlesVersion: (v: (v: number) => number) => void;
}> = ({ articlesVersion, setArticlesVersion }) => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return <AppSkeleton />;
  }

  if (!user) {
    return <LoginForm />;
  }

  if (isMobile === undefined) {
    return null;
  }

  return (
    <ArticleRepositoryContext.Provider value={repository}>
      <div className="app-container">
        <Header />
        <div className="main-layout">
          <main className="main-view">
            <RandomArticle setArticlesVersion={setArticlesVersion} />
          </main>
          {!isMobile && <ListOfArticles articlesVersion={articlesVersion} />}
        </div>
      </div>
    </ArticleRepositoryContext.Provider>
  );
};

function App() {
  const [articlesVersion, setArticlesVersion] = useState(0);
  return (
    <AuthProvider supabase={supabase}>
      <AppContent
        articlesVersion={articlesVersion}
        setArticlesVersion={setArticlesVersion}
      />
    </AuthProvider>
  );
}

export default App;
