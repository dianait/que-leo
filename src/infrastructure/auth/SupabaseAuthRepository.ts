import { SupabaseClient } from "@supabase/supabase-js";
import type { AuthRepository } from "../../domain/AuthRepository";

export class SupabaseAuthRepository implements AuthRepository {
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async signInWithGitHub(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: "github",
    });
    if (error) {
      throw new Error(`Error al iniciar sesión con GitHub: ${error.message}`);
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
  }
}
