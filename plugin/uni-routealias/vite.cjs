const fs = require("node:fs");
const path = require("node:path");

const routeAliasVirtualModuleId = "virtual:route-alias-config";
const resolvedRouteAliasVirtualModuleId = `\0${routeAliasVirtualModuleId}`;

function resolveDefaultPagesJsonPath() {
  const projectDir = process.cwd();
  const candidates = [
    path.resolve(projectDir, "src/pages.json"),
    path.resolve(projectDir, "pages.json"),
  ];

  return candidates.find((candidatePath) => fs.existsSync(candidatePath)) || candidates[0];
}

async function createRouteAliasStateFromFile(pagesJsonPath) {
  const rawContent = fs.readFileSync(pagesJsonPath, "utf8");
  const routeAliasStateModule = await import("./dist/route-alias-state.js");
  return routeAliasStateModule.createRouteAliasState(
    routeAliasStateModule.parsePagesJsonText(rawContent)
  );
}

function createRouteAliasVitePlugin(pagesJsonPath = resolveDefaultPagesJsonPath()) {
  return {
    name: "route-alias-config",
    enforce: "pre",
    config(userConfig) {
      const exclude = new Set((userConfig.optimizeDeps && userConfig.optimizeDeps.exclude) || []);
      exclude.add("uni-routealias");

      return {
        optimizeDeps: {
          exclude: [...exclude],
        },
      };
    },
    resolveId(id) {
      if (id === routeAliasVirtualModuleId) {
        return resolvedRouteAliasVirtualModuleId;
      }
    },
    async load(id) {
      if (id !== resolvedRouteAliasVirtualModuleId) {
        return;
      }

      this.addWatchFile(pagesJsonPath);

      let routeAliasState;
      try {
        routeAliasState = await createRouteAliasStateFromFile(pagesJsonPath);
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

module.exports = {
  createRouteAliasVitePlugin,
};
