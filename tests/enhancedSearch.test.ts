import { describe, it, expect } from "@jest/globals";

describe("Enhanced Article Search Logic", () => {
  const mockArticles = [
    {
      id: "1",
      title: "Do not try to be the smartest in the room; try to be the kindest.",
      url: "https://example.com/kindness",
      isRead: false,
      userId: "123",
      dateAdded: new Date(),
      readAt: null,
      authors: ["John Doe"],
      topics: [],
      less_15: false,
    },
    {
      id: "2", 
      title: "React Tutorial: A Complete Guide",
      url: "https://example.com/react",
      isRead: false,
      userId: "123",
      dateAdded: new Date(),
      readAt: null,
      authors: ["Jane Smith"],
      topics: [],
      less_15: false,
    },
    {
      id: "3",
      title: "JavaScript Best Practices for Beginners",
      url: "https://example.com/js",
      isRead: false,
      userId: "123", 
      dateAdded: new Date(),
      readAt: null,
      authors: ["Bob Wilson"],
      topics: [],
      less_15: false,
    }
  ];

  // Función de búsqueda mejorada (copiada del componente)
  function filterArticles(articles: typeof mockArticles, searchTerm: string) {
    return articles.filter((article) => {
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase().trim();
      const titleLower = article.title.toLowerCase();
      
      // Búsqueda exacta primero
      if (titleLower.includes(searchLower)) return true;
      
      // Búsqueda por palabras clave (divide el término de búsqueda en palabras)
      const searchWords = searchLower.split(/\s+/).filter(word => word.length > 2);
      if (searchWords.length > 0) {
        return searchWords.every(word => titleLower.includes(word));
      }
      
      return false;
    });
  }

  describe("Exact search matching", () => {
    it("should find article with exact title match", () => {
      const searchTerm = "Do not try to be the smartest in the room; try to be the kindest.";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Do not try to be the smartest in the room; try to be the kindest.");
    });

    it("should find article with partial title match", () => {
      const searchTerm = "Do not try to be the smartest";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Do not try to be the smartest in the room; try to be the kindest.");
    });

    it("should find article with case insensitive search", () => {
      const searchTerm = "REACT TUTORIAL";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("React Tutorial: A Complete Guide");
    });
  });

  describe("Keyword-based search", () => {
    it("should find article using multiple keywords", () => {
      const searchTerm = "react tutorial guide";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("React Tutorial: A Complete Guide");
    });

    it("should find article using partial keywords", () => {
      const searchTerm = "smartest room kindest";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Do not try to be the smartest in the room; try to be the kindest.");
    });

    it("should find article using JavaScript keywords", () => {
      const searchTerm = "javascript practices beginners";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("JavaScript Best Practices for Beginners");
    });
  });

  describe("Edge cases", () => {
    it("should return all articles when search term is empty", () => {
      const filtered = filterArticles(mockArticles, "");
      
      expect(filtered).toHaveLength(3);
    });

    it("should return all articles when search term is only spaces", () => {
      const filtered = filterArticles(mockArticles, "   ");
      
      expect(filtered).toHaveLength(3);
    });

    it("should return empty array when no articles match", () => {
      const searchTerm = "python machine learning";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      expect(filtered).toHaveLength(0);
    });

    it("should ignore words shorter than 3 characters", () => {
      const searchTerm = "js be";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      // Should not find anything because "js" and "be" are too short
      expect(filtered).toHaveLength(0);
    });

    it("should handle special characters in search", () => {
      const searchTerm = "try to be";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Do not try to be the smartest in the room; try to be the kindest.");
    });
  });

  describe("Real-world scenarios", () => {
    it("should handle truncated search terms from URL", () => {
      const searchTerm = "Do not try to be the smartest in the room; try to b";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      // Should find the article even with truncated search
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Do not try to be the smartest in the room; try to be the kindest.");
    });

    it("should find articles with punctuation differences", () => {
      const searchTerm = "react tutorial complete guide";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("React Tutorial: A Complete Guide");
    });

    it("should handle mixed case and punctuation", () => {
      const searchTerm = "JAVASCRIPT best PRACTICES";
      const filtered = filterArticles(mockArticles, searchTerm);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("JavaScript Best Practices for Beginners");
    });
  });
});
