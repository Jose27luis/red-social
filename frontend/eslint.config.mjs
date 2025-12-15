import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";
import noSecrets from "eslint-plugin-no-secrets";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Security rules configuration
  {
    plugins: {
      security,
      "no-secrets": noSecrets,
    },
    rules: {
      // ==================== Basic Security Rules ====================

      // Prevent use of eval() and similar functions
      "no-eval": "error",
      "no-implied-eval": "error",

      // ==================== eslint-plugin-security Rules ====================

      // Detect unsafe regular expressions (ReDoS)
      "security/detect-unsafe-regex": "error",

      // Detect deprecated Buffer() constructor
      "security/detect-buffer-noassert": "error",

      // Detect child process usage (system commands)
      "security/detect-child-process": "warn",

      // Detect eval() and similar
      "security/detect-eval-with-expression": "error",

      // Detect non-literal fs filenames (path traversal)
      "security/detect-non-literal-fs-filename": "warn",

      // Detect non-literal require() (code injection)
      "security/detect-non-literal-require": "warn",

      // Detect non-literal RegExp (ReDoS)
      "security/detect-non-literal-regexp": "warn",

      // Detect Math.random() instead of crypto.randomBytes()
      "security/detect-pseudoRandomBytes": "error",

      // Detect object injection (prototype pollution)
      "security/detect-object-injection": "warn",

      // ==================== eslint-plugin-no-secrets Rules ====================

      // Detect hardcoded secrets
      "no-secrets/no-secrets": [
        "error",
        {
          tolerance: 5.0,
          ignoreContent: [
            // Ignore common URLs
            "^http://",
            "^https://",
            // Ignore localhost
            "localhost",
            "127.0.0.1",
            // Ignore public Next.js env vars (these are safe)
            "NEXT_PUBLIC_",
          ],
          ignoreIdentifiers: [
            // Ignore these variable names
            "NEXT_PUBLIC_API_URL",
            "NEXT_PUBLIC_APP_NAME",
            "NEXT_PUBLIC_UNIVERSIDAD_DOMAIN",
            "NEXT_PUBLIC_WS_URL",
            "API_URL",
            "APP_NAME",
          ],
        },
      ],

      // ==================== Next.js Specific Security ====================

      // Enforce using Next.js Image component (security + performance)
      "@next/next/no-img-element": "warn",

      // Prevent HTML link elements for pages (use Link component)
      "@next/next/no-html-link-for-pages": "error",

      // ==================== React Security Best Practices ====================

      // Warn about dangerouslySetInnerHTML usage
      // (We have SafeHTML component as alternative)
      "react/no-danger": "warn",

      // Prevent usage of dangerous JSX props
      "react/no-danger-with-children": "error",
    },
  },

  // Override default ignores of eslint-config-next
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores:
    "node_modules/**",
    "coverage/**",
    "*.config.js",
    "*.config.ts",
    "*.config.mjs",
  ]),
]);

export default eslintConfig;
