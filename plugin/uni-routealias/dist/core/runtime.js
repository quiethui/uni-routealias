var _a;
import routeAliasConfig from "virtual:route-alias-config";
import { DEFAULT_HOME_ROUTE_PATH, PAGES_PREFIX, UNI_MODULES_PREFIX, isExternalUrl, joinRouteUrl, normalizeRouteMap, normalizeRoutePath, splitRouteUrl, toRouteMetaPath, } from "./shared.js";
function getPreferredAliasPath(actualPath) {
    const normalizedActualPath = normalizeRoutePath(actualPath);
    return (CUSTOM_ROUTE_ALIASES[normalizedActualPath] ||
        DEFAULT_ROUTE_ALIASES[normalizedActualPath] ||
        normalizedActualPath);
}
function getRouteRecordPath(route) {
    var _a;
    if ((_a = route.meta) === null || _a === void 0 ? void 0 : _a.route) {
        return normalizeRoutePath(route.meta.route);
    }
    if (route.path === "/") {
        return HOME_ROUTE_PATH;
    }
    return normalizeRoutePath(route.path);
}
function invertRouteMap(routeMap = {}) {
    return Object.entries(routeMap).reduce((result, [routePath, aliasPath]) => {
        result[aliasPath] = routePath;
        return result;
    }, {});
}
function applyRoutePublicState(route, actualPath) {
    const publicPath = getPreferredAliasPath(actualPath);
    if (publicPath === actualPath || (route.path === "/" && publicPath === "/")) {
        delete route.alias;
    }
    else {
        route.alias = publicPath;
    }
    route.meta = route.meta || {};
    route.meta.route = toRouteMetaPath(publicPath);
}
const runtimeConfig = routeAliasConfig;
const HOME_ROUTE_PATH = normalizeRoutePath(runtimeConfig.homeRoute || DEFAULT_HOME_ROUTE_PATH);
const ACTUAL_ROUTE_PATHS = new Set(((_a = runtimeConfig.actualRoutes) !== null && _a !== void 0 ? _a : []).map((routePath) => normalizeRoutePath(routePath)));
ACTUAL_ROUTE_PATHS.add(HOME_ROUTE_PATH);
const CUSTOM_ROUTE_ALIASES = normalizeRouteMap(runtimeConfig.customAliases);
const DEFAULT_ROUTE_ALIASES = normalizeRouteMap(runtimeConfig.defaultAliases);
const CUSTOM_ALIAS_TO_ROUTE_PATH = invertRouteMap(CUSTOM_ROUTE_ALIASES);
const DEFAULT_ALIAS_TO_ROUTE_PATH = invertRouteMap(DEFAULT_ROUTE_ALIASES);
function getActualPathByDefaultAlias(path) {
    const normalizedPath = normalizeRoutePath(path);
    if (normalizedPath === "/" ||
        normalizedPath.startsWith(`${PAGES_PREFIX}/`) ||
        normalizedPath.startsWith(`${UNI_MODULES_PREFIX}/`)) {
        return null;
    }
    const defaultActualPath = `${PAGES_PREFIX}${normalizedPath}`;
    return ACTUAL_ROUTE_PATHS.has(defaultActualPath) ? defaultActualPath : null;
}
export function tryResolveActualRoutePath(path) {
    const normalizedPath = normalizeRoutePath(path);
    if (normalizedPath === "/") {
        return HOME_ROUTE_PATH;
    }
    if (ACTUAL_ROUTE_PATHS.has(normalizedPath)) {
        return normalizedPath;
    }
    const customRoutePath = CUSTOM_ALIAS_TO_ROUTE_PATH[normalizedPath];
    if (customRoutePath) {
        return customRoutePath;
    }
    const defaultAliasRoutePath = DEFAULT_ALIAS_TO_ROUTE_PATH[normalizedPath];
    if (defaultAliasRoutePath) {
        return defaultAliasRoutePath;
    }
    return getActualPathByDefaultAlias(normalizedPath);
}
export function hasKnownRoutePath(path) {
    return tryResolveActualRoutePath(path) !== null;
}
export function resolveActualRoutePath(path) {
    return tryResolveActualRoutePath(path) || normalizeRoutePath(path);
}
export function tryResolveActualRouteUrl(url) {
    if (isExternalUrl(url)) {
        return url;
    }
    const { path, query, hash } = splitRouteUrl(url);
    const actualPath = tryResolveActualRoutePath(path);
    return actualPath ? joinRouteUrl(actualPath, query, hash) : null;
}
export function resolveActualRouteUrl(url) {
    if (isExternalUrl(url)) {
        return url;
    }
    const resolvedUrl = tryResolveActualRouteUrl(url);
    if (resolvedUrl) {
        return resolvedUrl;
    }
    const { path, query, hash } = splitRouteUrl(url);
    return joinRouteUrl(resolveActualRoutePath(path), query, hash);
}
export function resolvePlatformRouteUrl(url) {
    if (isExternalUrl(url)) {
        return url;
    }
    const { path, query, hash } = splitRouteUrl(url);
    const actualPath = resolveActualRoutePath(path);
    let targetPath = actualPath;
    // #ifdef H5
    targetPath = normalizeRoutePath(path) === "/" ? "/" : getPreferredAliasPath(actualPath);
    // #endif
    return joinRouteUrl(targetPath, query, hash);
}
export function resolvePublicRouteUrl(url) {
    if (isExternalUrl(url)) {
        return url;
    }
    const { path, query, hash } = splitRouteUrl(url);
    if (normalizeRoutePath(path) === "/") {
        return joinRouteUrl("/", query, hash);
    }
    const actualPath = resolveActualRoutePath(path);
    return joinRouteUrl(getPreferredAliasPath(actualPath), query, hash);
}
export function getRoutePublicPaths(path) {
    const actualPath = tryResolveActualRoutePath(path);
    if (!actualPath) {
        return [normalizeRoutePath(path)];
    }
    const publicPaths = new Set([actualPath]);
    const defaultAliasPath = DEFAULT_ROUTE_ALIASES[actualPath];
    const customAliasPath = CUSTOM_ROUTE_ALIASES[actualPath];
    if (defaultAliasPath) {
        publicPaths.add(defaultAliasPath);
    }
    if (customAliasPath) {
        publicPaths.add(customAliasPath);
    }
    if (actualPath === HOME_ROUTE_PATH) {
        publicPaths.add("/");
    }
    return [...publicPaths];
}
export function installH5RouteAliases() {
    var _a, _b;
    // #ifdef H5
    const globalScope = globalThis;
    const routes = globalScope.__uniRoutes;
    if (!Array.isArray(routes)) {
        return;
    }
    routes.forEach((route) => {
        const actualPath = tryResolveActualRoutePath(getRouteRecordPath(route));
        if (!actualPath) {
            return;
        }
        applyRoutePublicState(route, actualPath);
    });
    const tabBarList = (_b = (_a = globalScope.__uniConfig) === null || _a === void 0 ? void 0 : _a.tabBar) === null || _b === void 0 ? void 0 : _b.list;
    if (Array.isArray(tabBarList)) {
        tabBarList.forEach((item) => {
            const actualPath = tryResolveActualRoutePath(item.pagePath);
            if (!actualPath) {
                return;
            }
            item.pagePath = toRouteMetaPath(getPreferredAliasPath(actualPath));
        });
    }
    // #endif
}
