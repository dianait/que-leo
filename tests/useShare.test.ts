import { useShare } from "../src/ui/RandomArticle/useShare";

const mockShare = jest.fn();
const mockWindowOpen = jest.fn();

beforeEach(() => {
  mockShare.mockClear();
  mockWindowOpen.mockClear();
  Object.defineProperty(window, "open", { value: mockWindowOpen, writable: true });
});

describe("useShare", () => {
  describe("cuando navigator.share está disponible", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "share", { value: mockShare, writable: true, configurable: true });
    });

    it("llama a navigator.share con url, title y text", () => {
      mockShare.mockResolvedValue(undefined);
      const share = useShare();
      share({ url: "https://example.com", title: "Título", text: "Texto" });
      expect(mockShare).toHaveBeenCalledWith({
        url: "https://example.com",
        title: "Título",
        text: "Texto",
      });
    });

    it("no abre window.open si navigator.share tiene éxito", async () => {
      mockShare.mockResolvedValue(undefined);
      const share = useShare();
      share({ url: "https://example.com", title: "Título" });
      await Promise.resolve();
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it("abre window.open como fallback si navigator.share falla con error no-AbortError", async () => {
      mockShare.mockRejectedValue(new Error("NotAllowedError"));
      const share = useShare();
      share({ url: "https://example.com", title: "Título" });
      await Promise.resolve();
      await Promise.resolve();
      expect(mockWindowOpen).toHaveBeenCalledWith("https://example.com", "_blank");
    });

    it("no abre window.open si el usuario cancela (AbortError)", async () => {
      const abortError = new Error("AbortError");
      abortError.name = "AbortError";
      mockShare.mockRejectedValue(abortError);
      const share = useShare();
      share({ url: "https://example.com", title: "Título" });
      await Promise.resolve();
      await Promise.resolve();
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });
  });

  describe("cuando navigator.share NO está disponible", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "share", { value: undefined, writable: true, configurable: true });
    });

    it("abre window.open con la url del artículo", () => {
      const share = useShare();
      share({ url: "https://example.com/articulo", title: "Título" });
      expect(mockWindowOpen).toHaveBeenCalledWith("https://example.com/articulo", "_blank");
    });

    it("no llama a navigator.share", () => {
      const share = useShare();
      share({ url: "https://example.com", title: "Título" });
      expect(mockShare).not.toHaveBeenCalled();
    });
  });
});
