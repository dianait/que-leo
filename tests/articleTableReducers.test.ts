import type { Article } from "../src/domain/Article";

// Importar los reducers desde ArticleTable
// Como están definidos dentro del componente, necesitamos extraerlos o testearlos indirectamente
// Por ahora, vamos a crear tests unitarios directos copiando la lógica

type ArticlesState = {
  articles: Article[];
  total: number;
  page: number;
  allArticles: Article[];
  loading: boolean;
};

type ArticlesAction =
  | { type: "SET_ARTICLES"; payload: { articles: Article[]; total: number } }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_ALL_ARTICLES"; payload: Article[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "UPDATE_ARTICLE"; payload: { id: number; updates: Partial<Article> } }
  | { type: "REMOVE_ARTICLE"; payload: number };

function articlesReducer(
  state: ArticlesState,
  action: ArticlesAction
): ArticlesState {
  switch (action.type) {
    case "SET_ARTICLES":
      return {
        ...state,
        articles: action.payload.articles,
        total: action.payload.total,
        loading: false,
      };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_ALL_ARTICLES":
      return { ...state, allArticles: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "UPDATE_ARTICLE": {
      const updateArticle = (articles: Article[]) =>
        articles.map((a) =>
          Number(a.id) === action.payload.id
            ? { ...a, ...action.payload.updates }
            : a
        );
      return {
        ...state,
        articles: updateArticle(state.articles),
        allArticles:
          state.allArticles.length > 0
            ? updateArticle(state.allArticles)
            : state.allArticles,
      };
    }
    case "REMOVE_ARTICLE":
      return {
        ...state,
        articles: state.articles.filter(
          (a) => Number(a.id) !== action.payload
        ),
        allArticles: state.allArticles.filter(
          (a) => Number(a.id) !== action.payload
        ),
      };
    default:
      return state;
  }
}

type FiltersState = {
  readFilter: "all" | "unread" | "read";
  favoriteFilter: "all" | "favorites";
  searchTerm: string;
  isSearching: boolean;
};

type FiltersAction =
  | { type: "SET_READ_FILTER"; payload: "all" | "unread" | "read" }
  | { type: "SET_FAVORITE_FILTER"; payload: "all" | "favorites" }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_IS_SEARCHING"; payload: boolean }
  | { type: "RESET_FILTERS" };

function filtersReducer(
  state: FiltersState,
  action: FiltersAction
): FiltersState {
  switch (action.type) {
    case "SET_READ_FILTER":
      return { ...state, readFilter: action.payload };
    case "SET_FAVORITE_FILTER":
      return { ...state, favoriteFilter: action.payload };
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };
    case "SET_IS_SEARCHING":
      return { ...state, isSearching: action.payload };
    case "RESET_FILTERS":
      return {
        readFilter: "all",
        favoriteFilter: "all",
        searchTerm: "",
        isSearching: false,
      };
    default:
      return state;
  }
}

type UIState = {
  modalOpen: boolean;
  articleToDelete: number | null;
  toast: boolean;
  showShareModal: boolean;
  lastReadArticle: Article | null;
};

type UIAction =
  | { type: "OPEN_DELETE_MODAL"; payload: number }
  | { type: "CLOSE_DELETE_MODAL" }
  | { type: "SHOW_TOAST" }
  | { type: "HIDE_TOAST" }
  | { type: "SHOW_SHARE_MODAL"; payload: Article }
  | { type: "CLOSE_SHARE_MODAL" };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "OPEN_DELETE_MODAL":
      return {
        ...state,
        modalOpen: true,
        articleToDelete: action.payload,
      };
    case "CLOSE_DELETE_MODAL":
      return {
        ...state,
        modalOpen: false,
        articleToDelete: null,
      };
    case "SHOW_TOAST":
      return { ...state, toast: true };
    case "HIDE_TOAST":
      return { ...state, toast: false };
    case "SHOW_SHARE_MODAL":
      return {
        ...state,
        showShareModal: true,
        lastReadArticle: action.payload,
      };
    case "CLOSE_SHARE_MODAL":
      return {
        ...state,
        showShareModal: false,
        lastReadArticle: null,
      };
    default:
      return state;
  }
}

describe("ArticleTable Reducers", () => {
  describe("articlesReducer", () => {
    const initialState: ArticlesState = {
      articles: [],
      total: 0,
      page: 1,
      allArticles: [],
      loading: false,
    };

    const mockArticle: Article = {
      id: 1,
      title: "Test Article",
      url: "https://example.com",
      isRead: false,
      dateAdded: new Date(),
    };

    it("SET_ARTICLES actualiza articles, total y loading", () => {
      const action = {
        type: "SET_ARTICLES" as const,
        payload: { articles: [mockArticle], total: 1 },
      };
      const result = articlesReducer(initialState, action);
      expect(result.articles).toEqual([mockArticle]);
      expect(result.total).toBe(1);
      expect(result.loading).toBe(false);
    });

    it("SET_PAGE actualiza la página", () => {
      const action = { type: "SET_PAGE" as const, payload: 2 };
      const result = articlesReducer(initialState, action);
      expect(result.page).toBe(2);
    });

    it("SET_ALL_ARTICLES actualiza allArticles", () => {
      const action = {
        type: "SET_ALL_ARTICLES" as const,
        payload: [mockArticle],
      };
      const result = articlesReducer(initialState, action);
      expect(result.allArticles).toEqual([mockArticle]);
    });

    it("SET_LOADING actualiza loading", () => {
      const action = { type: "SET_LOADING" as const, payload: true };
      const result = articlesReducer(initialState, action);
      expect(result.loading).toBe(true);
    });

    it("UPDATE_ARTICLE actualiza un artículo en articles", () => {
      const state = {
        ...initialState,
        articles: [mockArticle],
      };
      const action = {
        type: "UPDATE_ARTICLE" as const,
        payload: { id: 1, updates: { isRead: true } },
      };
      const result = articlesReducer(state, action);
      expect(result.articles[0].isRead).toBe(true);
    });

    it("UPDATE_ARTICLE actualiza un artículo en allArticles si existe", () => {
      const state = {
        ...initialState,
        articles: [mockArticle],
        allArticles: [mockArticle],
      };
      const action = {
        type: "UPDATE_ARTICLE" as const,
        payload: { id: 1, updates: { isFavorite: true } },
      };
      const result = articlesReducer(state, action);
      expect(result.allArticles[0].isFavorite).toBe(true);
      expect(result.articles[0].isFavorite).toBe(true);
    });

    it("UPDATE_ARTICLE no modifica allArticles si está vacío", () => {
      const state = {
        ...initialState,
        articles: [mockArticle],
        allArticles: [],
      };
      const action = {
        type: "UPDATE_ARTICLE" as const,
        payload: { id: 1, updates: { isRead: true } },
      };
      const result = articlesReducer(state, action);
      expect(result.allArticles).toEqual([]);
      expect(result.articles[0].isRead).toBe(true);
    });

    it("REMOVE_ARTICLE elimina un artículo de articles y allArticles", () => {
      const state = {
        ...initialState,
        articles: [mockArticle],
        allArticles: [mockArticle],
      };
      const action = { type: "REMOVE_ARTICLE" as const, payload: 1 };
      const result = articlesReducer(state, action);
      expect(result.articles).toEqual([]);
      expect(result.allArticles).toEqual([]);
    });

    it("devuelve el estado sin cambios para acción desconocida", () => {
      const action = { type: "UNKNOWN" } as any;
      const result = articlesReducer(initialState, action);
      expect(result).toEqual(initialState);
    });
  });

  describe("filtersReducer", () => {
    const initialState: FiltersState = {
      readFilter: "all",
      favoriteFilter: "all",
      searchTerm: "",
      isSearching: false,
    };

    it("SET_READ_FILTER actualiza readFilter", () => {
      const action: FiltersAction = {
        type: "SET_READ_FILTER",
        payload: "read",
      };
      const result = filtersReducer(initialState, action);
      expect(result.readFilter).toBe("read");
    });

    it("SET_FAVORITE_FILTER actualiza favoriteFilter", () => {
      const action: FiltersAction = {
        type: "SET_FAVORITE_FILTER",
        payload: "favorites",
      };
      const result = filtersReducer(initialState, action);
      expect(result.favoriteFilter).toBe("favorites");
    });

    it("SET_SEARCH_TERM actualiza searchTerm", () => {
      const action = {
        type: "SET_SEARCH_TERM" as const,
        payload: "test search",
      };
      const result = filtersReducer(initialState, action);
      expect(result.searchTerm).toBe("test search");
    });

    it("SET_IS_SEARCHING actualiza isSearching", () => {
      const action = { type: "SET_IS_SEARCHING" as const, payload: true };
      const result = filtersReducer(initialState, action);
      expect(result.isSearching).toBe(true);
    });

    it("RESET_FILTERS resetea todos los filtros", () => {
      const state = {
        readFilter: "read" as const,
        favoriteFilter: "favorites" as const,
        searchTerm: "test",
        isSearching: true,
      };
      const action = { type: "RESET_FILTERS" as const };
      const result = filtersReducer(state, action);
      expect(result.readFilter).toBe("all");
      expect(result.favoriteFilter).toBe("all");
      expect(result.searchTerm).toBe("");
      expect(result.isSearching).toBe(false);
    });

    it("devuelve el estado sin cambios para acción desconocida", () => {
      const action = { type: "UNKNOWN" } as any;
      const result = filtersReducer(initialState, action);
      expect(result).toEqual(initialState);
    });
  });

  describe("uiReducer", () => {
    const initialState: UIState = {
      modalOpen: false,
      articleToDelete: null,
      toast: false,
      showShareModal: false,
      lastReadArticle: null,
    };

    const mockArticle: Article = {
      id: 1,
      title: "Test Article",
      url: "https://example.com",
      isRead: false,
      dateAdded: new Date(),
    };

    it("OPEN_DELETE_MODAL abre el modal y guarda el ID", () => {
      const action = { type: "OPEN_DELETE_MODAL" as const, payload: 123 };
      const result = uiReducer(initialState, action);
      expect(result.modalOpen).toBe(true);
      expect(result.articleToDelete).toBe(123);
    });

    it("CLOSE_DELETE_MODAL cierra el modal y limpia el ID", () => {
      const state = {
        ...initialState,
        modalOpen: true,
        articleToDelete: 123,
      };
      const action = { type: "CLOSE_DELETE_MODAL" as const };
      const result = uiReducer(state, action);
      expect(result.modalOpen).toBe(false);
      expect(result.articleToDelete).toBe(null);
    });

    it("SHOW_TOAST muestra el toast", () => {
      const action = { type: "SHOW_TOAST" as const };
      const result = uiReducer(initialState, action);
      expect(result.toast).toBe(true);
    });

    it("HIDE_TOAST oculta el toast", () => {
      const state = { ...initialState, toast: true };
      const action = { type: "HIDE_TOAST" as const };
      const result = uiReducer(state, action);
      expect(result.toast).toBe(false);
    });

    it("SHOW_SHARE_MODAL muestra el modal y guarda el artículo", () => {
      const action = {
        type: "SHOW_SHARE_MODAL" as const,
        payload: mockArticle,
      };
      const result = uiReducer(initialState, action);
      expect(result.showShareModal).toBe(true);
      expect(result.lastReadArticle).toEqual(mockArticle);
    });

    it("CLOSE_SHARE_MODAL cierra el modal y limpia el artículo", () => {
      const state = {
        ...initialState,
        showShareModal: true,
        lastReadArticle: mockArticle,
      };
      const action = { type: "CLOSE_SHARE_MODAL" as const };
      const result = uiReducer(state, action);
      expect(result.showShareModal).toBe(false);
      expect(result.lastReadArticle).toBe(null);
    });

    it("devuelve el estado sin cambios para acción desconocida", () => {
      const action = { type: "UNKNOWN" } as any;
      const result = uiReducer(initialState, action);
      expect(result).toEqual(initialState);
    });
  });
});

