const tailwindConfig = require("./tailwind.config.js");

module.exports = {
  plugins: {
    "tailwindcss/nesting": {},
    tailwindcss: { ...tailwindConfig },
    "postcss-preset-env": {},
    cssnano: {},
    autoprefixer: {},
  },
};
