import type { AuthRepository } from "../domain/AuthRepository";

export class SignInWithGitHub {
  private readonly repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  async execute(redirectTo?: string): Promise<void> {
    return this.repository.signInWithGitHub(redirectTo);
  }
}
