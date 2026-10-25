import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Plain <img> is deliberate: the visual editor swaps src/srcset on these at runtime.
      '@next/next/no-img-element': 'off',
      // Page copy is prose with apostrophes and quotes; escaping them all hurts readability.
      'react/no-unescaped-entities': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'public/**',
    'supabase/functions/**',
    'next-env.d.ts',
    'playwright-report/**',
    'test-results/**',
    '.migration/**',
    'scrape/**',
    'data/**',
    '.next-test/**',
    '.impeccable/**',
    // vendored design-tool scripts (Impeccable skill), not site code
    '.claude/**',
    '.github/skills/**',
  ]),
]);
