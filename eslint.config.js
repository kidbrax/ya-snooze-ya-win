import babelParser from "@babel/eslint-parser";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["build/*", "node_modules/*"],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        projectService: true,
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-flow", "@babel/preset-react"],
        },
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: "module",
      globals: {
        chrome: "readonly",
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        self: "readonly",
        ServiceWorkerGlobalScope: "readonly",
        HTMLAudioElement: "readonly",
        performance: "readonly",
        globalThis: "readonly",
      },
    },
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
