import { useCallback, useState } from "react";
import { useAuth } from "../../domain/AuthContext";

export type TelegramLinkStatus = "idle" | "loading" | "error";

/**
 * Opens the bot with a fresh one-time link code for the signed-in user.
 */
export function useTelegramLink() {
  const { createTelegramLink } = useAuth();
  const [status, setStatus] = useState<TelegramLinkStatus>("idle");

  const openTelegramLink = useCallback(async () => {
    setStatus("loading");
    // Open the tab during the click: browsers block tabs opened after an await.
    const tab = window.open("about:blank", "_blank");

    try {
      const url = await createTelegramLink();
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.location.href = url;
      }
      setStatus("idle");
    } catch (error) {
      tab?.close();
      console.error(error);
      setStatus("error");
    }
  }, [createTelegramLink]);

  return { openTelegramLink, status };
}
