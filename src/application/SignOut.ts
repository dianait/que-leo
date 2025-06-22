import type { AuthRepository } from "../domain/AuthRepository";

export class SignOut {
  private readonly repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  async execute(): Promise<void> {
    return this.repository.signOut();
  }
}
