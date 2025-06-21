import React from "react";
import { ListOfArticles } from "../../../src/ui/ListOfArticles";
import { render, screen, waitFor } from "@testing-library/react";

test("muestra la lista de artículos desde el JSON (componente real)", async () => {
  render(<ListOfArticles />);
  await waitFor(() => {
    expect(screen.getByText(/Lista de Artículos/i)).toBeInTheDocument();
    expect(screen.getByRole("list").children.length).toBeGreaterThan(0);
  });
});
