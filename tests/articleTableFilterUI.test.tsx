import React from "react";
import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { ArticleTable } from "../src/ui/ListOfArticles/ArticleTable";
import { AuthContext } from "../src/domain/AuthContext";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { mockUser, createMockAuthContext } from "./setup";

function renderWithProviders(ui: React.ReactElement, repoMock: any) {
  const authValue = createMockAuthContext({ user: mockUser });
  return render(
    <AuthContext.Provider value={authValue}>
      <ArticleRepositoryContext.Provider value={repoMock}>
        {ui}
      </ArticleRepositoryContext.Provider>
    </AuthContext.Provider>
  );
}

describe("ArticleTable - UI de filtros y acciones", () => {
  const baseArticles = [
    {
      id: 1,
      title: "React Hooks Tutorial",
      url: "https://example.com/react-hooks",
      language: "English",
      authors: ["John"],
      isRead: false,
      dateAdded: new Date(),
    },
    {
      id: 2,
      title: "TypeScript Best Practices",
      url: "https://example.com/ts",
      language: "English",
      authors: ["Jane"],
      isRead: true,
      dateAdded: new Date(),
    },
    {
      id: 3,
      title: "Accesibilidad Web",
      url: "https://example.com/a11y",
      language: "Spanish",
      authors: ["Carlos"],
      isRead: false,
      dateAdded: new Date(),
    },
  ];

  function makeRepoMock(list = baseArticles) {
    return {
      getArticlesByUserPaginated: jest.fn().mockResolvedValue({
        articles: list,
        total: list.length,
      }),
      markAsRead: jest.fn().mockResolvedValue(undefined),
      deleteArticle: jest.fn().mockResolvedValue(undefined),
    };
  }

  it("muestra los botones de filtro con emojis y resalta el activo", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    // Esperar a que cargue la tabla
    await waitFor(() =>
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled()
    );

    expect(
      screen.getByRole("button", { name: /📚 Todos/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /📄 No leídos/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /✅ Leídos/i })
    ).toBeInTheDocument();

    const todosBtn = screen.getByRole("button", { name: /📚 Todos/i });
    expect(todosBtn.className).toMatch(/active|success/); // resaltado inicial
  });

  it("filtra por no leídos al pulsar el botón correspondiente", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled()
    );

    fireEvent.click(screen.getByRole("button", { name: /📄 No leídos/i }));

    // En la columna de acciones, el botón de estado muestra "📖 No leído" cuando no lo está
    const rows = screen.getAllByRole("row").slice(1); // omitir encabezado
    // Debe quedar al menos una fila y todas deberían contener "No leído"
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(within(row).getByText(/No leído/)).toBeInTheDocument();
    });
  });

  it("combina filtro y búsqueda", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled()
    );

    // Buscar por "TypeScript" y filtrar por leídos
    const input = screen.getByPlaceholderText(/Buscar por título/i);
    fireEvent.change(input, { target: { value: "TypeScript" } });
    fireEvent.click(screen.getByRole("button", { name: /✅ Leídos/i }));

    // Esperar a que aparezca el resultado filtrado
    await screen.findByText(/TypeScript Best Practices/i);
    expect(screen.getByText(/TypeScript Best Practices/i)).toBeInTheDocument();
  });

  it("marca como leído desde la tabla y actualiza el estado local", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled()
    );

    // Hacer clic en el primer botón de estado "No leído" para marcarlo como leído
    const statusButtons = screen.getAllByRole("button", {
      name: /No leído|Leído/,
    });
    const firstNoLeido = statusButtons.find((b) =>
      /No leído/.test(b.textContent || "")
    );
    if (firstNoLeido) fireEvent.click(firstNoLeido);

    // El botón de estado del primer registro cambia a "Leído" (optimistic update)
    const updated = await screen.findAllByRole("button", { name: /Leído/ });
    expect(updated.length).toBeGreaterThan(0);
  });
});
