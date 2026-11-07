import type { AiSearchOutcome } from "../../domain/AiSearch";

const GENERIC_ERROR = "No se ha podido buscar ahora mismo. Inténtalo en un rato.";

/**
 * Calls the Vercel function `api/search.ts`, which asks Claude using the
 * user's own session: the server only reads this user's articles.
 */
export async function searchArticlesWithAi(
  text: string,
  accessToken: string,
  fetchFn: typeof fetch = fetch
): Promise<AiSearchOutcome> {
  try {
    const response = await fetchFn("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { ok: false, message: typeof body.message === "string" ? body.message : GENERIC_ERROR };
    }

    return { ok: true, intent: body.intent ?? "otro", results: Array.isArray(body.results) ? body.results : [] };
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }
}
