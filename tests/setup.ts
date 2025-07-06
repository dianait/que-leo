// Polyfills para el entorno de testing
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock de ResizeObserver si no está disponible
if (!global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock de IntersectionObserver si no está disponible
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
