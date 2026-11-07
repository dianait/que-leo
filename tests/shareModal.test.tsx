import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ShareModal } from "../src/ui/shared/ShareModal";
import type { Article } from "../src/domain/Article";

const article: Article = {
  id: 1,
  title: "Test Article",
  url: "https://example.com/post",
  dateAdded: new Date(),
  isRead: true,
};

describe("ShareModal", () => {
  it("renders configured share networks", () => {
    render(
      <ShareModal
        open
        article={article}
        onClose={() => {}}
        networks={["twitter", "linkedin"]}
      />
    );

    expect(screen.getByText("Twitter")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.queryByText("Bluesky")).not.toBeInTheDocument();
  });

  it("uses neutral share copy by default", () => {
    render(
      <ShareModal open article={article} onClose={() => {}} />
    );

    expect(
      screen.getByText(/Compartir es vivir/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Has marcado este artículo como leído/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Has guardado este artículo como favorito/i)
    ).not.toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <ShareModal open={false} article={article} onClose={() => {}} />
    );

    expect(screen.queryByText("¡Genial! 🎉")).not.toBeInTheDocument();
  });
});

describe("ShareModal: copiar enlace", () => {
  const writeText = jest.fn();

  beforeEach(() => {
    writeText.mockReset();
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  });

  test("copia la URL del artículo y lo confirma", async () => {
    writeText.mockResolvedValue(undefined);
    render(<ShareModal open article={article} onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "🔗 Copiar enlace" }));

    expect(await screen.findByRole("button", { name: "✅ ¡Copiado!" })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(article.url);
  });

  test("avisa si el navegador no deja copiar", async () => {
    writeText.mockRejectedValue(new Error("sin permiso"));
    render(<ShareModal open article={article} onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "🔗 Copiar enlace" }));

    expect(await screen.findByRole("button", { name: "No se pudo copiar" })).toBeInTheDocument();
  });
});
