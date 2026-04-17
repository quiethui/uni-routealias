import { onCreateVueApp } from "@dcloudio/uni-shared";
import { installH5RouteAliases } from "./runtime.js";

let routeAliasPluginInstalled = false;

export function installRouteAliasPlugin() {
  if (routeAliasPluginInstalled) {
    return;
  }

  routeAliasPluginInstalled = true;

  onCreateVueApp(() => {
    installH5RouteAliases();
  });
}
