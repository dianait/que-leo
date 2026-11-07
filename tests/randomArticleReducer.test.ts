import type { Article } from "../src/domain/Article";
import { pickRandomUnreadArticle } from "../src/domain/Article";
import {
  initialRandomArticleState,
  randomArticleReducer,
} from "../src/ui/RandomArticle/randomArticleReducer";

const article = (id: number, isRead: boolean): Article =>
  ({
    id,
    title: `Article ${id}`,
    url: `https://example.com/${id}`,
    dateAdded: new Date(),
    isRead,
  }) as Article;

describe("pickRandomUnreadArticle", () => {
  it("returns null when all articles are read", () => {
    expect(
      pickRandomUnreadArticle([article(1, true), article(2, true)])
    ).toBeNull();
  });

  it("returns an unread article when available", () => {
    const unread = article(2, false);
    const result = pickRandomUnreadArticle([article(1, true), unread]);
    expect(result).toEqual(unread);
  });
});

describe("randomArticleReducer", () => {
  it("picks a random unread article after fetch when none is selected", () => {
    const unread = article(2, false);
    const next = randomArticleReducer(initialRandomArticleState, {
      type: "FETCH_SUCCESS",
      payload: [article(1, true), unread],
    });

    expect(next.loading).toBe(false);
    expect(next.current).toEqual(unread);
  });

  it("selects another unread article after deleting the current one", () => {
    const current = article(1, false);
    const remaining = article(2, false);
    const state = {
      ...initialRandomArticleState,
      articles: [current, remaining],
      current,
      loading: false,
    };

    const next = randomArticleReducer(state, {
      type: "REMOVE_ARTICLE",
      payload: 1,
    });

    expect(next.articles).toHaveLength(1);
    expect(next.current).toEqual(remaining);
  });

  it("tracks pending actions separately from article data", () => {
    const pending = randomArticleReducer(initialRandomArticleState, {
      type: "SET_PENDING",
      payload: "read",
    });
    expect(pending.pendingAction).toBe("read");

    const cleared = randomArticleReducer(pending, {
      type: "SET_PENDING",
      payload: null,
    });
    expect(cleared.pendingAction).toBeNull();
  });
});

describe("randomArticleReducer: SHOW_ARTICLE", () => {
  const make = (id: number, title: string): Article => ({
    id,
    title,
    url: `https://example.com/${id}`,
    dateAdded: new Date(),
    isRead: false,
  });

  test("pone en la tarjeta el artículo pedido", () => {
    const state = { ...initialRandomArticleState, articles: [make(1, "A"), make(2, "B")], current: make(1, "A"), loading: false };

    expect(randomArticleReducer(state, { type: "SHOW_ARTICLE", payload: 2 }).current?.title).toBe("B");
  });

  test("si el artículo no está cargado, no cambia nada", () => {
    const state = { ...initialRandomArticleState, articles: [make(1, "A")], current: make(1, "A"), loading: false };

    expect(randomArticleReducer(state, { type: "SHOW_ARTICLE", payload: 99 })).toBe(state);
  });
});

describe("randomArticleReducer: Dame otro después de una búsqueda", () => {
  const make = (id: number, title: string): Article => ({
    id,
    title,
    url: `https://example.com/${id}`,
    dateAdded: new Date(),
    isRead: false,
  });
  const base = {
    ...initialRandomArticleState,
    articles: [make(1, "A"), make(2, "B"), make(3, "C"), make(4, "D")],
    current: make(4, "D"),
    loading: false,
  };

  test("muestra el primer resultado y Dame otro recorre los siguientes", () => {
    let state = randomArticleReducer(base, { type: "SHOW_SEARCH_RESULTS", payload: [2, 99, 3] });
    expect(state.current?.title).toBe("B");

    state = randomArticleReducer(state, { type: "PICK_RANDOM_UNREAD" });
    expect(state.current?.title).toBe("C");
    expect(state.searchQueue).toEqual([]);
  });

  test("cuando se acaban los resultados, vuelve al azar", () => {
    let state = randomArticleReducer(base, { type: "SHOW_SEARCH_RESULTS", payload: [2] });
    state = randomArticleReducer(state, { type: "PICK_RANDOM_UNREAD" });

    expect(state.current).not.toBeNull();
    expect(state.searchQueue).toEqual([]);
  });

  test("Ver en la tarjeta saca ese artículo de la cola", () => {
    let state = randomArticleReducer(base, { type: "SHOW_SEARCH_RESULTS", payload: [1, 2, 3] });
    state = randomArticleReducer(state, { type: "SHOW_ARTICLE", payload: 3 });

    expect(state.current?.title).toBe("C");
    expect(state.searchQueue).toEqual([2]);
  });

  test("si ningún resultado está cargado, no cambia nada", () => {
    expect(randomArticleReducer(base, { type: "SHOW_SEARCH_RESULTS", payload: [99] })).toBe(base);
  });
});
