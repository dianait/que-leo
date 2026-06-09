import {
  addArticleFormReducer,
  initialAddArticleFormState,
} from "../src/ui/AddArticle/addArticleFormReducer";

describe("addArticleFormReducer", () => {
  it("opens modal and clears feedback messages", () => {
    const state = {
      ...initialAddArticleFormState,
      error: "previous error",
      success: "previous success",
    };

    const next = addArticleFormReducer(state, { type: "OPEN_MODAL" });

    expect(next.isModalOpen).toBe(true);
    expect(next.error).toBe("");
    expect(next.success).toBe("");
  });

  it("tracks submit lifecycle", () => {
    const started = addArticleFormReducer(
      { ...initialAddArticleFormState, isModalOpen: true, url: "https://a.com" },
      { type: "SUBMIT_START" }
    );
    expect(started.loading).toBe(true);
    expect(started.error).toBe("");

    const succeeded = addArticleFormReducer(started, { type: "SUBMIT_SUCCESS" });
    expect(succeeded.loading).toBe(false);
    expect(succeeded.success).toBe("¡Artículo añadido con éxito!");
    expect(succeeded.url).toBe("");
    expect(succeeded.title).toBe("");

    const dismissed = addArticleFormReducer(succeeded, {
      type: "DISMISS_AFTER_SUCCESS",
    });
    expect(dismissed.isModalOpen).toBe(false);
    expect(dismissed.success).toBe("");
  });

  it("stores submit errors without closing the modal", () => {
    const next = addArticleFormReducer(
      { ...initialAddArticleFormState, isModalOpen: true, loading: true },
      { type: "SUBMIT_ERROR", payload: "Error de base de datos" }
    );

    expect(next.loading).toBe(false);
    expect(next.error).toBe("Error de base de datos");
    expect(next.isModalOpen).toBe(true);
  });
});
