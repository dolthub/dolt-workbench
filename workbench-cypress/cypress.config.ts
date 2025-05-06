const { defineConfig } = require("cypress");

export default defineConfig({
  chromeWebSecurity: false,
  video: false,
  e2e: {
    baseUrl: "http://localhost:3002",
    setupNodeEvents(on, config) {
      // Configure API endpoint
      config.env.API_URL = "http://localhost:9002/graphql";
      return config;
    },
    specPattern: "cypress/e2e/**/*.spec.{js,jsx,ts,tsx}",
  },
  viewportWidth: 1440,
  viewportHeight: 900,
});
