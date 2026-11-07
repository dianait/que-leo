import { useState, type FormEvent } from "react";
import "./AiSearch.css";
import { useAuth } from "../../domain/AuthContext";
import type { AiSearchOutcome, AiSearchResult } from "../../domain/AiSearch";
import { searchArticlesWithAi } from "../../infrastructure/services/AiSearchService";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; outcome: AiSearchOutcome; shownInCardId: number | null };

const NO_RESULTS: Record<string, string> = {
  recomendar: "No tienes ningún artículo sin leer que encaje.",
  recordar: "No encuentro ningún artículo guardado que encaje.",
  otro: "Prueba con algo como «recomiéndame algo sobre tests» o «¿cómo era el que leí sobre SwiftUI?».",
};

type AiSearchProps = {
  search?: typeof searchArticlesWithAi;
  /** Puts the results in the main card (first shown, rest for "Dame otro"); false if it can't. */
  onShowResults?: (articleIds: number[]) => boolean;
  /** Puts one result in the main article card; returns false if it can't. */
  onShowArticle?: (articleId: number) => boolean;
};

export function AiSearch({ search = searchArticlesWithAi, onShowResults, onShowArticle }: AiSearchProps) {
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });

  const scrollToCard = () => window.scrollTo?.({ top: 0, behavior: "smooth" });

  const showInCard = (result: AiSearchResult): boolean => {
    if (!onShowArticle?.(result.articleId)) return false;
    scrollToCard();
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    if (!text || !session?.access_token || state.status === "loading") return;

    setState({ status: "loading" });
    const outcome = await search(text, session.access_token);
    const results = outcome.ok ? outcome.results : [];
    const shownInCard =
      results.length > 0 && Boolean(onShowResults?.(results.map((result) => result.articleId)));
    if (shownInCard) scrollToCard();
    const shownInCardId = shownInCard ? results[0].id : null;
    setState({ status: "done", outcome, shownInCardId });
  };

  const handleShowOther = (result: AiSearchResult) => {
    if (state.status === "done" && showInCard(result)) {
      setState({ ...state, shownInCardId: result.id });
    }
  };

  const outcome = state.status === "done" ? state.outcome : null;
  const shownInCardId = state.status === "done" ? state.shownInCardId : null;
  const listed = outcome?.ok ? outcome.results.filter((result) => result.id !== shownInCardId) : [];

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

      {shownInCardId !== null && (
        <p className="ai-search-message">
          ⬆️ Te he puesto arriba el que mejor encaja.
          {listed.length > 0 && " Con «Dame otro» verás los siguientes y, cuando se acaben, volveremos al azar."}
        </p>
      )}

      {outcome?.ok && listed.length > 0 && (
        <>
          {shownInCardId !== null && <p className="ai-search-subtitle">Otras opciones:</p>}
          <ol className="ai-search-results">
            {listed.map((result) => (
              <li key={result.id} className="ai-search-result">
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="ai-search-result-title">
                  {result.title ?? "(sin título)"}
                </a>
                {result.rating != null && <span className="ai-search-result-rating">{result.rating}/10</span>}
                {result.isRead && <span className="ai-search-result-read">leído</span>}
                <p className="ai-search-result-text">
                  {outcome.intent === "recordar" ? (result.summary ?? result.reason) : (result.reason ?? result.summary)}
                </p>
                {onShowArticle && (
                  <button type="button" className="ai-search-show" onClick={() => handleShowOther(result)}>
                    Ver en la tarjeta
                  </button>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
