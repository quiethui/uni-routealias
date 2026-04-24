export type RouteAliasMap = Record<string, string>;

export type RouteUrlParts = {
  path: string;
  query: string;
  hash: string;
};

export const PAGES_PREFIX = "/pages";
export const UNI_MODULES_PREFIX = "/uni_modules";
export const DEFAULT_HOME_ROUTE_PATH = "/pages/index/index";

const EXTERNAL_URL_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function normalizeRoutePath(path = "") {
  if (!path) {
    return "/";
  }

  const normalizedPath = (path.startsWith("/") ? path : `/${path}`).replace(/\/{2,}/g, "/");
  if (normalizedPath === "/") {
    return normalizedPath;
  }

  return normalizedPath.replace(/\/+$/, "");
}

export function normalizeRouteMap(routeMap: RouteAliasMap = {}) {
  return Object.entries(routeMap).reduce<RouteAliasMap>((result, [routePath, aliasPath]) => {
    result[normalizeRoutePath(routePath)] = normalizeRoutePath(aliasPath);
    return result;
  }, {});
}

export function splitRouteUrl(url: string): RouteUrlParts {
  const normalizedUrl = String(url ?? "");
  const hashIndex = normalizedUrl.indexOf("#");
  const pathWithQuery = hashIndex >= 0 ? normalizedUrl.slice(0, hashIndex) : normalizedUrl;
  const hash = hashIndex >= 0 ? normalizedUrl.slice(hashIndex + 1) : "";
  const queryIndex = pathWithQuery.indexOf("?");
  const path = queryIndex >= 0 ? pathWithQuery.slice(0, queryIndex) : pathWithQuery;
  const query = queryIndex >= 0 ? pathWithQuery.slice(queryIndex + 1) : "";

  return {
    path,
    query,
    hash,
  };
}

export function joinRouteUrl(path: string, query = "", hash = "") {
  const normalizedPath = path || "/";
  const querySegment = query ? `?${query}` : "";
  const hashSegment = hash ? `#${hash}` : "";
  return `${normalizedPath}${querySegment}${hashSegment}`;
}

export function isExternalUrl(url: string) {
  return EXTERNAL_URL_RE.test(String(url ?? "").trim());
}

export function getDefaultAliasPath(actualPath: string) {
  const normalizedActualPath = normalizeRoutePath(actualPath);

  if (normalizedActualPath.startsWith(`${PAGES_PREFIX}/`)) {
    return normalizedActualPath.slice(PAGES_PREFIX.length) || "/";
  }

  return normalizedActualPath;
}

export function toRouteMetaPath(path: string) {
  const normalizedPath = normalizeRoutePath(path);
  return normalizedPath === "/" ? "" : normalizedPath.replace(/^\//, "");
}
