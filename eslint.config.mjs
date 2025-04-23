import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const compatConfig = [...compat.extends("next/core-web-vitals")];

const eslintConfig = [
  ...compatConfig,
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    ignores: ["node_modules/**", ".next/**", "out/**", "public/**", "dist/**"],
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin,
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          semi: true,
          tabWidth: 2,
          printWidth: 100,
          singleQuote: false,
          trailingComma: "es5",
          jsxBracketSameLine: false,
        },
      ],

      "no-unused-vars": "warn",
      "no-console": "warn",
      "import/no-unresolved": "error",
    },

    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".mjs", ".cjs"],
        },
      },
    },
  },
];

export default eslintConfig;
