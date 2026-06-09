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
