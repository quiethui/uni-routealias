import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { createRouteAliasVitePlugin } from "./src/uni_modules/uni-routealias/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [createRouteAliasVitePlugin(), uni()],
});
