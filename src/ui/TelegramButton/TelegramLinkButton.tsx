import "./TelegramLinkButton.css";
import { useTelegramLink } from "./useTelegramLink";

export const TELEGRAM_LINK_ERROR =
  "No se pudo crear el enlace. Inténtalo de nuevo.";

export function TelegramLinkButton() {
  const { openTelegramLink, status } = useTelegramLink();

  return (
    <>
      <button
        type="button"
        onClick={openTelegramLink}
        disabled={status === "loading"}
        className="modern-button button-primary telegram-link-button"
      >
        📲 Vincular con Telegram
      </button>
      {status === "error" && (
        <p role="alert" className="telegram-link-error">
          {TELEGRAM_LINK_ERROR}
        </p>
      )}
    </>
  );
}
