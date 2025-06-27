// (Elimino la línea de importación de React)

const TELEGRAM_BOT_USERNAME = "queleo_bot"; // Cambia por el tuyo

export function TelegramLinkButton({ userId }: { userId: string }) {
  const telegramLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${userId}`;

  return (
    <a
      href={telegramLink}
      target="_blank"
      rel="noopener noreferrer"
      className="telegram-link-button"
      style={{
        display: "block",
        width: "100%",
        maxWidth: 520,
        background: "#229ED9",
        color: "white",
        padding: "0.8rem 0",
        borderRadius: 10,
        fontWeight: 700,
        textDecoration: "none",
        margin: "18px auto 0 auto",
        fontSize: "1.2rem",
        textAlign: "center",
        boxShadow: "0 2px 4px rgba(34,158,217,0.15)",
        letterSpacing: 0.5,
        transition: "background 0.2s",
      }}
    >
      📲 Vincular con Telegram
    </a>
  );
}
