export interface AuthRepository {
  signInWithGitHub(redirectTo?: string): Promise<void>;
  signInWithGoogle(redirectTo?: string): Promise<void>;
  signOut(): Promise<void>;
}
