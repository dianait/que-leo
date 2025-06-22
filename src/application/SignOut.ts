import { AuthRepository } from "../domain/AuthRepository";

export class SignOut {
  constructor(private readonly repository: AuthRepository) {}

  async execute(): Promise<void> {
    return this.repository.signOut();
  }
}
