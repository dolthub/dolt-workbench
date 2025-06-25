import "@testing-library/jest-dom";
import { setConfig } from "next/config";
import config from "./renderer/next.config.mjs";

// Make sure you can use "publicRuntimeConfig" within tests.
setConfig({
  ...config,
  publicRuntimeConfig: { ...config.publicRuntimeConfig, useQueryMocks: false },
});
