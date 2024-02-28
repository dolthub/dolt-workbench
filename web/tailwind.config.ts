import { mergeConfig, workbenchColors } from "@dolthub/react-components";

const config = mergeConfig({
  corePlugins: {
    preflight: false,
  },
  content: [
    "./app/**/*.css",
    "./app/**/*.tsx",
    "./components/**/*.css",
    "./components/**/*.tsx",
    "./contexts/**/*.css",
    "./contexts/**/*.tsx",
    "./hooks/**/*.css",
    "./hooks/**/*.tsx",
    "./lib/**/*.css",
    "./lib/**/*.tsx",
    "./pages/**/*.tsx",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      gradientColorStops: workbenchColors,
      colors: workbenchColors,
    },
  },
});

export default config;
