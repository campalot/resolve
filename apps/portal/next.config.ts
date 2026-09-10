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

  transpilePackages: ['@resolve/ui'], // Replace with your exact UI package name
  // 2. WEBPACK CONFIGURATION (Used during 'next build' for production packaging)
  /* eslint-disable @typescript-eslint/no-explicit-any */
  webpack: (config) => {
    // SVG handling
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.(".svg")
    );

    if (fileLoaderRule) {
      config.module.rules.push(
        // 2. ONLY use Next.js's native asset loader if explicitly requested with ?url
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/,
        },
        // 3. For BOTH normal local imports AND your package's ?react imports, 
        //    convert them into real React Components via SVGR
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          // Matches when there is NO query, OR when it contains ?react
          resourceQuery: { not: [/url/] }, 
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                typescript: true,
                ext: 'tsx',
              },
            },
          ],
        }
      );

      // 4. Stop the original file loader from clashing with our SVGR rule
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
  /* eslint-enable @typescript-eslint/no-explicit-any */
};

// Export casting to NextConfig preserves the strict type framework export contract
export default config as NextConfig;
