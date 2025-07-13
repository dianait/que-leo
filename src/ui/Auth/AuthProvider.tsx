import React, { useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { AuthContext } from "../../domain/AuthContext";
import { SupabaseAuthRepository } from "../../infrastructure/auth/SupabaseAuthRepository";
import { SignInWithGitHub } from "../../application/SignInWithGitHub";
import { SignInWithGoogle } from "../../application/SignInWithGoogle";
import { SignOut } from "../../application/SignOut";
import { LoginForm } from "./LoginForm";
import { AppSkeleton } from "../AppSkeleton/AppSkeleton";

interface AuthProviderProps {
  children: React.ReactNode;
  supabase: SupabaseClient;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  supabase,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Composición de la Arquitectura ---
  const authRepository = new SupabaseAuthRepository(supabase);
  const signInGitHubUseCase = new SignInWithGitHub(authRepository);
  const signInGoogleUseCase = new SignInWithGoogle(authRepository);
  const signOutUseCase = new SignOut(authRepository);
  // ------------------------------------

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signInWithGitHub = async (redirectTo?: string) => {
    await signInGitHubUseCase.execute(redirectTo);
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    await signInGoogleUseCase.execute(redirectTo);
  };

  const signOut = async () => {
    await signOutUseCase.execute();
  };

  const value = {
    user,
    session,
    signInWithGitHub,
    signInWithGoogle,
    signOut,
    loading,
  };

  if (loading) {
    return <AppSkeleton />;
  }

  return (
    <AuthContext.Provider value={value}>
      {user ? children : <LoginForm />}
    </AuthContext.Provider>
  );
};
