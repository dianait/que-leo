import { useState, type FormEvent } from "react";
import "./AiSearch.css";
import { useAuth } from "../../domain/AuthContext";
import type { AiSearchOutcome } from "../../domain/AiSearch";
import { searchArticlesWithAi } from "../../infrastructure/services/AiSearchService";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; outcome: AiSearchOutcome };

const NO_RESULTS: Record<string, string> = {
  recomendar: "No tienes ningún artículo sin leer que encaje.",
  recordar: "No encuentro ningún artículo guardado que encaje.",
  otro: "Prueba con algo como «recomiéndame algo sobre tests» o «¿cómo era el que leí sobre SwiftUI?».",
};

export function AiSearch({ search = searchArticlesWithAi }: { search?: typeof searchArticlesWithAi }) {
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    if (!text || !session?.access_token || state.status === "loading") return;

    setState({ status: "loading" });
    setState({ status: "done", outcome: await search(text, session.access_token) });
  };

  const outcome = state.status === "done" ? state.outcome : null;

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

      {outcome && !outcome.ok && (
        <p className="ai-search-message" role="alert">
          {outcome.message}
        </p>
      )}

      {outcome?.ok && outcome.results.length === 0 && (
        <p className="ai-search-message">{NO_RESULTS[outcome.intent] ?? NO_RESULTS.otro}</p>
      )}

      {outcome?.ok && outcome.results.length > 0 && (
        <ol className="ai-search-results">
          {outcome.results.map((result) => (
            <li key={result.id} className="ai-search-result">
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="ai-search-result-title">
                {result.title ?? "(sin título)"}
              </a>
              {result.rating != null && <span className="ai-search-result-rating">{result.rating}/10</span>}
              {result.isRead && <span className="ai-search-result-read">leído</span>}
              <p className="ai-search-result-text">
                {outcome.intent === "recordar" ? (result.summary ?? result.reason) : (result.reason ?? result.summary)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
