import { AuthRepository } from "../../src/domain/AuthRepository";

export class AuthRepositoryMock implements AuthRepository {
  signInWithGitHubMock = jest.fn();
  signInWithGoogleMock = jest.fn();
  signOutMock = jest.fn();

  async signInWithGitHub(): Promise<void> {
    this.signInWithGitHubMock();
  }

  async signInWithGoogle(): Promise<void> {
    this.signInWithGoogleMock();
  }

  async signOut(): Promise<void> {
    this.signOutMock();
  }
}
