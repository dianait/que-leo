import { AuthRepository } from "../../src/domain/AuthRepository";

export class AuthRepositoryMock implements AuthRepository {
  signInWithGitHubMock = jest.fn();
  signOutMock = jest.fn();

  async signInWithGitHub(): Promise<void> {
    this.signInWithGitHubMock();
  }

  async signOut(): Promise<void> {
    this.signOutMock();
  }
}
