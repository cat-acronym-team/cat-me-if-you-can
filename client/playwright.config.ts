import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  webServer: {
    command: "npm --prefix .. run emulators:preview",
    port: 5000,
  },
};

export default config;
