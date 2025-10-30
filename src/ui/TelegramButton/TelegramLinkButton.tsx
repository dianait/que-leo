import "./TelegramLinkButton.css";

const TELEGRAM_BOT_USERNAME = "queleo_bot"; // replace with your bot if needed

export function TelegramLinkButton({ userId }: { userId: string }) {
  const telegramLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${userId}`;

  return (
    <a
      href={telegramLink}
      target="_blank"
      rel="noopener noreferrer"
      className="modern-button button-primary telegram-link-button"
    >
      📲 Vincular con Telegram
    </a>
  );
}
