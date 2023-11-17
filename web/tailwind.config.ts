import plugin from "tailwindcss/plugin";

const colors = {
  primary: "#183362",
  "ld-darkerblue": "#262E44",
  "ld-darkblue": "#183362",
  "ld-mediumblue": "#35405F",
  "ld-blue": "#6db0fc",
  "ld-lightblue": "#f6f8f9",
  "ld-grey": "#f2f5fb",
  "ld-lightgrey": "#e1e5e7",
  "ld-lightpurple": "#f1f3f8",
  "ld-brightgreen": "#29e3c1",
  "ld-orange": "#FF7042",

  // Database page colors
  "ld-darkgrey": "#95a3a7",
  "ld-darkergrey": "#384B52",
  "acc-hoverlinkblue": "#466CD3",
  "acc-hoverblue": "#1d2c7f",
  "acc-grey": "#b2c0c4",
  "acc-linkblue": "#375AB7",
  "acc-lightgrey": "#c6cdd0",
  "acc-darkgrey": "#5d6280",
  "acc-green": "#5ac58d",
  "acc-hovergreen": "#6fdda4",
  "acc-red": "#ff9a99",
  "acc-hoverred": "#fca8a7",
  "acc-pink": "#d588d5",
};

const shadowPlugin = plugin(({ addUtilities }) => {
  addUtilities({
    ".widget-shadow": {
      "box-shadow": "0 0 4px 0 rgba(148, 163, 167, 0.5)",
    },
    ".widget-shadow-hover": {
      "box-shadow": "3px 3px 7px 0 rgba(148, 163, 167, 0.6)",
    },
    ".widget-shadow-lightblue": {
      "box-shadow": "0 0 4px 0 rgba(81, 203, 238, 1)",
    },
    ".button-shadow": {
      "box-shadow": "1px 1px 4px 0 rgba(149, 163, 167, 0.5)",
    },
    ".button-shadow-hover": {
      "box-shadow": "3px 3px 4px 0 rgba(149, 163, 167, 0.5)",
    },
  });
});

const borderPlugin = plugin(({ addUtilities }) => {
  addUtilities({
    ".border-opaque-rounded": {
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "4px",
    },
  });
});

const oddSizesPlugin = plugin(({ addUtilities }) => {
  addUtilities({
    ".z-1": {
      zIndex: "1",
    },
    ".z-100": {
      zIndex: "100",
    },
    ".border-3": {
      borderWidth: "3px",
    },
    ".border-t-3": {
      borderTopWidth: "3px",
    },
    ".border-r-3": {
      borderRightWidth: "3px",
    },
    ".border-b-3": {
      borderBottomWidth: "3px",
    },
    ".border-l-3": {
      borderLeftWidth: "3px",
    },
    ".border-x": {
      borderRightWidth: "1px",
      borderLeftWidth: "1px",
    },
    ".border-y": {
      borderTopWidth: "1px",
      borderBottomWidth: "1px",
    },
    ".text-2xs": {
      fontSize: "0.625rem",
      lineHeight: "1rem",
    },
  });
});

const config = {
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
  plugins: [shadowPlugin, oddSizesPlugin, borderPlugin],
  theme: {
    extend: {
      transitionProperty: { width: "width" },
      gradientColorStops: colors,
      colors,
      fontFamily: {
        sans: ["Source Sans Pro", "sans-serif"],
      },
      screens: {
        xxl: "1400px",
      },
    },
  },
};

export default config;
