process.env.NEXT_PUBLIC_FOR_ELECTRON = "true";

module.exports = {
  mainSrcDir: "main",
  rendererSrcDir: "renderer",
  webpack: (config, env) => config,
};
