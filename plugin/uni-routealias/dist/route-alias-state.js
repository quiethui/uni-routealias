import { DEFAULT_HOME_ROUTE_PATH, getDefaultAliasPath, normalizeRoutePath } from "./core/shared.js";
export function stripJsonComments(source) {
    let result = "";
    let index = 0;
    let inString = false;
    let escaped = false;
    while (index < source.length) {
        const currentChar = source[index];
        const nextChar = source[index + 1];
        if (inString) {
            result += currentChar;
            if (escaped) {
                escaped = false;
            }
            else if (currentChar === "\\") {
                escaped = true;
            }
            else if (currentChar === '"') {
                inString = false;
            }
            index += 1;
            continue;
        }
        if (currentChar === '"') {
            inString = true;
            result += currentChar;
            index += 1;
            continue;
        }
        if (currentChar === "/" && nextChar === "/") {
            index += 2;
            while (index < source.length && source[index] !== "\n") {
                index += 1;
            }
            continue;
        }
        if (currentChar === "/" && nextChar === "*") {
            index += 2;
            while (index < source.length) {
                if (source[index] === "*" && source[index + 1] === "/") {
                    index += 2;
                    break;
                }
                index += 1;
            }
            continue;
        }
        result += currentChar;
        index += 1;
    }
    return result;
}
export function stripTrailingCommas(source) {
    let result = "";
    let inString = false;
    let escaped = false;
    for (let index = 0; index < source.length; index += 1) {
        const currentChar = source[index];
        if (inString) {
            result += currentChar;
            if (escaped) {
                escaped = false;
            }
            else if (currentChar === "\\") {
                escaped = true;
            }
            else if (currentChar === '"') {
                inString = false;
            }
            continue;
        }
        if (currentChar === '"') {
            inString = true;
            result += currentChar;
            continue;
        }
        if (currentChar !== ",") {
            result += currentChar;
            continue;
        }
        let lookaheadIndex = index + 1;
        while (lookaheadIndex < source.length && /\s/.test(source[lookaheadIndex])) {
            lookaheadIndex += 1;
        }
        if (source[lookaheadIndex] === "}" || source[lookaheadIndex] === "]") {
            continue;
        }
        result += currentChar;
    }
    return result;
}
export function parsePagesJsonText(source) {
    return JSON.parse(stripTrailingCommas(stripJsonComments(source)));
}
function joinRouteSegments(...segments) {
    return normalizeRoutePath(segments.filter(Boolean).join("/"));
}
function isReservedAliasPath(aliasPath) {
    return normalizeRoutePath(aliasPath) === "/";
}
function hasUnsupportedRouteSuffix(aliasPath) {
    return /[?#]/.test(aliasPath);
}
function pushWarning(warnings, message) {
    warnings.push(`uni-routealias: ${message}`);
}
function collectRouteDescriptors(config) {
    var _a, _b, _c;
    const routeDescriptors = [];
    const subPackages = [...((_a = config.subPackages) !== null && _a !== void 0 ? _a : []), ...((_b = config.subpackages) !== null && _b !== void 0 ? _b : [])];
    (_c = config.pages) === null || _c === void 0 ? void 0 : _c.forEach((page) => {
        if (!page.path) {
            return;
        }
        routeDescriptors.push({
            routePath: normalizeRoutePath(page.path),
            aliasPath: page.routeAlias ? normalizeRoutePath(page.routeAlias) : undefined,
        });
    });
    subPackages.forEach((subPackage) => {
        var _a;
        (_a = subPackage.pages) === null || _a === void 0 ? void 0 : _a.forEach((page) => {
            if (!page.path) {
                return;
            }
            routeDescriptors.push({
                routePath: joinRouteSegments(subPackage.root, page.path),
                aliasPath: page.routeAlias ? normalizeRoutePath(page.routeAlias) : undefined,
            });
        });
    });
    return routeDescriptors;
}
export function createRouteAliasState(config) {
    var _a;
    const customAliasCandidates = {};
    const customAliasOwners = {};
    const actualRouteOwners = {};
    const defaultAliases = {};
    const defaultAliasOwners = {};
    const warnings = [];
    const routeDescriptors = collectRouteDescriptors(config);
    const actualRoutes = Array.from(new Set(routeDescriptors.map((descriptor) => descriptor.routePath)));
    const homeRoute = (_a = actualRoutes[0]) !== null && _a !== void 0 ? _a : DEFAULT_HOME_ROUTE_PATH;
    actualRoutes.forEach((routePath) => {
        actualRouteOwners[routePath] = routePath;
    });
    routeDescriptors.forEach(({ routePath, aliasPath }) => {
        if (!aliasPath) {
            return;
        }
        if (hasUnsupportedRouteSuffix(aliasPath)) {
            pushWarning(warnings, `custom alias "${aliasPath}" of "${routePath}" contains "?" or "#". Only pure path aliases are supported, so this alias is ignored.`);
            return;
        }
        if (isReservedAliasPath(aliasPath)) {
            pushWarning(warnings, `custom alias "/" of "${routePath}" is ignored. "/" is reserved as the home-route shortcut and always points to "${homeRoute}".`);
            return;
        }
        if (aliasPath === routePath) {
            pushWarning(warnings, `custom alias "${aliasPath}" of "${routePath}" matches the actual route path, so it is ignored as redundant.`);
            return;
        }
        const previousAlias = customAliasCandidates[routePath];
        if (previousAlias && previousAlias !== aliasPath && customAliasOwners[previousAlias] === routePath) {
            delete customAliasOwners[previousAlias];
        }
        const existingOwner = customAliasOwners[aliasPath];
        if (existingOwner && existingOwner !== routePath) {
            pushWarning(warnings, `custom alias "${aliasPath}" is declared by both "${existingOwner}" and "${routePath}". The last declaration wins.`);
        }
        customAliasCandidates[routePath] = aliasPath;
        customAliasOwners[aliasPath] = routePath;
    });
    const effectiveCustomAliases = {};
    const effectiveCustomAliasOwners = {};
    Object.entries(customAliasOwners).forEach(([aliasPath, routePath]) => {
        if (actualRouteOwners[aliasPath] && actualRouteOwners[aliasPath] !== routePath) {
            pushWarning(warnings, `custom alias "${aliasPath}" of "${routePath}" conflicts with actual route "${actualRouteOwners[aliasPath]}". The custom alias is disabled to avoid H5 route collisions.`);
            return;
        }
        effectiveCustomAliases[routePath] = aliasPath;
        effectiveCustomAliasOwners[aliasPath] = routePath;
    });
    actualRoutes.forEach((routePath) => {
        const defaultAliasPath = getDefaultAliasPath(routePath);
        if (defaultAliasPath === routePath) {
            return;
        }
        if (actualRouteOwners[defaultAliasPath] && actualRouteOwners[defaultAliasPath] !== routePath) {
            pushWarning(warnings, `default alias "${defaultAliasPath}" of "${routePath}" conflicts with actual route "${actualRouteOwners[defaultAliasPath]}". The default alias is disabled to avoid H5 route collisions.`);
            return;
        }
        if (effectiveCustomAliasOwners[defaultAliasPath] &&
            effectiveCustomAliasOwners[defaultAliasPath] !== routePath) {
            pushWarning(warnings, `default alias "${defaultAliasPath}" of "${routePath}" conflicts with custom alias of "${effectiveCustomAliasOwners[defaultAliasPath]}". The default alias is disabled and the custom alias keeps precedence.`);
            return;
        }
        if (effectiveCustomAliasOwners[defaultAliasPath] === routePath) {
            return;
        }
        const existingOwner = defaultAliasOwners[defaultAliasPath];
        if (existingOwner && existingOwner !== routePath) {
            pushWarning(warnings, `default alias "${defaultAliasPath}" is generated by both "${existingOwner}" and "${routePath}". The later route keeps the alias and the earlier one falls back to its actual path on H5.`);
        }
        defaultAliases[routePath] = defaultAliasPath;
        defaultAliasOwners[defaultAliasPath] = routePath;
    });
    return {
        config: {
            homeRoute,
            actualRoutes,
            customAliases: effectiveCustomAliases,
            defaultAliases,
        },
        warnings,
    };
}
