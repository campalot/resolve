import type { NextConfig } from "next";

// Define a type interface to safely extend Next's native type system
// interface ExtendedNextConfig extends NextConfig {
//   turbopack?: {
//     rules?: Record<string, any>;
//     // cssModules?: {
//     //   exportLocalsConvention?: "camelCaseOnly" | "camelCase" | "asIs";
//     // };
//   };
// }

const config: NextConfig = {
  // 1. TURBOPACK CONFIGURATION (Used during 'next dev --turbo')
  turbopack: {
    // Keeps your working SVG React Component loader intact
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
    // Handles camelCase conversion for CSS Modules natively in Rust
    // cssModules: {
    //   exportLocalsConvention: "camelCaseOnly",
    // },
  },

  // 2. WEBPACK CONFIGURATION (Used during 'next build' for production packaging)
  webpack: (config) => {
    // SVG handling
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.(".svg")
    );

    if (fileLoaderRule) {
      config.module.rules.push(
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/,
        },
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [/url/] },
          use: ["@svgr/webpack"],
        }
      );

      fileLoaderRule.exclude = /\.svg$/i;
    }

    // CSS Modules: export camelCase aliases
    // Preserve the workspace-wide CSS Module convention used by Resolve.
    // Components reference classes via camelCase (styles.statusBadge)
    // rather than bracket notation (styles["status-badge"]).
    config.module.rules
      .find((rule: any) => !!rule.oneOf)
      ?.oneOf.filter((rule: any) => Array.isArray(rule.use))
      .forEach((rule: any) => {
        rule.use.forEach((loaderCtx: any) => {
          if (
            loaderCtx.loader?.includes("css-loader") &&
            typeof loaderCtx.options?.modules === "object"
          ) {
            loaderCtx.options.modules.exportLocalsConvention = "camelCaseOnly";
          }
        });
      });

    return config;
  },
};

// Export casting to NextConfig preserves the strict type framework export contract
export default config as NextConfig;
