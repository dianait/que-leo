import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Session } from "@supabase/supabase-js";
import { AiSearch } from "../src/ui/AiSearch/AiSearch";
import { searchArticlesWithAi } from "../src/infrastructure/services/AiSearchService";
import { AuthContext } from "../src/domain/AuthContext";
import { createMockAuthContext } from "./setup";

const session = { access_token: "token-de-sesion" } as Session;

const renderSearch = (search: jest.Mock, withSession = true) =>
  render(
    <AuthContext.Provider value={createMockAuthContext({ session: withSession ? session : null })}>
      <AiSearch search={search} />
    </AuthContext.Provider>
  );

const ask = (text: string) => {
  fireEvent.change(screen.getByLabelText("Pregúntale a la IA por tus artículos"), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
};

describe("AiSearch", () => {
  test("invita a pedir un tema", () => {
    renderSearch(jest.fn());
    expect(
      screen.getByText("¿No te convence? Pídeme un tema y te busco entre lo que tienes")
    ).toBeInTheDocument();
  });

  test("busca con la sesión del usuario y muestra los resultados con nota y razón", async () => {
    const search = jest.fn().mockResolvedValue({
      ok: true,
      intent: "recomendar",
      results: [
        { id: 1, title: "TDD en Swift", url: "https://example.com/1", rating: 9, reason: "Ejemplos claros", summary: "Resumen", isRead: false },
      ],
    });
    renderSearch(search);

    ask("algo de tests");

    expect(await screen.findByRole("link", { name: "TDD en Swift" })).toHaveAttribute("href", "https://example.com/1");
    expect(screen.getByText("9/10")).toBeInTheDocument();
    expect(screen.getByText("Ejemplos claros")).toBeInTheDocument();
    expect(search).toHaveBeenCalledWith("algo de tests", "token-de-sesion");
  });

  test("al recordar enseña el resumen", async () => {
    const search = jest.fn().mockResolvedValue({
      ok: true,
      intent: "recordar",
      results: [{ id: 2, title: "Hooks", url: "https://example.com/2", rating: null, reason: "Razón", summary: "El resumen", isRead: true }],
    });
    renderSearch(search);

    ask("el de los hooks");

    expect(await screen.findByText("El resumen")).toBeInTheDocument();
    expect(screen.getByText("leído")).toBeInTheDocument();
  });

  test("muestra el mensaje del servidor (por ejemplo, sin créditos)", async () => {
    const search = jest.fn().mockResolvedValue({ ok: false, message: "☕ ¿La invitas a un café?" });
    renderSearch(search);

    ask("algo");

    expect(await screen.findByRole("alert")).toHaveTextContent("¿La invitas a un café?");
  });

  test("sin resultados lo dice", async () => {
    renderSearch(jest.fn().mockResolvedValue({ ok: true, intent: "recomendar", results: [] }));

    ask("golf");

    expect(await screen.findByText("No tienes ningún artículo sin leer que encaje.")).toBeInTheDocument();
  });

  test("sin sesión no llama al servidor", () => {
    const search = jest.fn();
    renderSearch(search, false);

    ask("algo");

    expect(search).not.toHaveBeenCalled();
  });
});

describe("searchArticlesWithAi", () => {
  const response = (status: number, body: unknown) =>
    ({ ok: status < 400, status, json: async () => body }) as Response;

  test("envía el texto y el token a /api/search", async () => {
    const fetchFn = jest.fn().mockResolvedValue(response(200, { intent: "recordar", results: [] }));

    const outcome = await searchArticlesWithAi("hooks", "t0k3n", fetchFn);

    expect(fetchFn).toHaveBeenCalledWith("/api/search", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer t0k3n" }),
      body: JSON.stringify({ text: "hooks" }),
    }));
    expect(outcome).toEqual({ ok: true, intent: "recordar", results: [] });
  });

  test("devuelve el mensaje de error del servidor o uno genérico", async () => {
    const quota = await searchArticlesWithAi("x", "t", jest.fn().mockResolvedValue(response(429, { message: "Sin cupo" })));
    const broken = await searchArticlesWithAi("x", "t", jest.fn().mockRejectedValue(new Error("red")));

    expect(quota).toEqual({ ok: false, message: "Sin cupo" });
    expect(broken.ok).toBe(false);
  });
});
