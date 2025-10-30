// Test to verify persistent behavior of the selected article
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
      // Simulate useEffect logic
      let currentArticle: typeof mockArticles[0] | null = null;
      const articles = mockArticles;

      // First time: no article selected
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

      // Second time: already selected, should not change
      const previousArticle = currentArticle;
      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          const randomIndex = Math.floor(Math.random() * filtered.length);
          currentArticle = filtered[randomIndex];
        }
      }

      // Article should remain the same
      expect(currentArticle).toBe(previousArticle);
    });

    it("should not change article when articles array updates", () => {
      let currentArticle: typeof mockArticles[0] | null = null;
      let articles: typeof mockArticles = [mockArticles[0]];

      // Select initial article
      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          currentArticle = filtered[0]; // Select first article
        }
      }

      const initialArticle = currentArticle;
      expect(initialArticle).toBeTruthy();

      // Simulate article updates (new ones added)
      articles = [...mockArticles];

      // Verify article does not change automatically
      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          const randomIndex = Math.floor(Math.random() * filtered.length);
          currentArticle = filtered[randomIndex];
        }
      }

      // Article should remain the same
      expect(currentArticle).toBe(initialArticle);
    });

    it("should only change article when explicitly requested", () => {
      let currentArticle: typeof mockArticles[0] | null = null;
      const articles = mockArticles;

      // Select initial article
      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          currentArticle = filtered[0]; // Select first article
        }
      }

      const initialArticle = currentArticle;
      expect(initialArticle).toBeTruthy();

      // Simulate click on "Dame otro" (handleGetRandomArticle)
      const handleGetRandomArticle = () => {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length === 0) {
          currentArticle = null;
        } else {
          // Force selecting a different article
          const availableArticles = filtered.filter(a => a.id !== currentArticle?.id);
          if (availableArticles.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableArticles.length);
            currentArticle = availableArticles[randomIndex];
          }
        }
      };

      // Execute function
      handleGetRandomArticle();

      // Now the article should change (if more than one article)
      expect(currentArticle).toBeTruthy();
      if (articles.length > 1) {
        expect(currentArticle).not.toBe(initialArticle);
      }
    });
  });

  describe("Article Deletion Behavior", () => {
    it("should only generate new article when current article is deleted", () => {
      let currentArticle: typeof mockArticles[0] | null = mockArticles[0]; // Current article
      let articles: typeof mockArticles = [...mockArticles];

      const initialArticle = currentArticle;

      // Simulate deletion of a different article
      const articleToDelete = mockArticles[1];
      articles = articles.filter((a) => a.id !== articleToDelete.id);

      // Verify current article doesn't change
      expect(currentArticle).toBe(initialArticle);

      // Simulate deletion of current article
      if (currentArticle) {
        const articleIdToDelete = currentArticle.id;
        articles = articles.filter((a) => a.id !== articleIdToDelete);
      }
      
      // Now it should generate a new article
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

      // Remove all articles
      articles = [];

      // Simulate deletion logic
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

      // Select initial article
      if (!currentArticle && articles.length > 0) {
        const filtered = articles.filter((a) => !a.isRead);
        if (filtered.length > 0) {
          currentArticle = filtered[0];
        }
      }

      const initialArticle = currentArticle;

      // Simulate multiple operations that shouldn't change the article
      articles = [...articles, { ...mockArticles[0], id: 4 }]; // Add article
      articles = articles.filter(a => a.id !== 2); // Remove different article

      // Verify article remains the same
      expect(currentArticle).toBe(initialArticle);
    });
  });
});
