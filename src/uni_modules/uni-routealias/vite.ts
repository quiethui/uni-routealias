import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { createRouteAliasState, parsePagesJsonText, type RouteAliasState } from "./route-alias-state.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const routeAliasVirtualModuleId = "virtual:route-alias-config";
const resolvedRouteAliasVirtualModuleId = `\0${routeAliasVirtualModuleId}`;

function parsePagesJson(pagesJsonPath: string) {
  const rawContent = fs.readFileSync(pagesJsonPath, "utf8");
  return parsePagesJsonText(rawContent);
}

function createRouteAliasStateFromFile(pagesJsonPath: string): RouteAliasState {
  return createRouteAliasState(parsePagesJson(pagesJsonPath));
}

export function createRouteAliasVitePlugin(
  pagesJsonPath = path.resolve(currentDir, "../../pages.json")
): Plugin {
  return {
    name: "route-alias-config",
    resolveId(id) {
      if (id === routeAliasVirtualModuleId) {
        return resolvedRouteAliasVirtualModuleId;
      }
    },
    load(id) {
      if (id !== resolvedRouteAliasVirtualModuleId) {
        return;
      }

      this.addWatchFile(pagesJsonPath);

      let routeAliasState: RouteAliasState;
      try {
        routeAliasState = createRouteAliasStateFromFile(pagesJsonPath);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.error(`uni-routealias: failed to read "${pagesJsonPath}". ${message}`);
      }

      routeAliasState.warnings.forEach((message) => {
        this.warn(message);
      });

      return `export default ${JSON.stringify(routeAliasState.config)}`;
    },
    handleHotUpdate({ file, server }) {
      if (path.resolve(file) !== path.resolve(pagesJsonPath)) {
        return;
      }

      const module = server.moduleGraph.getModuleById(resolvedRouteAliasVirtualModuleId);
      if (module) {
        server.moduleGraph.invalidateModule(module);
      }

      server.ws.send({ type: "full-reload" });
    },
  };
}
