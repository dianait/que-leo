import type { Article } from "../src/domain/Article";
import { sortArticlesByAiRating } from "../src/domain/Article";

const baseArticle = (overrides: Partial<Article>): Article =>
  ({
    id: 1,
    title: "Test",
    url: "https://example.com",
    dateAdded: new Date("2024-01-01"),
    isRead: false,
    ...overrides,
  }) as Article;

describe("sortArticlesByAiRating", () => {
  it("orders articles by ai rating descending", () => {
    const articles = [
      baseArticle({ id: 1, title: "Low", aiRating: 3 }),
      baseArticle({ id: 2, title: "High", aiRating: 9 }),
      baseArticle({ id: 3, title: "Mid", aiRating: 6 }),
    ];

    const sorted = sortArticlesByAiRating(articles);

    expect(sorted.map((a) => a.title)).toEqual(["High", "Mid", "Low"]);
  });

  it("places articles without rating after rated ones", () => {
    const articles = [
      baseArticle({ id: 1, title: "No rating" }),
      baseArticle({ id: 2, title: "Rated", aiRating: 7 }),
      baseArticle({ id: 3, title: "Also no rating" }),
    ];

    const sorted = sortArticlesByAiRating(articles);

    expect(sorted[0].title).toBe("Rated");
    expect(sorted.slice(1).map((a) => a.title)).toEqual([
      "No rating",
      "Also no rating",
    ]);
  });

  it("uses read date as tie-breaker when secondaryByReadAt is true", () => {
    const articles = [
      baseArticle({
        id: 1,
        title: "Older read",
        aiRating: 8,
        readAt: new Date("2024-01-01"),
      }),
      baseArticle({
        id: 2,
        title: "Recent read",
        aiRating: 8,
        readAt: new Date("2024-06-01"),
      }),
    ];

    const sorted = sortArticlesByAiRating(articles, true);

    expect(sorted.map((a) => a.title)).toEqual(["Recent read", "Older read"]);
  });
});
