export type RouteAliasMap = Record<string, string>;
export type RouteUrlParts = {
    path: string;
    query: string;
    hash: string;
};
export declare const PAGES_PREFIX = "/pages";
export declare const UNI_MODULES_PREFIX = "/uni_modules";
export declare const DEFAULT_HOME_ROUTE_PATH = "/pages/index/index";
export declare function normalizeRoutePath(path?: string): string;
export declare function normalizeRouteMap(routeMap?: RouteAliasMap): RouteAliasMap;
export declare function splitRouteUrl(url: string): RouteUrlParts;
export declare function joinRouteUrl(path: string, query?: string, hash?: string): string;
export declare function isExternalUrl(url: string): boolean;
export declare function getDefaultAliasPath(actualPath: string): string;
export declare function toRouteMetaPath(path: string): string;
