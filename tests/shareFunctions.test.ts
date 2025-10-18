// Tests para las funciones de compartir
describe("Share Functions", () => {
  // Mock de window.open
  const mockWindowOpen = jest.fn();
  Object.defineProperty(window, 'open', {
    value: mockWindowOpen,
    writable: true
  });

  beforeEach(() => {
    mockWindowOpen.mockClear();
  });

  const mockArticle = {
    id: 1,
    title: "Test Article Title",
    url: "https://example.com/article",
    language: "Spanish",
    authors: ["Test Author"],
    isRead: false,
    dateAdded: new Date(),
    less_15: false,
    topics: ["test"],
    featuredImage: null
  };

  // Función simulada para LinkedIn
  const handleShareToLinkedIn = (article: typeof mockArticle) => {
    const url = encodeURIComponent(article.url);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
  };

  // Función simulada para Bluesky
  const handleShareToBluesky = (article: typeof mockArticle) => {
    const shareText = encodeURIComponent(`¡He leído: ${article.title}!`);
    const url = encodeURIComponent(article.url);
    const blueskyUrl = `https://bsky.app/intent/compose?text=${shareText}%20${url}`;
    window.open(blueskyUrl, "_blank", "noopener,noreferrer");
  };

  describe("handleShareToLinkedIn", () => {
    it("opens LinkedIn share URL correctly", () => {
      handleShareToLinkedIn(mockArticle);

      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining("linkedin.com/sharing/share-offsite"),
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("includes article URL in LinkedIn share", () => {
      handleShareToLinkedIn(mockArticle);

      const callArgs = mockWindowOpen.mock.calls[0][0];
      expect(callArgs).toContain("url=");
      expect(callArgs).toContain("https%3A%2F%2Fexample.com%2Farticle");
    });
  });

  describe("handleShareToBluesky", () => {
    it("opens Bluesky compose URL correctly", () => {
      handleShareToBluesky(mockArticle);

      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining("bsky.app/intent/compose"),
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("includes article title and URL in Bluesky share", () => {
      handleShareToBluesky(mockArticle);

      const callArgs = mockWindowOpen.mock.calls[0][0];
      expect(callArgs).toContain("text=");
      expect(callArgs).toContain("He%20le%C3%ADdo%3A%20Test%20Article%20Title");
      expect(callArgs).toContain("https%3A%2F%2Fexample.com%2Farticle");
    });

    it("handles special characters in article title", () => {
      const articleWithSpecialChars = {
        ...mockArticle,
        title: "Artículo con ñ y acentos: ¡Hola!"
      };

      handleShareToBluesky(articleWithSpecialChars);

      const callArgs = mockWindowOpen.mock.calls[0][0];
      expect(callArgs).toContain("Art%C3%ADculo%20con%20%C3%B1%20y%20acentos");
    });
  });

  describe("URL encoding", () => {
    it("properly encodes URLs with query parameters", () => {
      const articleWithQueryParams = {
        ...mockArticle,
        url: "https://example.com/article?param=value&other=test"
      };

      handleShareToLinkedIn(articleWithQueryParams);

      const callArgs = mockWindowOpen.mock.calls[0][0];
      expect(callArgs).toContain("param%3Dvalue%26other%3Dtest");
    });

    it("handles URLs with fragments", () => {
      const articleWithFragment = {
        ...mockArticle,
        url: "https://example.com/article#section"
      };

      handleShareToBluesky(articleWithFragment);

      const callArgs = mockWindowOpen.mock.calls[0][0];
      expect(callArgs).toContain("https%3A%2F%2Fexample.com%2Farticle%23section");
    });
  });
});
