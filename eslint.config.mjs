import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginSecurity from "eslint-plugin-security";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "e2e/**", "fixer.js", "fixer2.js", "fixer3.js", "next.config.js"],
  },
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:jsx-a11y/recommended"
  ),
  pluginSecurity.configs.recommended,
  {
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "jsx-a11y/alt-text": "error",
      "security/detect-object-injection": "off",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error"
    },
  },
];

export default eslintConfig;
