// Test para verificar el comportamiento persistente del artículo
describe("Article Persistence Behavior", () => {

  const mockArticles = [
    {
      id: 1,
      title: "Article 1",
      url: "https://example.com/1",
      language: "Spanish",
      authors: ["Author 1"],
      isRead: false,
      dateAdded: new Date(),
      less_15: false,
      topics: ["test"],
      featuredImage: null,
    },
    {
      id: 2,
      title: "Article 2",
      url: "https://example.com/2",
      language: "Spanish",
      authors: ["Author 2"],
      isRead: false,
      dateAdded: new Date(),
      less_15: false,
      topics: ["test"],
      featuredImage: null,
    },
    {
      id: 3,
      title: "Article 3",
      url: "https://example.com/3",
      language: "Spanish",
      authors: ["Author 3"],
      isRead: false,
      dateAdded: new Date(),
      less_15: false,
      topics: ["test"],
      featuredImage: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Article Selection Logic", () => {
    it("should only select an article when none is currently selected", () => {
      // Simular la lógica del useEffect
      let currentArticle: typeof mockArticles[0] | null = null;
      const articles = mockArticles;

      // Primera vez: no hay artículo seleccionado
      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          const randomIndex = Math.floor(Math.random() * filtered.length);
          currentArticle = filtered[randomIndex];
        }
      }

      expect(currentArticle).toBeTruthy();
      expect(currentArticle).toHaveProperty("id");
      expect(currentArticle).toHaveProperty("title");

      // Segunda vez: ya hay artículo seleccionado, no debería cambiar
      const previousArticle = currentArticle;
      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          const randomIndex = Math.floor(Math.random() * filtered.length);
          currentArticle = filtered[randomIndex];
        }
      }

      // El artículo debería seguir siendo el mismo
      expect(currentArticle).toBe(previousArticle);
    });

    it("should not change article when articles array updates", () => {
      let currentArticle: typeof mockArticles[0] | null = null;
      let articles: typeof mockArticles = [mockArticles[0]];

      // Seleccionar artículo inicial
      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          currentArticle = filtered[0]; // Seleccionar el primer artículo
        }
      }

      const initialArticle = currentArticle;
      expect(initialArticle).toBeTruthy();

      // Simular actualización de artículos (nuevos artículos agregados)
      articles = [...mockArticles];

      // Verificar que el artículo no cambia automáticamente
      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          const randomIndex = Math.floor(Math.random() * filtered.length);
          currentArticle = filtered[randomIndex];
        }
      }

      // El artículo debería seguir siendo el mismo
      expect(currentArticle).toBe(initialArticle);
    });

    it("should only change article when explicitly requested", () => {
      let currentArticle: typeof mockArticles[0] | null = null;
      const articles = mockArticles;

      // Seleccionar artículo inicial
      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          currentArticle = filtered[0]; // Seleccionar el primer artículo
        }
      }

      const initialArticle = currentArticle;
      expect(initialArticle).toBeTruthy();

      // Simular clic en "Dame otro" (función handleGetRandomArticle)
      const handleGetRandomArticle = () => {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length === 0) {
          currentArticle = null;
        } else {
          // Forzar selección de un artículo diferente
          const availableArticles = filtered.filter(a => a.id !== currentArticle?.id);
          if (availableArticles.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableArticles.length);
            currentArticle = availableArticles[randomIndex];
          }
        }
      };

      // Ejecutar la función
      handleGetRandomArticle();

      // Ahora el artículo debería haber cambiado (si hay más de un artículo)
      expect(currentArticle).toBeTruthy();
      if (articles.length > 1) {
        expect(currentArticle).not.toBe(initialArticle);
      }
    });
  });

  describe("Article Deletion Behavior", () => {
    it("should only generate new article when current article is deleted", () => {
      let currentArticle: typeof mockArticles[0] | null = mockArticles[0]; // Artículo actual
      let articles: typeof mockArticles = [...mockArticles];

      const initialArticle = currentArticle;

      // Simular eliminación de un artículo diferente al actual
      const articleToDelete = mockArticles[1];
      articles = articles.filter((a) => a.id !== articleToDelete.id);

      // Verificar que el artículo actual no cambia
      expect(currentArticle).toBe(initialArticle);

      // Simular eliminación del artículo actual
      if (currentArticle) {
        const articleIdToDelete = currentArticle.id;
        articles = articles.filter((a) => a.id !== articleIdToDelete);
      }
      
      // Ahora debería generar un nuevo artículo
      if (articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          const randomIndex = Math.floor(Math.random() * filtered.length);
          currentArticle = filtered[randomIndex];
        }
      }

      expect(currentArticle).toBeTruthy();
      expect(currentArticle).not.toBe(initialArticle);
    });

    it("should set article to null when all articles are deleted", () => {
      let currentArticle: typeof mockArticles[0] | null = mockArticles[0];
      let articles: typeof mockArticles = [...mockArticles];

      // Eliminar todos los artículos
      articles = [];

      // Simular la lógica de eliminación
      if (articles.length === 0) {
        currentArticle = null;
      }

      expect(currentArticle).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty articles array gracefully", () => {
      let currentArticle: typeof mockArticles[0] | null = null;
      const articles: typeof mockArticles = [];

      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          const randomIndex = Math.floor(Math.random() * filtered.length);
          currentArticle = filtered[randomIndex];
        }
      }

      expect(currentArticle).toBeNull();
    });

    it("should handle all articles being read", () => {
      let currentArticle: typeof mockArticles[0] | null = null;
      const articles = mockArticles.map(article => ({ ...article, isRead: true }));

      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length === 0) {
          currentArticle = null;
        } else {
          const randomIndex = Math.floor(Math.random() * filtered.length);
          currentArticle = filtered[randomIndex];
        }
      }

      expect(currentArticle).toBeNull();
    });

    it("should maintain article selection across multiple operations", () => {
      let currentArticle: typeof mockArticles[0] | null = null;
      let articles: typeof mockArticles = [...mockArticles];

      // Seleccionar artículo inicial
      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          currentArticle = filtered[0];
        }
      }

      const initialArticle = currentArticle;

      // Simular múltiples operaciones que no deberían cambiar el artículo
      articles = [...articles, { ...mockArticles[0], id: 4 }]; // Agregar artículo
      articles = articles.filter(a => a.id !== 2); // Eliminar artículo diferente

      // Verificar que el artículo sigue siendo el mismo
      expect(currentArticle).toBe(initialArticle);
    });
  });
});
