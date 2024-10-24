import { mergeConfig } from "@dolthub/react-components";

const config = mergeConfig({
  corePlugins: {
    preflight: false,
  },
  content: [
    "./app/**/*.css",
    "./app/**/*.tsx",
    "./renderer/components/**/*.css",
    "./renderer/components/**/*.tsx",
    "./renderer/contexts/**/*.css",
    "./renderer/contexts/**/*.tsx",
    "./renderer/hooks/**/*.css",
    "./renderer/hooks/**/*.tsx",
    "./renderer/lib/**/*.css",
    "./renderer/lib/**/*.tsx",
    "./renderer/pages/**/*.tsx",
    "./renderer/styles/**/*.css",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});

export default config;
