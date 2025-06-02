module.exports = {
  plugins: {
    "tailwindcss/nesting": {},
    tailwindcss: {
      config: "./renderer/tailwind.config.ts",
    },
    "postcss-preset-env": {},
    cssnano: {},
    autoprefixer: {},
  },
};
