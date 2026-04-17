import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { createRouteAliasVitePlugin } from "uni-routealias/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [createRouteAliasVitePlugin("./src/pages.json"), uni()],
});
