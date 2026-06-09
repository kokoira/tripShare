import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E テスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // E2Eテストディレクトリ
  testDir: './e2e',

  // タイムアウト設定（30秒）
  timeout: 30000,

  // テストを並列実行する
  fullyParallel: true,

  // CI環境では `.only` を禁止する（誤ってスキップを防ぐ）
  forbidOnly: !!process.env.CI,

  // CI環境では2回リトライ、ローカルでは0回
  retries: process.env.CI ? 2 : 0,

  // CI環境では1ワーカー、ローカルはデフォルト（CPU数に依存）
  workers: process.env.CI ? 1 : undefined,

  // テストレポートはHTML形式
  reporter: 'html',

  use: {
    // テスト対象のベースURL
    baseURL: 'http://localhost:3000',

    // 失敗時のみスクリーンショットを保存
    screenshot: 'only-on-failure',

    // 失敗時のみ動画を保存
    video: 'retain-on-failure',

    // 最初のリトライ時にトレースを記録
    trace: 'on-first-retry',
  },

  projects: [
    {
      // デスクトップChromiumでテスト
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // iPhone 13でモバイルテスト
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
})
