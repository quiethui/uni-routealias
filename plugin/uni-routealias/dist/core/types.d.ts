declare module "virtual:route-alias-config" {
  type RouteAliasVirtualConfig = {
    homeRoute: string;
    actualRoutes: string[];
    customAliases: Record<string, string>;
    defaultAliases: Record<string, string>;
  };

  const routeAliasConfig: RouteAliasVirtualConfig;
  export default routeAliasConfig;
}

declare module "@dcloudio/uni-shared" {
  export function onCreateVueApp(callback: () => void): void;
}
