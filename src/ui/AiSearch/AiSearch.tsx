import { useState, type FormEvent } from "react";
import "./AiSearch.css";
import { useAuth } from "../../domain/AuthContext";
import { searchArticlesWithAi } from "../../infrastructure/services/AiSearchService";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; message: string; tone: "found" | "info" | "error" };

const NO_RESULTS: Record<string, string> = {
  recomendar: "No tienes ningún artículo sin leer que encaje. ¡Prueba con otro tema!",
  recordar: "No encuentro ningún artículo guardado que encaje.",
  otro: "Prueba con algo como «recomiéndame algo sobre tests» o «¿cómo era el que leí sobre SwiftUI?».",
};

type AiSearchProps = {
  search?: typeof searchArticlesWithAi;
  /** Puts the results in the article card (best first, rest for "Dame otro"); false if it can't. */
  onShowResults: (articleIds: number[]) => boolean;
};

export function AiSearch({ search = searchArticlesWithAi, onShowResults }: AiSearchProps) {
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    if (!text || !session?.access_token || state.status === "loading") return;

    setState({ status: "loading" });
    const outcome = await search(text, session.access_token);

    if (!outcome.ok) {
      setState({ status: "done", message: outcome.message, tone: "error" });
      return;
    }

    const ids = outcome.results.map((result) => result.articleId);
    if (ids.length === 0 || !onShowResults(ids)) {
      setState({ status: "done", message: NO_RESULTS[outcome.intent] ?? NO_RESULTS.otro, tone: "info" });
      return;
    }

    setState({
      status: "done",
      tone: "found",
      message:
        ids.length > 1
          ? "🎯 ¡Encontrado! Con «Dame otro» verás el siguiente de este tema y, cuando se acaben, volveremos al azar."
          : "🎯 ¡Encontrado!",
    });
  };

  return (
    <section className="ai-search" aria-labelledby="ai-search-title">
      <h3 id="ai-search-title" className="ai-search-title">
        ¿No te convence? Pídeme un tema y te busco entre lo que tienes
      </h3>
      <form className="ai-search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="ai-search-input"
          placeholder="«algo cortito de SwiftUI», «el que leí sobre hooks»…"
          value={query}
          maxLength={300}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Pregúntale a la IA por tus artículos"
        />
        <button type="submit" className="ai-search-button" disabled={state.status === "loading" || !query.trim()}>
          {state.status === "loading" ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {state.status === "done" && (
        <p
          key={state.message}
          className={`ai-search-message ai-search-message--${state.tone}`}
          role={state.tone === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      )}
    </section>
  );
}
