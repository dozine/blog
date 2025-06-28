import type { Config } from "jest";

const config: Config = {
  rootDir: "./",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/__mocks__/fileMock.ts",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      { configFile: "./babel-jest.config.js" },
    ],
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/index.js",
    "!src/reportWebVitals.js",
  ],
  testMatch: [
    "<rootDir>/src/**/*.test.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.spec.{js,jsx,ts,tsx}",
  ],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
};

export default config;
