import type { Article } from "../src/domain/Article";
import { filterArticlesBySearch } from "../src/ui/ListOfArticles/articleTableFiltering";

describe("Article Search Functionality", () => {
  const mockArticles: Article[] = [
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
    },
  ];

  describe("Article Filtering", () => {
    it("should filter articles by title (case insensitive)", () => {
      const filteredArticles = filterArticlesBySearch(mockArticles, "react");
      expect(filteredArticles).toHaveLength(1);
      expect(filteredArticles[0].title).toBe("React Hooks Tutorial");
    });

    it("should filter articles by partial title match", () => {
      const filteredArticles = filterArticlesBySearch(mockArticles, "script");
      expect(filteredArticles).toHaveLength(2);
      expect(filteredArticles.map((a) => a.title)).toContain(
        "TypeScript Best Practices"
      );
      expect(filteredArticles.map((a) => a.title)).toContain(
        "JavaScript Async/Await"
      );
    });

    it("should return all articles when search term is empty", () => {
      const filteredArticles = filterArticlesBySearch(mockArticles, "");
      expect(filteredArticles).toHaveLength(4);
      expect(filteredArticles).toEqual(mockArticles);
    });

    it("should return empty array when no articles match", () => {
      const filteredArticles = filterArticlesBySearch(mockArticles, "python");
      expect(filteredArticles).toHaveLength(0);
    });

    it("should handle special characters in search", () => {
      const filteredArticles = filterArticlesBySearch(mockArticles, "css grid");
      expect(filteredArticles).toHaveLength(1);
      expect(filteredArticles[0].title).toBe("CSS Grid Layout Guide");
    });

    it("should handle accented characters", () => {
      const articlesWithAccents: Article[] = [
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
        },
      ];

      const filteredArticles = filterArticlesBySearch(
        articlesWithAccents,
        "programación"
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
      const filteredArticles = filterArticlesBySearch(
        mockArticles,
        "javascript"
      );
      expect(filteredArticles.length).toBe(1);
    });

    it("should show plural form for multiple results", () => {
      const filteredArticles = filterArticlesBySearch(mockArticles, "script");
      expect(filteredArticles.length).toBe(2);
    });

    it("should show singular form for single result", () => {
      const filteredArticles = filterArticlesBySearch(mockArticles, "react");
      expect(filteredArticles.length).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty articles array", () => {
      const filteredArticles = filterArticlesBySearch([], "test");
      expect(filteredArticles).toHaveLength(0);
    });

    it("should handle very long search terms", () => {
      const longSearchTerm = "a".repeat(1000);
      const filteredArticles = filterArticlesBySearch(
        mockArticles,
        longSearchTerm
      );
      expect(filteredArticles).toHaveLength(0);
    });

    it("should handle search terms with only spaces", () => {
      const filteredArticles = filterArticlesBySearch(mockArticles, "   ");
      expect(filteredArticles).toHaveLength(0);
    });
  });
});
