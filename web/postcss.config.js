module.exports = {
  plugins: {
    "tailwindcss/nesting": {},
    tailwindcss: {
      config: "./web/tailwind.config.ts",
    },
    "postcss-preset-env": {},
    cssnano: {},
    autoprefixer: {},
  },
};
