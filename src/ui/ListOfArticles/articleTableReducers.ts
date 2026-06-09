import type { Article } from "../../domain/Article";

export type ArticlesState = {
  articles: Article[];
  total: number;
  page: number;
  allArticles: Article[];
  loading: boolean;
};

export type ArticlesAction =
  | { type: "SET_ARTICLES"; payload: { articles: Article[]; total: number } }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_ALL_ARTICLES"; payload: Article[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "UPDATE_ARTICLE"; payload: { id: number; updates: Partial<Article> } }
  | { type: "REMOVE_ARTICLE"; payload: number };

export const initialArticlesState: ArticlesState = {
  articles: [],
  total: 0,
  page: 1,
  allArticles: [],
  loading: true,
};

export function articlesReducer(
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

export type FiltersState = {
  readFilter: "all" | "unread" | "read";
  favoriteFilter: "all" | "favorites";
  searchTerm: string;
  isSearching: boolean;
};

export type FiltersAction =
  | { type: "SET_READ_FILTER"; payload: "all" | "unread" | "read" }
  | { type: "SET_FAVORITE_FILTER"; payload: "all" | "favorites" }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_IS_SEARCHING"; payload: boolean }
  | { type: "RESET_FILTERS" };

export const initialFiltersState: FiltersState = {
  readFilter: "all",
  favoriteFilter: "all",
  searchTerm: "",
  isSearching: false,
};

export function filtersReducer(
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

export type UIState = {
  modalOpen: boolean;
  articleToDelete: number | null;
  toast: boolean;
  showShareModal: boolean;
  lastReadArticle: Article | null;
};

export type UIAction =
  | { type: "OPEN_DELETE_MODAL"; payload: number }
  | { type: "CLOSE_DELETE_MODAL" }
  | { type: "SHOW_TOAST" }
  | { type: "HIDE_TOAST" }
  | { type: "SHOW_SHARE_MODAL"; payload: Article }
  | { type: "CLOSE_SHARE_MODAL" };

export const initialUIState: UIState = {
  modalOpen: false,
  articleToDelete: null,
  toast: false,
  showShareModal: false,
  lastReadArticle: null,
};

export function uiReducer(state: UIState, action: UIAction): UIState {
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
