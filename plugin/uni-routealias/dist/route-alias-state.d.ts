export type PagesJsonPageRecord = {
    path?: string;
    routeAlias?: string;
};
export type PagesJsonSubPackage = {
    root?: string;
    pages?: PagesJsonPageRecord[];
};
export type PagesJsonConfig = {
    pages?: PagesJsonPageRecord[];
    subPackages?: PagesJsonSubPackage[];
    subpackages?: PagesJsonSubPackage[];
};
export type RouteAliasRuntimeConfig = {
    homeRoute: string;
    actualRoutes: string[];
    customAliases: Record<string, string>;
    defaultAliases: Record<string, string>;
};
export type RouteAliasState = {
    config: RouteAliasRuntimeConfig;
    warnings: string[];
};
export declare function stripJsonComments(source: string): string;
export declare function stripTrailingCommas(source: string): string;
export declare function parsePagesJsonText(source: string): PagesJsonConfig;
export declare function createRouteAliasState(config: PagesJsonConfig): RouteAliasState;
