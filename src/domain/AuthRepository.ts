export interface AuthRepository {
  signInWithGitHub(): Promise<void>;
  signOut(): Promise<void>;
}
