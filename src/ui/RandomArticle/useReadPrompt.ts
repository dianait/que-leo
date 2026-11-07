import { useCallback, useEffect, useState } from "react";
import type { Article } from "../../domain/Article";

/**
 * After the reader opens an article in a new tab and comes back, ask once
 * whether they read it — otherwise nobody remembers the 📖 button.
 */
export function useReadPrompt(article: Article | null) {
  const [openedId, setOpenedId] = useState<Article["id"] | null>(null);
  const [visible, setVisible] = useState(false);

  const articleId = article?.id ?? null;
  const isRead = article?.isRead ?? false;

  // New article on the card: forget the previous one.
  useEffect(() => {
    setOpenedId(null);
    setVisible(false);
  }, [articleId]);

  useEffect(() => {
    if (isRead) setVisible(false);
  }, [isRead]);

  useEffect(() => {
    if (openedId === null) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && openedId === articleId && !isRead) {
        setVisible(true);
        setOpenedId(null);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [openedId, articleId, isRead]);

  const notifyOpened = useCallback(() => {
    if (articleId !== null && !isRead) setOpenedId(articleId);
  }, [articleId, isRead]);

  const dismiss = useCallback(() => setVisible(false), []);

  return { visible, notifyOpened, dismiss };
}
