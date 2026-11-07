/**
 * @jest-environment node
 */
import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatLibrary,
  handleSearch,
  MAX_QUERY_CHARS,
  OUT_OF_CREDIT_MESSAGE,
  pickResults,
  type LibraryRow,
  type SearchDeps,
} from "../api/search";

const row = (id: number, title: string, extra: Partial<LibraryRow> = {}): LibraryRow => ({
  id,
  article_id: id + 100,
  is_read: false,
  ai_rating: 8,
  ai_rating_reason: `Razón ${id}`,
  ai_summary: `Resumen ${id}`,
  articles: { title, url: `https://example.com/${id}`, topics: ["swift", "testing"] },
  ...extra,
});

const library = [row(1, "TDD en Swift"), row(2, "Hooks de Claude Code", { is_read: true }), row(3, "Recetas")];
const userDb = {} as SupabaseClient;

const buildDeps = (overrides: Partial<SearchDeps> = {}): SearchDeps & Record<string, jest.Mock> =>
  ({
    verifyUser: jest.fn(async (token: string) => (token === "token-valido" ? userDb : null)),
    consumeQuota: jest.fn(async () => true),
    loadLibrary: jest.fn(async () => library),
    askClaude: jest.fn(async () => ({ intencion: "recordar", ids: [2] })),
    ...overrides,
  }) as SearchDeps & Record<string, jest.Mock>;

const post = (body: unknown, token: string | null = "token-valido") =>
  new Request("https://que-leo.vercel.app/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const apiError = (status: number, type: string) =>
  Anthropic.APIError.generate(status, { type: "error", error: { type, message: "x" } }, "x", new Headers());

describe("POST /api/search", () => {
  test("solo acepta POST", async () => {
    const res = await handleSearch(new Request("https://x/api/search"), buildDeps());
    expect(res.status).toBe(405);
  });

  test("sin sesión o con una sesión falsa responde 401 sin gastar cuota ni llamar a Claude", async () => {
    for (const token of [null, "token-inventado"]) {
      const deps = buildDeps();
      const res = await handleSearch(post({ text: "tests" }, token), deps);

      expect(res.status).toBe(401);
      expect(deps.consumeQuota).not.toHaveBeenCalled();
      expect(deps.askClaude).not.toHaveBeenCalled();
    }
  });

  test("rechaza textos vacíos, demasiado largos, JSON roto o cuerpos enormes", async () => {
    const deps = buildDeps();

    expect((await handleSearch(post({ text: "  " }), deps)).status).toBe(400);
    expect((await handleSearch(post({ text: "a".repeat(MAX_QUERY_CHARS + 1) }), deps)).status).toBe(400);
    expect((await handleSearch(post("{no es json"), deps)).status).toBe(400);
    expect((await handleSearch(post({ text: "x", relleno: "a".repeat(3000) }), deps)).status).toBe(400);
    expect(deps.askClaude).not.toHaveBeenCalled();
  });

  test("sin cupo responde 429 y no llama a Claude", async () => {
    const deps = buildDeps({ consumeQuota: jest.fn(async () => false) });
    const res = await handleSearch(post({ text: "tests" }), deps);

    expect(res.status).toBe(429);
    expect(deps.askClaude).not.toHaveBeenCalled();
  });

  test("busca en la lista del usuario de la sesión y devuelve sus artículos", async () => {
    const deps = buildDeps();
    const res = await handleSearch(post({ text: "el de los hooks" }), deps);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(deps.loadLibrary).toHaveBeenCalledWith(userDb);
    expect(body).toEqual({
      intent: "recordar",
      results: [
        {
          id: 2,
          articleId: 102,
          title: "Hooks de Claude Code",
          url: "https://example.com/2",
          rating: 8,
          reason: "Razón 2",
          summary: "Resumen 2",
          isRead: true,
        },
      ],
    });
  });

  test("sin saldo de Claude devuelve el mensaje del café", async () => {
    const deps = buildDeps({ askClaude: jest.fn(async () => { throw apiError(402, "billing_error"); }) });
    const res = await handleSearch(post({ text: "tests" }), deps);

    expect(res.status).toBe(503);
    expect((await res.json()).message).toBe(OUT_OF_CREDIT_MESSAGE);
  });

  test("si algo falla no cuenta detalles internos", async () => {
    const deps = buildDeps({ loadLibrary: jest.fn(async () => { throw new Error("secreto interno"); }) });
    jest.spyOn(console, "error").mockImplementation(() => {});
    const res = await handleSearch(post({ text: "tests" }), deps);

    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toContain("secreto");
  });
});

describe("pickResults", () => {
  test("ignora ids inventados o repetidos y como mucho devuelve 3", () => {
    const results = pickResults(library, { intencion: "recordar", ids: [999, 1, 1, 2, 3, 4] });
    expect(results.map((r) => r.id)).toEqual([1, 2, 3]);
  });

  test("al recomendar no devuelve artículos ya leídos", () => {
    const results = pickResults(library, { intencion: "recomendar", ids: [2, 1] });
    expect(results.map((r) => r.id)).toEqual([1]);
  });
});

describe("formatLibrary", () => {
  test("una línea corta por artículo, marcando los leídos", () => {
    expect(formatLibrary(library)).toBe(
      [
        "1 | TDD en Swift | swift, testing | 8",
        "2 | Hooks de Claude Code | swift, testing | 8 | leído",
        "3 | Recetas | swift, testing | 8",
      ].join("\n")
    );
  });
});
