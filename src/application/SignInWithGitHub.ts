import { AuthRepository } from "../domain/AuthRepository";

export class SignInWithGitHub {
  constructor(private readonly repository: AuthRepository) {}

  async execute(): Promise<void> {
    return this.repository.signInWithGitHub();
  }
}
