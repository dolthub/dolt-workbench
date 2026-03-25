const path = require("path");

process.env.NEXT_PUBLIC_FOR_ELECTRON = "true";
process.env.NEXT_PUBLIC_FOR_MAC_NAV =
  process.platform === "darwin" ? "true" : "false";

module.exports = {
  mainSrcDir: "main",
  rendererSrcDir: "renderer",
  webpack: config => {
    // Exclude eventsapi_schema from babel-loader — the generated protobuf JS
    // does not need transpilation and requires @babel/runtime-corejs3 if processed.
    const jsRule = config.module.rules.find(
      r => r.test && r.test.toString().includes("js"),
    );
    if (jsRule) {
      const prevExclude = jsRule.exclude;
      jsRule.exclude = filePath => {
        if (filePath.includes(path.join("eventsapi_schema"))) return true;
        if (Array.isArray(prevExclude))
          return prevExclude.some(e =>
            e instanceof RegExp ? e.test(filePath) : filePath.includes(e),
          );
        if (prevExclude instanceof RegExp) return prevExclude.test(filePath);
        return false;
      };
    }

    // Resolve @eventsapi_schema alias for webpack (mirrors tsconfig paths).
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@eventsapi_schema": path.resolve(__dirname, "../eventsapi_schema"),
    };

    // Nextron externalizes dependencies by exact name, but the proto bindings
    // require sub-paths (e.g. google-protobuf/google/protobuf/timestamp_pb.js).
    // Convert string externals to a function that matches by prefix.
    const prevExternals = config.externals || [];
    const externalNames = prevExternals.filter(e => typeof e === "string");
    const otherExternals = prevExternals.filter(e => typeof e !== "string");
    config.externals = [
      ...otherExternals,
      ({ request }, callback) => {
        if (
          externalNames.some(
            name => request === name || request.startsWith(name + "/"),
          )
        ) {
          return callback(null, `commonjs ${request}`);
        }
        callback();
      },
    ];

    return config;
  },
};
