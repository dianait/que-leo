import { render, screen } from "@testing-library/react";
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
      screen.getByText(/¿Quieres compartirlo en tus redes?/i)
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
