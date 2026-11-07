// Polyfills para el entorno de testing
import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";
import { User } from "@supabase/supabase-js";
import { AuthContextType } from "../src/domain/AuthContext";

// waitFor/findBy give up after 1 s by default. With every suite running in
// parallel the table sometimes takes longer to render and tests failed at
// random (articleTablePagination). They still resolve as soon as the UI is
// ready; only a real failure waits the full 5 s.
configure({ asyncUtilTimeout: 5000 });

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock ResizeObserver if it's not available
if (!global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock IntersectionObserver if it's not available
if (!global.IntersectionObserver) {
  global.IntersectionObserver = class IntersectionObserver {
    root: Element | null = null;
    rootMargin: string = "";
    thresholds: ReadonlyArray<number> = [];

    constructor(
      _callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) {
      if (options) {
        this.root = options.root instanceof Element ? options.root : null;
        this.rootMargin = options.rootMargin || "";
        this.thresholds = options.threshold
          ? Array.isArray(options.threshold)
            ? options.threshold
            : [options.threshold]
          : [0];
      }
    }

    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  };
}

export const mockUser: User = {
  id: "123",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

export const createMockAuthContext = (
  overrides: Partial<AuthContextType> = {}
): AuthContextType => ({
  user: mockUser,
  session: null,
  signInWithGitHub: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  createTelegramLink: async () => "https://t.me/queleo_bot?start=test-code",
  loading: false,
  ...overrides,
});
