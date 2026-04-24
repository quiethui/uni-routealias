import * as fs from "node:fs";
import * as path from "node:path";
import { createRouteAliasState, parsePagesJsonText } from "./route-alias-state.js";
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
function parsePagesJson(pagesJsonPath) {
    const rawContent = fs.readFileSync(pagesJsonPath, "utf8");
    return parsePagesJsonText(rawContent);
}
function createRouteAliasStateFromFile(pagesJsonPath) {
    return createRouteAliasState(parsePagesJson(pagesJsonPath));
}
export function createRouteAliasVitePlugin(pagesJsonPath = resolveDefaultPagesJsonPath()) {
    return {
        name: "route-alias-config",
        enforce: "pre",
        config(userConfig) {
            var _a, _b;
            const exclude = new Set((_b = (_a = userConfig.optimizeDeps) === null || _a === void 0 ? void 0 : _a.exclude) !== null && _b !== void 0 ? _b : []);
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
        load(id) {
            if (id !== resolvedRouteAliasVirtualModuleId) {
                return;
            }
            this.addWatchFile(pagesJsonPath);
            let routeAliasState;
            try {
                routeAliasState = createRouteAliasStateFromFile(pagesJsonPath);
            }
            catch (error) {
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
