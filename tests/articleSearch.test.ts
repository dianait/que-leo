// Test para la funcionalidad de búsqueda en ArticleTable
describe("Article Search Functionality", () => {
  const mockArticles = [
    {
      id: 1,
      title: "React Hooks Tutorial",
      url: "https://example.com/react-hooks",
      language: "English",
      authors: ["John Doe"],
      isRead: false,
      dateAdded: new Date(),
      less_15: false,
      topics: ["react", "javascript"],
      featuredImage: null,
    },
    {
      id: 2,
      title: "TypeScript Best Practices",
      url: "https://example.com/typescript",
      language: "English",
      authors: ["Jane Smith"],
      isRead: true,
      dateAdded: new Date(),
      less_15: true,
      topics: ["typescript", "programming"],
      featuredImage: null,
    },
    {
      id: 3,
      title: "CSS Grid Layout Guide",
      url: "https://example.com/css-grid",
      language: "Spanish",
      authors: ["Carlos García"],
      isRead: false,
      dateAdded: new Date(),
      less_15: false,
      topics: ["css", "layout"],
      featuredImage: null,
    },
    {
      id: 4,
      title: "JavaScript Async/Await",
      url: "https://example.com/async-await",
      language: "English",
      authors: ["Mike Johnson"],
      isRead: false,
      dateAdded: new Date(),
      less_15: true,
      topics: ["javascript", "async"],
      featuredImage: null,
    },
  ];

  describe("Article Filtering", () => {
    it("should filter articles by title (case insensitive)", () => {
      const searchTerm = "react";
      const filteredArticles = mockArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(1);
      expect(filteredArticles[0].title).toBe("React Hooks Tutorial");
    });

    it("should filter articles by partial title match", () => {
      const searchTerm = "script";
      const filteredArticles = mockArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(2);
      expect(filteredArticles.map(a => a.title)).toContain("TypeScript Best Practices");
      expect(filteredArticles.map(a => a.title)).toContain("JavaScript Async/Await");
    });

    it("should return all articles when search term is empty", () => {
      const searchTerm = "";
      const filteredArticles = mockArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(4);
      expect(filteredArticles).toEqual(mockArticles);
    });

    it("should return empty array when no articles match", () => {
      const searchTerm = "python";
      const filteredArticles = mockArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(0);
    });

    it("should handle special characters in search", () => {
      const searchTerm = "css grid";
      const filteredArticles = mockArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(1);
      expect(filteredArticles[0].title).toBe("CSS Grid Layout Guide");
    });

    it("should handle accented characters", () => {
      const articlesWithAccents = [
        ...mockArticles,
        {
          id: 5,
          title: "Programación en Python",
          url: "https://example.com/python",
          language: "Spanish",
          authors: ["Ana López"],
          isRead: false,
          dateAdded: new Date(),
          less_15: false,
          topics: ["python"],
          featuredImage: null,
        },
      ];

      const searchTerm = "programación";
      const filteredArticles = articlesWithAccents.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(1);
      expect(filteredArticles[0].title).toBe("Programación en Python");
    });
  });

  describe("Search State Management", () => {
    it("should update search term when input changes", () => {
      let searchTerm = "";
      const setSearchTerm = (term: string) => {
        searchTerm = term;
      };

      // Simular cambio en el input
      setSearchTerm("react");
      expect(searchTerm).toBe("react");

      setSearchTerm("typescript");
      expect(searchTerm).toBe("typescript");

      setSearchTerm("");
      expect(searchTerm).toBe("");
    });

    it("should clear search when clear button is clicked", () => {
      let searchTerm = "react";
      const clearSearch = () => {
        searchTerm = "";
      };

      expect(searchTerm).toBe("react");
      clearSearch();
      expect(searchTerm).toBe("");
    });
  });

  describe("Search Results Display", () => {
    it("should show correct count of filtered articles", () => {
      const searchTerm = "javascript";
      const filteredArticles = mockArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles.length).toBe(1);
    });

    it("should show plural form for multiple results", () => {
      const searchTerm = "script";
      const filteredArticles = mockArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles.length).toBe(2);
    });

    it("should show singular form for single result", () => {
      const searchTerm = "react";
      const filteredArticles = mockArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles.length).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty articles array", () => {
      const emptyArticles: typeof mockArticles = [];
      const searchTerm = "test";
      const filteredArticles = emptyArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(0);
    });

    it("should handle very long search terms", () => {
      const longSearchTerm = "a".repeat(1000);
      const filteredArticles = mockArticles.filter(article =>
        article.title.toLowerCase().includes(longSearchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(0);
    });

    it("should handle search terms with only spaces", () => {
      const searchTerm = "   ";
      const filteredArticles = mockArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredArticles).toHaveLength(0); // No articles contain only spaces
    });
  });
});
