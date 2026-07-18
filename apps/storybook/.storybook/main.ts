import type { StorybookConfig } from '@storybook/react-vite';
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

const config: StorybookConfig = {
  stories: [
    "../../../packages/ui/src/**/*.mdx",
    "../../../packages/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/react-vite",
  async viteFinal(config) {
    config.plugins ??= [];
    config.plugins.push(tsconfigPaths());
    config.plugins.push(svgr());
    return {
      ...config,
      css: {
        ...config.css,
        modules: {
          localsConvention: "camelCaseOnly",
        },
      },
    };
  }
};
export default config;