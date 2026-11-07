import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Session } from "@supabase/supabase-js";
import { AiSearch } from "../src/ui/AiSearch/AiSearch";
import { searchArticlesWithAi } from "../src/infrastructure/services/AiSearchService";
import { AuthContext } from "../src/domain/AuthContext";
import { createMockAuthContext } from "./setup";

const session = { access_token: "token-de-sesion" } as Session;

const result = (id: number, articleId: number, title: string) => ({
  id,
  articleId,
  title,
  url: `https://example.com/${id}`,
  rating: 8,
  reason: "Razón",
  summary: "Resumen",
  isRead: false,
});

const renderSearch = ({
  search = jest.fn(),
  onShowResults = jest.fn().mockReturnValue(true),
  withSession = true,
}: { search?: jest.Mock; onShowResults?: jest.Mock; withSession?: boolean } = {}) => {
  render(
    <AuthContext.Provider value={createMockAuthContext({ session: withSession ? session : null })}>
      <AiSearch search={search} onShowResults={onShowResults} />
    </AuthContext.Provider>
  );
  return { search, onShowResults };
};

const ask = (text: string) => {
  fireEvent.change(screen.getByLabelText("Pregúntale a la IA por tus artículos"), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
};

describe("AiSearch", () => {
  test("invita a pedir un tema", () => {
    renderSearch();
    expect(
      screen.getByText("Pídeme algo y te lo busco entre lo que tienes")
    ).toBeInTheDocument();
  });

  test("busca con la sesión del usuario y manda los resultados a la tarjeta, el mejor primero", async () => {
    const { search, onShowResults } = renderSearch({
      search: jest.fn().mockResolvedValue({
        ok: true,
        intent: "recomendar",
        results: [result(1, 101, "El mejor"), result(2, 102, "El segundo")],
      }),
    });

    ask("algo de tests");

    expect(await screen.findByRole("status")).toHaveTextContent(
      "🎯 ¡Encontrado! Con «Dame otro» verás el siguiente de este tema y, cuando se acaben, volveremos al azar."
    );
    expect(search).toHaveBeenCalledWith("algo de tests", "token-de-sesion");
    expect(onShowResults).toHaveBeenCalledWith([101, 102]);
  });

  test("no enseña una lista de otras opciones", async () => {
    renderSearch({
      search: jest.fn().mockResolvedValue({
        ok: true,
        intent: "recomendar",
        results: [result(1, 101, "El mejor"), result(2, 102, "El segundo")],
      }),
    });

    ask("algo");

    await screen.findByRole("status");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("El segundo")).not.toBeInTheDocument();
  });

  test("con un solo resultado no habla de los siguientes", async () => {
    renderSearch({
      search: jest.fn().mockResolvedValue({ ok: true, intent: "recordar", results: [result(1, 101, "Hooks")] }),
    });

    ask("el de los hooks");

    expect(await screen.findByRole("status")).toHaveTextContent(/^🎯 ¡Encontrado!$/);
  });

  test("muestra el mensaje del servidor (por ejemplo, sin créditos)", async () => {
    renderSearch({ search: jest.fn().mockResolvedValue({ ok: false, message: "☕ ¿La invitas a un café?" }) });

    ask("algo");

    expect(await screen.findByRole("alert")).toHaveTextContent("¿La invitas a un café?");
  });

  test("sin resultados lo dice y no toca la tarjeta", async () => {
    const { onShowResults } = renderSearch({
      search: jest.fn().mockResolvedValue({ ok: true, intent: "recomendar", results: [] }),
    });

    ask("golf");

    expect(await screen.findByRole("status")).toHaveTextContent("No tienes ningún artículo sin leer que encaje.");
    expect(onShowResults).not.toHaveBeenCalled();
  });

  test("si la tarjeta no puede mostrarlos, lo dice como sin resultados", async () => {
    renderSearch({
      search: jest.fn().mockResolvedValue({ ok: true, intent: "recordar", results: [result(1, 101, "X")] }),
      onShowResults: jest.fn().mockReturnValue(false),
    });

    ask("algo");

    expect(await screen.findByRole("status")).toHaveTextContent("No encuentro ningún artículo guardado que encaje.");
  });

  test("sin sesión no llama al servidor", () => {
    const { search } = renderSearch({ withSession: false });

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

    expect(fetchFn).toHaveBeenCalledWith(
      "/api/search",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer t0k3n" }),
        body: JSON.stringify({ text: "hooks" }),
      })
    );
    expect(outcome).toEqual({ ok: true, intent: "recordar", results: [] });
  });

  test("devuelve el mensaje de error del servidor o uno genérico", async () => {
    const quota = await searchArticlesWithAi("x", "t", jest.fn().mockResolvedValue(response(429, { message: "Sin cupo" })));
    const broken = await searchArticlesWithAi("x", "t", jest.fn().mockRejectedValue(new Error("red")));

    expect(quota).toEqual({ ok: false, message: "Sin cupo" });
    expect(broken.ok).toBe(false);
  });
});

describe("AiSearch: cuadro de texto", () => {
  test("se vacía al pulsar Buscar", async () => {
    render(
      <AuthContext.Provider value={createMockAuthContext({ session })}>
        <AiSearch
          search={jest.fn().mockResolvedValue({ ok: true, intent: "recomendar", results: [] })}
          onShowResults={jest.fn()}
        />
      </AuthContext.Provider>
    );

    ask("algo de tests");

    expect(screen.getByLabelText("Pregúntale a la IA por tus artículos")).toHaveValue("");
    await screen.findByRole("status");
  });
});
