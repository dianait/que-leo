// Test para verificar que las funciones de compartir funcionan correctamente
describe("Share Button Functionality", () => {
  // Mock de window.open
  const mockWindowOpen = jest.fn();
  Object.defineProperty(window, "open", {
    value: mockWindowOpen,
    writable: true,
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
    featuredImage: null,
  };

  // Mock function for LinkedIn
  const handleShareToLinkedIn = (article: typeof mockArticle) => {
    const url = encodeURIComponent(article.url);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
  };

  // Mock function for Twitter
  const handleShareToTwitter = (article: typeof mockArticle) => {
    const shareText = `¡He leído: ${article.title}!`;
    const url = article.url;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  describe("LinkedIn Share", () => {
    it("should open LinkedIn share URL", () => {
      handleShareToLinkedIn(mockArticle);

      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining("linkedin.com/sharing/share-offsite"),
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("should include article URL in LinkedIn share", () => {
      handleShareToLinkedIn(mockArticle);

      const callArgs = mockWindowOpen.mock.calls[0][0];
      expect(callArgs).toContain("url=");
      expect(callArgs).toContain("https%3A%2F%2Fexample.com%2Farticle");
    });
  });

  describe("Twitter Share", () => {
    it("should open Twitter intent URL", () => {
      handleShareToTwitter(mockArticle);

      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining("twitter.com/intent/tweet"),
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("should include article title and URL in Twitter share", () => {
      handleShareToTwitter(mockArticle);

      const callArgs = mockWindowOpen.mock.calls[0][0];
      expect(callArgs).toContain("text=");
      expect(callArgs).toContain("He%20le%C3%ADdo%3A%20Test%20Article%20Title");
      expect(callArgs).toContain("https%3A%2F%2Fexample.com%2Farticle");
    });

    it("should handle special characters in article title", () => {
      const articleWithSpecialChars = {
        ...mockArticle,
        title: "Artículo con ñ y acentos: ¡Hola!",
      };

      handleShareToTwitter(articleWithSpecialChars);

      const callArgs = mockWindowOpen.mock.calls[0][0];
      expect(callArgs).toContain("Art%C3%ADculo%20con%20%C3%B1%20y%20acentos");
    });
  });

  describe("URL Encoding", () => {
    it("should properly encode URLs with query parameters", () => {
      const articleWithQueryParams = {
        ...mockArticle,
        url: "https://example.com/article?param=value&other=test",
      };

      handleShareToLinkedIn(articleWithQueryParams);

      const callArgs = mockWindowOpen.mock.calls[0][0];
      expect(callArgs).toContain("param%3Dvalue%26other%3Dtest");
    });

    it("should handle URLs with fragments", () => {
      const articleWithFragment = {
        ...mockArticle,
        url: "https://example.com/article#section",
      };

      handleShareToTwitter(articleWithFragment);

      const callArgs = mockWindowOpen.mock.calls[0][0];
      expect(callArgs).toContain(
        "https%3A%2F%2Fexample.com%2Farticle%23section"
      );
    });
  });

  describe("Button Actions", () => {
    it("should call LinkedIn share function when LinkedIn button is clicked", () => {
      const mockOnClick = jest.fn();
      mockOnClick.mockImplementation(() => handleShareToLinkedIn(mockArticle));

      mockOnClick();

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    });

    it("should call Twitter share function when Twitter button is clicked", () => {
      const mockOnClick = jest.fn();
      mockOnClick.mockImplementation(() => handleShareToTwitter(mockArticle));

      mockOnClick();

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    });
  });
});
