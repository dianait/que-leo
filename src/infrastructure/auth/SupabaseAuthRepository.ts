import { SupabaseClient } from "@supabase/supabase-js";
import type { AuthRepository } from "../../domain/AuthRepository";

export class SupabaseAuthRepository implements AuthRepository {
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async signInWithGitHub(redirectTo?: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: redirectTo || window.location.origin,
      },
    });
    if (error) {
      throw new Error(`Error al iniciar sesión con GitHub: ${error.message}`);
    }
  }

  async signInWithGoogle(redirectTo?: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo || window.location.origin,
      },
    });
    if (error) {
      throw new Error(`Error al iniciar sesión con Google: ${error.message}`);
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }
}
