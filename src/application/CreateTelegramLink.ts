import type { AuthRepository } from "../domain/AuthRepository";

export const TELEGRAM_BOT_USERNAME = "queleo_bot";

const LINK_CODE_BYTES = 18;

/**
 * Random, URL-safe code. Telegram's /start parameter only accepts
 * A-Z, a-z, 0-9, "_" and "-".
 */
export function generateLinkCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(LINK_CODE_BYTES));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Builds the bot link that links Telegram to the signed-in account. The bot
 * accepts the code once, within 15 minutes; it no longer accepts raw user ids,
 * which anyone could have used to take over someone else's account.
 */
export class CreateTelegramLink {
  private readonly repository: AuthRepository;
  private readonly generateCode: () => string;

  constructor(
    repository: AuthRepository,
    generateCode: () => string = generateLinkCode
  ) {
    this.repository = repository;
    this.generateCode = generateCode;
  }

  async execute(): Promise<string> {
    const code = this.generateCode();
    await this.repository.saveTelegramLinkCode(code);
    return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${code}`;
  }
}
