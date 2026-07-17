import { defineConfig } from "@playwright/test";

const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const localPagesBasePath = process.env.PLAYWRIGHT_LOCAL_PAGES_BASE_PATH;
const baseURL = remoteBaseURL
  || (localPagesBasePath ? `http://127.0.0.1:4173${localPagesBasePath}` : "http://127.0.0.1:4173");
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: {
      ...(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {}),
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-proxy-server", "--proxy-bypass-list=*"]
    }
  },
  webServer: remoteBaseURL ? undefined : {
    command: localPagesBasePath
      ? "pnpm preview -- --host 127.0.0.1 --port 4173"
      : "pnpm exec vite --host 0.0.0.0 --port 4173",
    url: localPagesBasePath
      ? `http://127.0.0.1:4173${localPagesBasePath}`
      : "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120_000,
    env: localPagesBasePath ? { VITE_BASE_PATH: localPagesBasePath } : undefined
  },
  projects: [
    { name: "chromium-402", use: { viewport: { width: 402, height: 874 } } },
    { name: "chromium-440", use: { viewport: { width: 440, height: 956 } } }
  ]
});
