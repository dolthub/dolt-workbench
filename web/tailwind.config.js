const { mergeConfig } = require("@dolthub/react-components");
module.exports = mergeConfig({
  corePlugins: {
    preflight: false,
  },
  content: [
    "./web/app/**/*.css",
    "./web/app/**/*.tsx",
    "./web/components/**/*.css",
    "./web/components/**/*.tsx",
    "./web/contexts/**/*.css",
    "./web/contexts/**/*.tsx",
    "./web/hooks/**/*.css",
    "./web/hooks/**/*.tsx",
    "./web/lib/**/*.css",
    "./web/lib/**/*.tsx",
    "./web/pages/**/*.tsx",
    "./web/styles/**/*.css",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});
