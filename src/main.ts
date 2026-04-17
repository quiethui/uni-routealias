import App from "./App.vue";
import { createSSRApp } from "vue";
import { installRouteAliasPlugin } from "@/uni_modules/uni-routealias";

installRouteAliasPlugin();

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
