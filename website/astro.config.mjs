import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import pagefindResources from "./src/integrations/pagefind-resources";

// GitHub Pages serves this site as a project site under the repository path,
// so the base path must be part of every generated URL. Override with
// SITE_URL/SITE_BASE when the site moves to a custom domain.
const site = process.env.SITE_URL ?? "https://iromu.github.io";
const base = process.env.SITE_BASE ?? "/awesome-qwen";

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: "static",
  integrations: [react(), sitemap(), pagefindResources()],
  build: {
    assets: "assets",
  },
  trailingSlash: "always",
  vite: {
    resolve: {
      alias: [
        {
          // @primer/react-brand's default entrypoint is CJS, so Node's ESM
          // loader cannot detect its named exports during SSR. Only the bare
          // package specifier (the JS entrypoint) is redirected; subpath
          // imports such as `/lib/css/main.css` must resolve normally.
          find: /^@primer\/react-brand$/,
          replacement: "@primer/react-brand/esm",
        },
      ],
      // The ESM build imports its own .css files, which Node's loader cannot
      // handle, so it has to be bundled rather than externalised for SSR.
      noExternal: ["@primer/react-brand"],
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 900,
    },
    css: {
      devSourcemap: true,
    },
  },
});
