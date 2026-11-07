export interface AuthRepository {
  signInWithGitHub(redirectTo?: string): Promise<void>;
  signInWithGoogle(redirectTo?: string): Promise<void>;
  signOut(): Promise<void>;
  /** Stores a one-time Telegram link code for the signed-in user. */
  saveTelegramLinkCode(code: string): Promise<void>;
}
