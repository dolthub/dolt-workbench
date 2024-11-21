process.env.NEXT_PUBLIC_FOR_ELECTRON = "true";
process.env.NEXT_PUBLIC_FOR_MAC_NAV =
  process.platform === "darwin" ? "true" : "false";

module.exports = {
  mainSrcDir: "main",
  rendererSrcDir: "renderer",
  webpack: (config, env) => config,
};
