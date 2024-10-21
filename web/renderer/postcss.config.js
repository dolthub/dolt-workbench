module.exports = {
  plugins: {
    "tailwindcss/nesting": {},
    tailwindcss: {
      config: process.env.NEXT_PUBLIC_FOR_ELECTRON === "true"?"./renderer/tailwind.config.ts":"./tailwind.config.ts",
    },
    "postcss-preset-env": {},
    cssnano: {},
    autoprefixer: {},
  },
};
