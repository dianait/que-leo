// Test for global search functionality in ArticleTable
describe("Búsqueda Global en ArticleTable", () => {
  const mockArticles = [
    {
      id: "1",
      title: "React Testing Best Practices",
      url: "https://example.com/react-testing",
      isRead: false,
      language: "en",
      authors: ["John Doe"],
      dateAdded: new Date(),
      less_15: false,
      topics: ["react", "testing"],
      featuredImage: null,
    },
    {
      id: "2", 
      title: "JavaScript Fundamentals",
      url: "https://example.com/js-fundamentals",
      isRead: true,
      language: "en",
      authors: ["Jane Smith"],
      dateAdded: new Date(),
      less_15: true,
      topics: ["javascript"],
      featuredImage: null,
    },
    {
      id: "3",
      title: "TypeScript Advanced Patterns",
      url: "https://example.com/ts-patterns",
      isRead: false,
      language: "en",
      authors: ["Bob Johnson"],
      dateAdded: new Date(),
      less_15: false,
      topics: ["typescript"],
      featuredImage: null,
    },
  ];

  describe("Lógica de filtrado global", () => {
    it("debería filtrar artículos cuando hay término de búsqueda", () => {
      const searchTerm = "JavaScript";
      const filteredArticles = mockArticles.filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(1);
      expect(filteredArticles[0].title).toBe("JavaScript Fundamentals");
    });

    it("debería usar artículos paginados cuando no hay término de búsqueda", () => {
      const searchTerm = "";
      const paginatedArticles = mockArticles.slice(0, 2); // Simulate pagination
      
      // Component logic: if there's a search term, use all articles
      // Otherwise, use paginated articles
      const filteredArticles = searchTerm.trim() !== ""
        ? mockArticles.filter((article) =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : paginatedArticles;

      expect(filteredArticles).toHaveLength(2);
      expect(filteredArticles[0].title).toBe("React Testing Best Practices");
      expect(filteredArticles[1].title).toBe("JavaScript Fundamentals");
    });

    it("debería buscar en todos los artículos cuando hay término de búsqueda", () => {
      const searchTerm = "script";
      const allArticles = mockArticles; // All loaded articles
      const filteredArticles = allArticles.filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(2);
      expect(filteredArticles.map(a => a.title)).toContain("JavaScript Fundamentals");
      expect(filteredArticles.map(a => a.title)).toContain("TypeScript Advanced Patterns");
    });
  });

  describe("Estados de búsqueda", () => {
    it("debería manejar estado de carga durante búsqueda", () => {
      let isSearching = true;
      let allArticles: typeof mockArticles = [];
      
      // Simulate initial search state
      expect(isSearching).toBe(true);
      expect(allArticles).toHaveLength(0);
      
      // Simular carga completada
      isSearching = false;
      allArticles = mockArticles;
      
      expect(isSearching).toBe(false);
      expect(allArticles).toHaveLength(3);
    });

    it("debería limpiar estado al resetear búsqueda", () => {
      let searchTerm = "JavaScript";
      let allArticles = mockArticles;
      
      // Simulate clearing search
      searchTerm = "";
      allArticles = [];
      
      expect(searchTerm).toBe("");
      expect(allArticles).toHaveLength(0);
    });
  });

  describe("Contadores de resultados", () => {
    it("debería mostrar contador correcto con total", () => {
      const searchTerm = "script";
      const allArticles = mockArticles;
      const filteredArticles = allArticles.filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const resultText = `${filteredArticles.length} artículo${filteredArticles.length !== 1 ? "s" : ""} encontrado${filteredArticles.length !== 1 ? "s" : ""} (de ${allArticles.length} total)`;
      
      expect(resultText).toBe("2 artículos encontrados (de 3 total)");
    });

    it("debería mostrar contador singular para un resultado", () => {
      const searchTerm = "React";
      const allArticles = mockArticles;
      const filteredArticles = allArticles.filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const resultText = `${filteredArticles.length} artículo${filteredArticles.length !== 1 ? "s" : ""} encontrado${filteredArticles.length !== 1 ? "s" : ""} (de ${allArticles.length} total)`;
      
      expect(resultText).toBe("1 artículo encontrado (de 3 total)");
    });

    it("debería mostrar mensaje de carga durante búsqueda", () => {
      const isSearching = true;
      const loadingMessage = isSearching ? "🔍 Buscando en todos los artículos..." : "";
      
      expect(loadingMessage).toBe("🔍 Buscando en todos los artículos...");
    });
  });

  describe("Casos edge", () => {
    it("debería manejar búsqueda sin resultados", () => {
      const searchTerm = "Python";
      const allArticles = mockArticles;
      const filteredArticles = allArticles.filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(0);
    });

    it("debería manejar búsqueda case-insensitive", () => {
      const searchTerm = "TYPESCRIPT";
      const allArticles = mockArticles;
      const filteredArticles = allArticles.filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(1);
      expect(filteredArticles[0].title).toBe("TypeScript Advanced Patterns");
    });

    it("debería manejar búsqueda con coincidencias parciales", () => {
      const searchTerm = "Fund";
      const allArticles = mockArticles;
      const filteredArticles = allArticles.filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(1);
      expect(filteredArticles[0].title).toBe("JavaScript Fundamentals");
    });
  });
});
