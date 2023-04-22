/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  webpack: {
    configure: (config) => {
      config.experiments = {
        asyncWebAssembly: true,
        layers: true,
      };

      // turn off static file serving of WASM files
      // we need to let Webpack handle WASM import
      config.module.rules
        .find((i) => "oneOf" in i)
        .oneOf.find((i) => i.type === "asset/resource")
        .exclude.push(/\.wasm$/);

      return config;
    },
  },
  ignoredRouteFiles: ["**/.*"],
  // When running locally in development mode, we use the built-in remix
  // server. This does not understand the vercel lambda module format,
  // so we default back to the standard build output.
  server: process.env.NODE_ENV === "development" ? undefined : "./server.ts",
  serverBuildPath: "api/index.js",
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
    unstable_tailwind: true,
  },
};
