const { mergeConfig } = require("@dolthub/react-components");
module.exports = mergeConfig({
  corePlugins: {
    preflight: false,
  },
  content: [
    "./renderer/app/**/*.css",
    "./renderer/app/**/*.tsx",
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
