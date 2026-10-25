import { defineConfig } from '@playwright/test';

/* End-to-end suite. Runs a production build of the site against tests/mock-supabase.mjs,
   so nothing touches the real Supabase project: content comes from
   tests/fixtures/content.json and form submissions are recorded in memory. */

const MOCK = 'http://127.0.0.1:54321';
const PORT = 4173;

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  // tests share one mock database (and the editor publishes into it), so run one at a time
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  webServer: [
    { command: 'node tests/mock-supabase.mjs', url: `${MOCK}/__test/state`, reuseExistingServer: !process.env.CI },
    {
      command: `npm run build && npm run start -- -p ${PORT}`,
      url: `http://localhost:${PORT}/robots.txt`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        NEXT_DIST_DIR: '.next-test',
        NEXT_PUBLIC_SUPABASE_URL: MOCK,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        NEXT_PUBLIC_GA_ID: '',
        NEXT_PUBLIC_SENTRY_DSN: '',
      },
    },
  ],
});
