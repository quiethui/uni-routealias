import routeAliasConfig from "virtual:route-alias-config";
import {
  DEFAULT_HOME_ROUTE_PATH,
  PAGES_PREFIX,
  UNI_MODULES_PREFIX,
  isExternalUrl,
  joinRouteUrl,
  normalizeRouteMap,
  normalizeRoutePath,
  splitRouteUrl,
  toRouteMetaPath,
  type RouteAliasMap,
} from "./shared.js";
import type { RouteAliasRuntimeConfig } from "../route-alias-state.js";

export type { RouteAliasMap } from "./shared.js";

type UniRouteRecord = {
  path: string;
  alias?: string;
  meta?: {
    route?: string;
    isTabBar?: boolean;
  };
};

type UniTabBarItem = {
  pagePath: string;
};

type UniConfig = {
  tabBar?: {
    list?: UniTabBarItem[];
  };
};

function getPreferredAliasPath(actualPath: string) {
  const normalizedActualPath = normalizeRoutePath(actualPath);
  return (
    CUSTOM_ROUTE_ALIASES[normalizedActualPath] ||
    DEFAULT_ROUTE_ALIASES[normalizedActualPath] ||
    normalizedActualPath
  );
}

function getRouteRecordPath(route: UniRouteRecord) {
  if (route.meta?.route) {
    return normalizeRoutePath(route.meta.route);
  }

  if (route.path === "/") {
    return HOME_ROUTE_PATH;
  }

  return normalizeRoutePath(route.path);
}

function invertRouteMap(routeMap: RouteAliasMap = {}) {
  return Object.entries(routeMap).reduce<RouteAliasMap>((result, [routePath, aliasPath]) => {
    result[aliasPath] = routePath;
    return result;
  }, {});
}

function applyRoutePublicState(route: UniRouteRecord, actualPath: string) {
  const publicPath = getPreferredAliasPath(actualPath);

  if (publicPath === actualPath || (route.path === "/" && publicPath === "/")) {
    delete route.alias;
  } else {
    route.alias = publicPath;
  }

  route.meta = route.meta || {};
  route.meta.route = toRouteMetaPath(publicPath);
}

const runtimeConfig = routeAliasConfig as RouteAliasRuntimeConfig;
const HOME_ROUTE_PATH = normalizeRoutePath(runtimeConfig.homeRoute || DEFAULT_HOME_ROUTE_PATH);
const ACTUAL_ROUTE_PATHS = new Set(
  (runtimeConfig.actualRoutes ?? []).map((routePath) => normalizeRoutePath(routePath))
);

ACTUAL_ROUTE_PATHS.add(HOME_ROUTE_PATH);

const CUSTOM_ROUTE_ALIASES = normalizeRouteMap(runtimeConfig.customAliases);
const DEFAULT_ROUTE_ALIASES = normalizeRouteMap(runtimeConfig.defaultAliases);
const CUSTOM_ALIAS_TO_ROUTE_PATH = invertRouteMap(CUSTOM_ROUTE_ALIASES);
const DEFAULT_ALIAS_TO_ROUTE_PATH = invertRouteMap(DEFAULT_ROUTE_ALIASES);

function getActualPathByDefaultAlias(path: string) {
  const normalizedPath = normalizeRoutePath(path);

  if (
    normalizedPath === "/" ||
    normalizedPath.startsWith(`${PAGES_PREFIX}/`) ||
    normalizedPath.startsWith(`${UNI_MODULES_PREFIX}/`)
  ) {
    return null;
  }

  const defaultActualPath = `${PAGES_PREFIX}${normalizedPath}`;
  return ACTUAL_ROUTE_PATHS.has(defaultActualPath) ? defaultActualPath : null;
}

export function tryResolveActualRoutePath(path: string) {
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

export function hasKnownRoutePath(path: string) {
  return tryResolveActualRoutePath(path) !== null;
}

export function resolveActualRoutePath(path: string) {
  return tryResolveActualRoutePath(path) || normalizeRoutePath(path);
}

export function tryResolveActualRouteUrl(url: string) {
  if (isExternalUrl(url)) {
    return url;
  }

  const { path, query, hash } = splitRouteUrl(url);
  const actualPath = tryResolveActualRoutePath(path);
  return actualPath ? joinRouteUrl(actualPath, query, hash) : null;
}

export function resolveActualRouteUrl(url: string) {
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

export function resolvePlatformRouteUrl(url: string) {
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

export function resolvePublicRouteUrl(url: string) {
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

export function getRoutePublicPaths(path: string) {
  const actualPath = tryResolveActualRoutePath(path);
  if (!actualPath) {
    return [normalizeRoutePath(path)];
  }

  const publicPaths = new Set<string>([actualPath]);
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
  // #ifdef H5
  const globalScope = globalThis as typeof globalThis & {
    __uniRoutes?: UniRouteRecord[];
    __uniConfig?: UniConfig;
  };
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

  const tabBarList = globalScope.__uniConfig?.tabBar?.list;
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
