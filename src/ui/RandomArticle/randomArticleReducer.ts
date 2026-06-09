import type { Article } from "../../domain/Article";
import { pickRandomUnreadArticle } from "../../domain/Article";

export type PendingAction = "read" | "favorite" | null;

export type RandomArticleState = {
  articles: Article[];
  current: Article | null;
  loading: boolean;
  pendingAction: PendingAction;
};

export type RandomArticleAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Article[] }
  | { type: "FETCH_ERROR" }
  | { type: "RESET" }
  | { type: "PICK_RANDOM_UNREAD" }
  | { type: "UPDATE_ARTICLE"; payload: Article }
  | { type: "REMOVE_ARTICLE"; payload: number }
  | { type: "SET_PENDING"; payload: PendingAction };

export const initialRandomArticleState: RandomArticleState = {
  articles: [],
  current: null,
  loading: true,
  pendingAction: null,
};

function resolveCurrentAfterFetch(
  articles: Article[],
  previous: Article | null
): Article | null {
  if (previous) {
    const updated = articles.find(
      (article) => Number(article.id) === Number(previous.id)
    );
    return updated ?? pickRandomUnreadArticle(articles);
  }
  return pickRandomUnreadArticle(articles);
}

export function randomArticleReducer(
  state: RandomArticleState,
  action: RandomArticleAction
): RandomArticleState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true };
    case "FETCH_SUCCESS": {
      const articles = action.payload;
      return {
        ...state,
        articles,
        loading: false,
        current: resolveCurrentAfterFetch(articles, state.current),
      };
    }
    case "FETCH_ERROR":
      return { ...state, loading: false };
    case "RESET":
      return initialRandomArticleState;
    case "PICK_RANDOM_UNREAD":
      return {
        ...state,
        current: pickRandomUnreadArticle(state.articles),
      };
    case "UPDATE_ARTICLE": {
      const article = action.payload;
      const articleId = Number(article.id);
      return {
        ...state,
        articles: state.articles.map((item) =>
          Number(item.id) === articleId ? article : item
        ),
        current:
          state.current && Number(state.current.id) === articleId
            ? article
            : state.current,
      };
    }
    case "REMOVE_ARTICLE": {
      const articles = state.articles.filter(
        (item) => Number(item.id) !== action.payload
      );
      const currentWasRemoved =
        state.current !== null &&
        Number(state.current.id) === action.payload;
      return {
        ...state,
        articles,
        current: currentWasRemoved
          ? pickRandomUnreadArticle(articles)
          : state.current,
      };
    }
    case "SET_PENDING":
      return { ...state, pendingAction: action.payload };
    default:
      return state;
  }
}
