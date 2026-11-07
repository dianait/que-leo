import Anthropic from "@anthropic-ai/sdk";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Smart search for the web: POST /api/search { text } with the user's
 * Supabase session in "Authorization: Bearer <token>".
 *
 * It runs on Vercel, so nothing on the home PC is exposed. Security:
 * - The session is verified with Supabase; every query below runs AS that
 *   user (anon key + their token), so RLS only lets it read their articles.
 * - Daily quota in Supabase (consume_ai_search(): 30/day, user from the
 *   token), checked before calling Claude.
 * - Short queries and small bodies only; Claude may only return ids that
 *   are in the user's own list.
 * - Errors never expose internals.
 *
 * Tokens are kept to a minimum: Claude Haiku 5.5 at low effort, and each
 * article goes in as one short line (id, title, topics, rating).
 */

declare const process: { env: Record<string, string | undefined> };

export const MAX_QUERY_CHARS = 300;
const MAX_BODY_BYTES = 2048;
const MAX_ARTICLES = 300;
const MAX_TOPICS_PER_ARTICLE = 5;
const MAX_RESULTS = 3;
const CLAUDE_MODEL = "claude-haiku-5-5";

export const OUT_OF_CREDIT_MESSAGE =
  "☕ Diana se ha quedado sin créditos de la IA y el buscador inteligente está en pausa. ¿La invitas a un café?";

export type LibraryRow = {
  id: number;
  article_id: number;
  is_read: boolean | null;
  ai_rating: number | null;
  ai_rating_reason: string | null;
  ai_summary: string | null;
  articles: { title: string | null; url: string; topics: string[] | null } | null;
};

export type Intent = "recomendar" | "recordar" | "otro";
export type ClaudeAnswer = { intencion: Intent; ids: number[] };

export type SearchDeps = {
  verifyUser(token: string): Promise<SupabaseClient | null>;
  consumeQuota(db: SupabaseClient): Promise<boolean>;
  loadLibrary(db: SupabaseClient): Promise<LibraryRow[]>;
  askClaude(library: string, text: string): Promise<ClaudeAnswer>;
};

const SYSTEM_PROMPT = `Ayudas a una persona a encontrar artículos de SU lista guardada.
Cada línea de la lista: id | título | temas | nota | "leído" si ya lo leyó.
Rellena:
- intencion: "recomendar" si pide algo para leer; "recordar" si busca uno que ya leyó o guardó; "otro" si no pide ninguna de las dos.
- ids: hasta ${MAX_RESULTS} ids de la lista que mejor encajan, del mejor al peor. Para "recomendar", solo artículos no leídos. Lista vacía si ninguno encaja. Nunca inventes ids.`;

const ANSWER_SCHEMA = {
  type: "object",
  properties: {
    intencion: { type: "string", enum: ["recomendar", "recordar", "otro"] },
    ids: { type: "array", items: { type: "integer" } },
  },
  required: ["intencion", "ids"],
  additionalProperties: false,
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** One short line per article: as few tokens as possible. */
export function formatLibrary(rows: LibraryRow[]): string {
  return rows
    .filter((row) => row.articles)
    .map((row) => {
      const topics = (row.articles!.topics ?? []).slice(0, MAX_TOPICS_PER_ARTICLE).join(", ");
      const parts = [
        row.id,
        (row.articles!.title ?? "(sin título)").replace(/\s+/g, " ").trim(),
        topics,
        row.ai_rating ?? "-",
      ];
      if (row.is_read) parts.push("leído");
      return parts.join(" | ");
    })
    .join("\n");
}

/** Keeps only ids from the user's own list, without repeats. */
export function pickResults(rows: LibraryRow[], answer: ClaudeAnswer) {
  const byId = new Map(rows.filter((row) => row.articles).map((row) => [row.id, row]));
  const seen = new Set<number>();

  return answer.ids
    .map((id) => byId.get(id))
    .filter((row): row is LibraryRow => {
      if (!row || seen.has(row.id)) return false;
      if (answer.intencion === "recomendar" && row.is_read) return false;
      seen.add(row.id);
      return true;
    })
    .slice(0, MAX_RESULTS)
    .map((row) => ({
      id: row.id,
      articleId: row.article_id,
      title: row.articles!.title,
      url: row.articles!.url,
      rating: row.ai_rating,
      reason: row.ai_rating_reason,
      summary: row.ai_summary,
      isRead: Boolean(row.is_read),
    }));
}

function readBearerToken(request: Request): string | null {
  const match = (request.headers.get("authorization") ?? "").match(
    /^Bearer\s+([A-Za-z0-9._~+/-]+=*)$/
  );
  return match ? match[1] : null;
}

export async function handleSearch(
  request: Request,
  deps: SearchDeps = createDefaultDeps()
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: "bad_request" }, 400);
  }

  let text = "";
  try {
    const body = JSON.parse(raw) as { text?: unknown };
    text = typeof body.text === "string" ? body.text.trim() : "";
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  if (!text || text.length > MAX_QUERY_CHARS) {
    return json(
      { error: "invalid_query", message: `Escribe qué buscas (máximo ${MAX_QUERY_CHARS} caracteres).` },
      400
    );
  }

  try {
    const token = readBearerToken(request);
    const db = token ? await deps.verifyUser(token) : null;
    if (!db) {
      return json({ error: "unauthorized", message: "Inicia sesión para buscar." }, 401);
    }

    if (!(await deps.consumeQuota(db))) {
      return json(
        { error: "quota_exceeded", message: "Ya has hecho tus 30 búsquedas de hoy. Mañana vuelves a tener cupo." },
        429
      );
    }

    const rows = (await deps.loadLibrary(db)).filter((row) => row.articles);
    if (rows.length === 0) {
      return json({ intent: "otro", results: [] });
    }

    const answer = await deps.askClaude(formatLibrary(rows), text);
    return json({ intent: answer.intencion, results: pickResults(rows, answer) });
  } catch (error) {
    if (
      error instanceof Anthropic.APIError &&
      (error.type === "billing_error" || error.status === 402)
    ) {
      return json({ error: "out_of_credit", message: OUT_OF_CREDIT_MESSAGE }, 503);
    }

    console.error("AI search failed", error instanceof Error ? error.message : error);
    return json(
      { error: "unavailable", message: "No se ha podido buscar ahora mismo. Inténtalo en un rato." },
      503
    );
  }
}

function createDefaultDeps(): SearchDeps {
  const url = process.env.VITE_SUPABASE_URL ?? "";
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? "";

  return {
    async verifyUser(token) {
      // Every query made with this client runs as the user (RLS applies).
      const db = createClient(url, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await db.auth.getUser(token);
      return error || !data.user ? null : db;
    },

    async consumeQuota(db) {
      const { data, error } = await db.rpc("consume_ai_search");
      if (error) throw new Error(`quota: ${error.message}`);
      return data === true;
    },

    async loadLibrary(db) {
      const { data, error } = await db
        .from("user_articles")
        .select("id, article_id, is_read, ai_rating, ai_rating_reason, ai_summary, articles(title, url, topics)")
        .order("added_at", { ascending: false })
        .limit(MAX_ARTICLES);
      if (error) throw new Error(`library: ${error.message}`);
      return (data ?? []) as unknown as LibraryRow[];
    },

    async askClaude(library, text) {
      const response = await new Anthropic().messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Lista:\n${library}\n\nPetición: ${text}` }],
        output_config: {
          effort: "low",
          format: { type: "json_schema", schema: ANSWER_SCHEMA },
        },
      });

      if (response.stop_reason !== "end_turn") {
        throw new Error(`Claude stop_reason=${response.stop_reason}`);
      }

      const output = response.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");
      const parsed = JSON.parse(output) as Partial<ClaudeAnswer>;
      const intencion: Intent =
        parsed.intencion === "recomendar" || parsed.intencion === "recordar" ? parsed.intencion : "otro";
      const ids = Array.isArray(parsed.ids) ? parsed.ids.filter(Number.isInteger) : [];
      return { intencion, ids };
    },
  };
}

export default {
  fetch(request: Request) {
    return handleSearch(request);
  },
};
