const { createDefaultPreset } = require("ts-jest");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/tests/__mocks__/styleMock.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/tests/e2e/"],
};
