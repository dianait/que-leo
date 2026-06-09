import { createContext, use, useCallback, useState } from "react";

type ArticlesRefreshContextValue = {
  version: number;
  bumpRefresh: () => void;
};

const ArticlesRefreshContext = createContext<
  ArticlesRefreshContextValue | undefined
>(undefined);

export function ArticlesRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [version, setVersion] = useState(0);
  const bumpRefresh = useCallback(() => setVersion((v) => v + 1), []);

  return (
    <ArticlesRefreshContext.Provider value={{ version, bumpRefresh }}>
      {children}
    </ArticlesRefreshContext.Provider>
  );
}

export function useArticlesRefresh() {
  const context = use(ArticlesRefreshContext);
  if (!context) {
    throw new Error(
      "useArticlesRefresh must be used within an ArticlesRefreshProvider"
    );
  }
  return context;
}
