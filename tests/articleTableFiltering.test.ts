import type { Article } from "../src/domain/Article";
import { sortArticlesByAiRating } from "../src/domain/Article";
import type { FiltersState } from "../src/ui/ListOfArticles/articleTableReducers";
import {
  hasActiveTableFilters,
  needsAllArticlesForFilters,
  filterArticlesBySearch,
  filterArticlesByStatus,
  paginateArticles,
  computeEffectiveTotal,
  buildDisplayedArticles,
} from "../src/ui/ListOfArticles/articleTableFiltering";

const baseFilters: FiltersState = {
  readFilter: "all",
  favoriteFilter: "all",
  searchTerm: "",
  isSearching: false,
};

const mockArticles: Article[] = [
  {
    id: 1,
    title: "React Hooks Tutorial",
    url: "https://example.com/react-hooks",
    isRead: false,
    dateAdded: new Date(),
  },
  {
    id: 2,
    title: "TypeScript Best Practices",
    url: "https://example.com/typescript",
    isRead: true,
    isFavorite: true,
    dateAdded: new Date(),
  },
  {
    id: 3,
    title: "CSS Grid Layout Guide",
    url: "https://example.com/css-grid",
    isRead: false,
    dateAdded: new Date(),
  },
  {
    id: 4,
    title: "JavaScript Async/Await",
    url: "https://example.com/async-await",
    isRead: false,
    dateAdded: new Date(),
  },
];

describe("articleTableFiltering", () => {
  describe("hasActiveTableFilters", () => {
    it("returns false when all filters are default", () => {
      expect(hasActiveTableFilters(baseFilters)).toBe(false);
    });

    it("returns true when read filter is not all", () => {
      expect(
        hasActiveTableFilters({ ...baseFilters, readFilter: "unread" })
      ).toBe(true);
    });

    it("returns true when favorite filter is favorites", () => {
      expect(
        hasActiveTableFilters({ ...baseFilters, favoriteFilter: "favorites" })
      ).toBe(true);
    });
  });

  describe("needsAllArticlesForFilters", () => {
    it("returns false without search or active filters", () => {
      expect(needsAllArticlesForFilters(baseFilters)).toBe(false);
    });

    it("returns true when search term is present", () => {
      expect(
        needsAllArticlesForFilters({ ...baseFilters, searchTerm: "react" })
      ).toBe(true);
    });
  });

  describe("filterArticlesBySearch", () => {
    it("filters by title case-insensitively", () => {
      const result = filterArticlesBySearch(mockArticles, "react");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("React Hooks Tutorial");
    });

    it("returns all articles when search term is empty", () => {
      expect(filterArticlesBySearch(mockArticles, "")).toEqual(mockArticles);
    });

    it("returns empty array when no match", () => {
      expect(filterArticlesBySearch(mockArticles, "python")).toEqual([]);
    });
  });

  describe("filterArticlesByStatus", () => {
    it("filters unread articles", () => {
      const result = filterArticlesByStatus(mockArticles, {
        ...baseFilters,
        readFilter: "unread",
      });
      expect(result.every((a) => !a.isRead)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it("filters read articles", () => {
      const result = filterArticlesByStatus(mockArticles, {
        ...baseFilters,
        readFilter: "read",
      });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("TypeScript Best Practices");
    });

    it("filters favorites", () => {
      const result = filterArticlesByStatus(mockArticles, {
        ...baseFilters,
        favoriteFilter: "favorites",
      });
      expect(result).toHaveLength(1);
      expect(result[0].isFavorite).toBe(true);
    });
  });

  describe("paginateArticles", () => {
    it("returns correct page slice", () => {
      const page1 = paginateArticles(mockArticles, 1, 2);
      expect(page1).toHaveLength(2);
      expect(page1[0].id).toBe(1);

      const page2 = paginateArticles(mockArticles, 2, 2);
      expect(page2).toHaveLength(2);
      expect(page2[0].id).toBe(3);
    });
  });

  describe("computeEffectiveTotal", () => {
    it("uses filtered count when all articles are needed", () => {
      expect(computeEffectiveTotal(true, 5, 100)).toBe(5);
    });

    it("uses server total when paginated", () => {
      expect(computeEffectiveTotal(false, 5, 100)).toBe(100);
    });
  });

  describe("buildDisplayedArticles", () => {
    it("paginates client-side when filters are active", () => {
      const result = buildDisplayedArticles(
        {
          articles: mockArticles.slice(0, 2),
          total: 4,
          page: 1,
          allArticles: mockArticles,
          loading: false,
        },
        { ...baseFilters, searchTerm: "script" },
        2
      );

      expect(result.needsAllArticles).toBe(true);
      expect(result.filteredArticles).toHaveLength(2);
      expect(result.displayedArticles).toHaveLength(2);
      expect(result.effectiveTotal).toBe(2);
    });

    it("uses server page when no filters are active", () => {
      const pageArticles = mockArticles.slice(0, 2);
      const result = buildDisplayedArticles(
        {
          articles: pageArticles,
          total: 4,
          page: 1,
          allArticles: [],
          loading: false,
        },
        baseFilters,
        2
      );

      expect(result.needsAllArticles).toBe(false);
      expect(result.displayedArticles).toEqual(
        sortArticlesByAiRating(pageArticles, false)
      );
      expect(result.effectiveTotal).toBe(4);
    });
  });
});
