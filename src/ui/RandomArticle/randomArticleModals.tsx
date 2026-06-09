import { useState, use, createContext } from "react";

type ModalState = {
  confirm: boolean;
  share: boolean;
  favorite: boolean;
  articleToDelete: number | null;
};

type ModalActions = {
  openConfirm: (articleId: number) => void;
  closeConfirm: () => void;
  openShare: () => void;
  closeShare: () => void;
  openFavorite: () => void;
  closeFavorite: () => void;
};

const ModalContext = createContext<
  { state: ModalState; actions: ModalActions } | undefined
>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>({
    confirm: false,
    share: false,
    favorite: false,
    articleToDelete: null,
  });
  const actions: ModalActions = {
    openConfirm: (articleId) =>
      setState((s) => ({
        ...s,
        confirm: true,
        articleToDelete: articleId,
      })),
    closeConfirm: () =>
      setState((s) => ({ ...s, confirm: false, articleToDelete: null })),
    openShare: () => setState((s) => ({ ...s, share: true })),
    closeShare: () => setState((s) => ({ ...s, share: false })),
    openFavorite: () => setState((s) => ({ ...s, favorite: true })),
    closeFavorite: () => setState((s) => ({ ...s, favorite: false })),
  };
  return (
    <ModalContext.Provider value={{ state, actions }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const ctx = use(ModalContext);
  if (!ctx) throw new Error("useModals must be used within ModalProvider");
  return ctx;
}
