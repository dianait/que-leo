export type AddArticleFormState = {
  isModalOpen: boolean;
  title: string;
  url: string;
  loading: boolean;
  error: string;
  success: string;
};

export type AddArticleFormAction =
  | { type: "OPEN_MODAL" }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_FIELD"; field: "title" | "url"; value: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; payload: string }
  | { type: "DISMISS_AFTER_SUCCESS" };

export const initialAddArticleFormState: AddArticleFormState = {
  isModalOpen: false,
  title: "",
  url: "",
  loading: false,
  error: "",
  success: "",
};

export function addArticleFormReducer(
  state: AddArticleFormState,
  action: AddArticleFormAction
): AddArticleFormState {
  switch (action.type) {
    case "OPEN_MODAL":
      return { ...state, isModalOpen: true, error: "", success: "" };
    case "CLOSE_MODAL":
      return { ...state, isModalOpen: false, error: "", success: "" };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SUBMIT_START":
      return { ...state, loading: true, error: "", success: "" };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        loading: false,
        success: "¡Artículo añadido con éxito!",
        title: "",
        url: "",
        error: "",
      };
    case "SUBMIT_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "DISMISS_AFTER_SUCCESS":
      return { ...state, isModalOpen: false, success: "" };
    default:
      return state;
  }
}
