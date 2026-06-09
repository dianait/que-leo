import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { AuthContext } from "../src/domain/AuthContext";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { ArticlesRefreshProvider } from "../src/ui/context/ArticlesRefreshContext";
import { mockUser, createMockAuthContext } from "./setup";

export function renderWithProviders(
  ui: React.ReactElement,
  repoMock: unknown,
  authOverrides: Parameters<typeof createMockAuthContext>[0] = {}
) {
  const authValue = createMockAuthContext({ user: mockUser, ...authOverrides });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={authValue}>
      <ArticleRepositoryContext.Provider value={repoMock as never}>
        <ArticlesRefreshProvider>{children}</ArticlesRefreshProvider>
      </ArticleRepositoryContext.Provider>
    </AuthContext.Provider>
  );

  return render(ui, { wrapper: Wrapper } as RenderOptions);
}
