import type { AuthRepository } from "../domain/AuthRepository";

export class SignInWithGoogle {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(redirectTo?: string): Promise<void> {
    await this.authRepository.signInWithGoogle(redirectTo);
  }
}
