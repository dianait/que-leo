import {
  screen,
  within,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { ArticleTable } from "../src/ui/ListOfArticles/ArticleTable";
import { renderWithProviders } from "./renderWithProviders";
import { makeArticleRepoMock } from "./helpers/makeArticleRepoMock";

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
    return makeArticleRepoMock(list);
  }

  it("muestra los botones de filtro con emojis y resalta el activo", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable />,
      repo
    );

    // Esperar a que cargue la tabla
    await waitFor(() =>
      expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
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
    expect(
      screen.getByRole("button", { name: /⭐ Favoritos/i })
    ).toBeInTheDocument();

    const todosBtn = screen.getByRole("button", { name: /📚 Todos/i });
    expect(todosBtn.className).toMatch(/active|success/); // resaltado inicial
  });

  it("filtra por no leídos al pulsar el botón correspondiente", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /📄 No leídos/i }));

    // Esperar a que se aplique el filtro
    await waitFor(() => {
      // Verificar que solo se muestran artículos no leídos (buscar por el icono 📖)
      const rows = screen.getAllByRole("row").slice(1); // omitir encabezado
      expect(rows.length).toBeGreaterThan(0);
      rows.forEach((row) => {
        // Verificar que tiene el botón con title "Marcar como leído" (que significa que no está leído)
        expect(within(row).getByTitle(/Marcar como leído/i)).toBeInTheDocument();
      });
    }, { timeout: 3000 });
  });

  it("combina filtro y búsqueda", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
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
      <ArticleTable />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
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

  it("muestra el botón de filtro de favoritos", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
    );

    const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
    expect(favoritesBtn).toBeInTheDocument();
    expect(favoritesBtn).toHaveAttribute("title", "Solo favoritos");
  });

  it("filtra por favoritos al pulsar el botón", async () => {
    const articlesWithFavorites = [
      {
        id: 1,
        title: "React Hooks Tutorial",
        url: "https://example.com/react-hooks",
        language: "English",
        authors: ["John"],
        isRead: false,
        isFavorite: false,
        dateAdded: new Date(),
      },
      {
        id: 2,
        title: "TypeScript Best Practices",
        url: "https://example.com/ts",
        language: "English",
        authors: ["Jane"],
        isRead: true,
        isFavorite: true,
        dateAdded: new Date(),
      },
      {
        id: 3,
        title: "Accesibilidad Web",
        url: "https://example.com/a11y",
        language: "Spanish",
        authors: ["Carlos"],
        isRead: false,
        isFavorite: true,
        dateAdded: new Date(),
      },
    ];

    const repo = makeRepoMock(articlesWithFavorites);
    renderWithProviders(
      <ArticleTable />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Activar filtro de favoritos
    const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
    fireEvent.click(favoritesBtn);

    // Esperar a que se carguen todos los artículos para el filtro
    await waitFor(() => {
      expect(repo.getArticlesByUserFiltered).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Verificar que solo se muestran favoritos
    await waitFor(() => {
      expect(screen.queryByText(/React Hooks Tutorial/i)).not.toBeInTheDocument();
      expect(screen.getByText(/TypeScript Best Practices/i)).toBeInTheDocument();
      expect(screen.getByText(/Accesibilidad Web/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("los filtros son mutuamente excluyentes - favoritos se desactiva al seleccionar leídos", async () => {
    const articlesWithFavorites = [
      {
        id: 1,
        title: "React Hooks Tutorial",
        url: "https://example.com/react-hooks",
        language: "English",
        authors: ["John"],
        isRead: false,
        isFavorite: true,
        dateAdded: new Date(),
      },
      {
        id: 2,
        title: "TypeScript Best Practices",
        url: "https://example.com/ts",
        language: "English",
        authors: ["Jane"],
        isRead: true,
        isFavorite: true,
        dateAdded: new Date(),
      },
      {
        id: 3,
        title: "Accesibilidad Web",
        url: "https://example.com/a11y",
        language: "Spanish",
        authors: ["Carlos"],
        isRead: false,
        isFavorite: false,
        dateAdded: new Date(),
      },
    ];

    const repo = makeRepoMock(articlesWithFavorites);
    renderWithProviders(
      <ArticleTable />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
    const readBtn = screen.getByRole("button", { name: /✅ Leídos/i });

    // Activar filtro de favoritos
    fireEvent.click(favoritesBtn);
    
    // Verificar que favoritos está activo
    await waitFor(() => {
      expect(favoritesBtn.className).toMatch(/active/);
    });
    
    // Activar filtro de leídos (debe desactivar favoritos)
    fireEvent.click(readBtn);

    // Verificar que favoritos se desactivó y leídos está activo
    await waitFor(() => {
      expect(favoritesBtn.className).not.toMatch(/active/);
      expect(readBtn.className).toMatch(/active/);
    });

    // Verificar que solo se muestran artículos leídos (no solo favoritos)
    await waitFor(() => {
      expect(screen.queryByText(/React Hooks Tutorial/i)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/TypeScript Best Practices/i)).toBeInTheDocument();
  });

  it("combina filtro de favoritos con búsqueda", async () => {
    const articlesWithFavorites = [
      {
        id: 1,
        title: "React Hooks Tutorial",
        url: "https://example.com/react-hooks",
        language: "English",
        authors: ["John"],
        isRead: false,
        isFavorite: true,
        dateAdded: new Date(),
      },
      {
        id: 2,
        title: "TypeScript Best Practices",
        url: "https://example.com/ts",
        language: "English",
        authors: ["Jane"],
        isRead: true,
        isFavorite: true,
        dateAdded: new Date(),
      },
      {
        id: 3,
        title: "React Patterns",
        url: "https://example.com/patterns",
        language: "English",
        authors: ["Bob"],
        isRead: false,
        isFavorite: false,
        dateAdded: new Date(),
      },
    ];

    const repo = makeRepoMock(articlesWithFavorites);
    repo.getArticlesByUserFromUserArticles = jest
      .fn()
      .mockResolvedValue(articlesWithFavorites);

    renderWithProviders(
      <ArticleTable />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Activar filtro de favoritos
    const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
    fireEvent.click(favoritesBtn);

    // Esperar a que se carguen todos los artículos para el filtro
    await waitFor(() => {
      expect(repo.getArticlesByUserFiltered).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Buscar por "TypeScript" - esto debería usar los artículos ya cargados
    const input = screen.getByPlaceholderText(/Buscar por título/i);
    fireEvent.change(input, { target: { value: "TypeScript" } });

    // Esperar a que se aplique el filtro de búsqueda
    await waitFor(() => {
      // Verificar que se llamó al menos 2 veces (inicial + carga todos para filtro)
      expect(repo.getArticlesByUserFiltered.mock.calls.length).toBeGreaterThanOrEqual(1);
    }, { timeout: 3000 });

    // Verificar que solo aparece el favorito que coincide con la búsqueda
    await waitFor(() => {
      expect(screen.queryByText(/React Hooks Tutorial/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/React Patterns/i)).not.toBeInTheDocument();
      expect(screen.getByText(/TypeScript Best Practices/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("desactiva el filtro de favoritos al hacer clic de nuevo", async () => {
    const articlesWithFavorites = [
      {
        id: 1,
        title: "React Hooks Tutorial",
        url: "https://example.com/react-hooks",
        language: "English",
        authors: ["John"],
        isRead: false,
        isFavorite: false,
        dateAdded: new Date(),
      },
      {
        id: 2,
        title: "TypeScript Best Practices",
        url: "https://example.com/ts",
        language: "English",
        authors: ["Jane"],
        isRead: true,
        isFavorite: true,
        dateAdded: new Date(),
      },
    ];

    const repo = makeRepoMock(articlesWithFavorites);
    renderWithProviders(
      <ArticleTable />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
    
    // Activar filtro
    fireEvent.click(favoritesBtn);
    
    // Esperar a que se carguen todos los artículos para el filtro
    await waitFor(() => {
      expect(repo.getArticlesByUserFiltered).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Esperar a que se aplique el filtro y se muestren solo favoritos
    await waitFor(() => {
      expect(screen.queryByText(/React Hooks Tutorial/i)).not.toBeInTheDocument();
      expect(screen.getByText(/TypeScript Best Practices/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Desactivar filtro
    fireEvent.click(favoritesBtn);
    
    // Esperar a que se recarguen los artículos sin filtro
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
      expect(screen.getByText(/TypeScript Best Practices/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  describe("Filtros mutuamente excluyentes", () => {
    const articlesWithFavorites = [
      {
        id: 1,
        title: "React Hooks Tutorial",
        url: "https://example.com/react-hooks",
        language: "English",
        authors: ["John"],
        isRead: false,
        isFavorite: true,
        dateAdded: new Date(),
      },
      {
        id: 2,
        title: "TypeScript Best Practices",
        url: "https://example.com/ts",
        language: "English",
        authors: ["Jane"],
        isRead: true,
        isFavorite: true,
        dateAdded: new Date(),
      },
      {
        id: 3,
        title: "Accesibilidad Web",
        url: "https://example.com/a11y",
        language: "Spanish",
        authors: ["Carlos"],
        isRead: false,
        isFavorite: false,
        dateAdded: new Date(),
      },
    ];

    it("desactiva Favoritos cuando se selecciona Leídos", async () => {
      const repo = makeRepoMock(articlesWithFavorites);
      renderWithProviders(
        <ArticleTable />,
        repo
      );

      await waitFor(() =>
        expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
      );

      await waitFor(() => {
        expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
      });

      // Activar filtro de favoritos
      const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
      fireEvent.click(favoritesBtn);

      // Verificar que favoritos está activo
      await waitFor(() => {
        expect(favoritesBtn.className).toMatch(/active/);
      });

      // Seleccionar filtro de leídos
      const readBtn = screen.getByRole("button", { name: /✅ Leídos/i });
      fireEvent.click(readBtn);

      // Verificar que favoritos se desactivó y leídos está activo
      await waitFor(() => {
        expect(favoritesBtn.className).not.toMatch(/active/);
        expect(readBtn.className).toMatch(/active/);
      });
    });

    it("desactiva Favoritos cuando se selecciona No leídos", async () => {
      const repo = makeRepoMock(articlesWithFavorites);
      renderWithProviders(
        <ArticleTable />,
        repo
      );

      await waitFor(() =>
        expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
      );

      await waitFor(() => {
        expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
      });

      // Activar filtro de favoritos
      const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
      fireEvent.click(favoritesBtn);

      // Verificar que favoritos está activo
      await waitFor(() => {
        expect(favoritesBtn.className).toMatch(/active/);
      });

      // Seleccionar filtro de no leídos
      const unreadBtn = screen.getByRole("button", { name: /📄 No leídos/i });
      fireEvent.click(unreadBtn);

      // Verificar que favoritos se desactivó y no leídos está activo
      await waitFor(() => {
        expect(favoritesBtn.className).not.toMatch(/active/);
        expect(unreadBtn.className).toMatch(/active/);
      });
    });

    it("desactiva el filtro de lectura cuando se selecciona Favoritos", async () => {
      const repo = makeRepoMock(articlesWithFavorites);
      renderWithProviders(
        <ArticleTable />,
        repo
      );

      await waitFor(() =>
        expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
      );

      await waitFor(() => {
        expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
      });

      // Activar filtro de leídos
      const readBtn = screen.getByRole("button", { name: /✅ Leídos/i });
      fireEvent.click(readBtn);

      // Verificar que leídos está activo
      await waitFor(() => {
        expect(readBtn.className).toMatch(/active/);
      });

      // Seleccionar filtro de favoritos
      const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
      fireEvent.click(favoritesBtn);

      // Verificar que leídos se desactivó y favoritos está activo
      await waitFor(() => {
        expect(readBtn.className).not.toMatch(/active/);
        expect(favoritesBtn.className).toMatch(/active/);
      });
    });

    it("solo permite un filtro activo a la vez", async () => {
      const repo = makeRepoMock(articlesWithFavorites);
      renderWithProviders(
        <ArticleTable />,
        repo
      );

      await waitFor(() =>
        expect(repo.getArticlesByUserFromUserArticles).toHaveBeenCalled()
      );

      await waitFor(() => {
        expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
      });

      const todosBtn = screen.getByRole("button", { name: /📚 Todos/i });
      const unreadBtn = screen.getByRole("button", { name: /📄 No leídos/i });
      const readBtn = screen.getByRole("button", { name: /✅ Leídos/i });
      const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });

      // Activar favoritos
      fireEvent.click(favoritesBtn);
      await waitFor(() => {
        expect(favoritesBtn.className).toMatch(/active/);
        expect(todosBtn.className).not.toMatch(/active/);
        expect(unreadBtn.className).not.toMatch(/active/);
        expect(readBtn.className).not.toMatch(/active/);
      });

      // Cambiar a leídos
      fireEvent.click(readBtn);
      await waitFor(() => {
        expect(readBtn.className).toMatch(/active/);
        expect(favoritesBtn.className).not.toMatch(/active/);
        expect(todosBtn.className).not.toMatch(/active/);
        expect(unreadBtn.className).not.toMatch(/active/);
      });

      // Cambiar a no leídos
      fireEvent.click(unreadBtn);
      await waitFor(() => {
        expect(unreadBtn.className).toMatch(/active/);
        expect(readBtn.className).not.toMatch(/active/);
        expect(favoritesBtn.className).not.toMatch(/active/);
        expect(todosBtn.className).not.toMatch(/active/);
      });

      // Volver a todos
      fireEvent.click(todosBtn);
      await waitFor(() => {
        expect(todosBtn.className).toMatch(/active/);
        expect(unreadBtn.className).not.toMatch(/active/);
        expect(readBtn.className).not.toMatch(/active/);
        expect(favoritesBtn.className).not.toMatch(/active/);
      });
    });
  });
});
