import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import hexagonalArchitecture from "eslint-plugin-hexagonal-architecture";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "tests/**",
      "*.config.*",
      "__mocks__/**",
      "src/App.tsx",
      "src/main.tsx",
      "src/vite-env.d.ts",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "hexagonal-architecture": hexagonalArchitecture,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "hexagonal-architecture/enforce": [
        "error",
        {
          sourceRoots: ["src"],
          layers: [
            { name: "domain", isRoot: true },
            { name: "application", dependsOn: ["domain"] },
            { name: "infrastructure", dependsOn: ["domain", "application"] },
          ],
          ignorePatterns: [
            "src/App.tsx",
            "src/main.tsx",
            "src/vite-env.d.ts",
            "src/ui/**",
            "**/*.test.tsx",
            "**/tests/**",
          ],
        },
      ],
    },
  }
);
