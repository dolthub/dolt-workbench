process.env.NEXT_PUBLIC_FOR_ELECTRON = "true";

module.exports = {
  mainSrcDir: "main",
  rendererSrcDir: "web",
  webpack: (config, env) => config,
};
