import { DEFAULT_HOME_ROUTE_PATH, getDefaultAliasPath, normalizeRoutePath } from "./core/shared.js";

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

type RouteDescriptor = {
  routePath: string;
  aliasPath?: string;
};

export function stripJsonComments(source: string) {
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
      } else if (currentChar === "\\") {
        escaped = true;
      } else if (currentChar === '"') {
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

export function stripTrailingCommas(source: string) {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const currentChar = source[index];

    if (inString) {
      result += currentChar;
      if (escaped) {
        escaped = false;
      } else if (currentChar === "\\") {
        escaped = true;
      } else if (currentChar === '"') {
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

export function parsePagesJsonText(source: string) {
  return JSON.parse(stripTrailingCommas(stripJsonComments(source))) as PagesJsonConfig;
}

function joinRouteSegments(...segments: Array<string | undefined>) {
  return normalizeRoutePath(segments.filter(Boolean).join("/"));
}

function isReservedAliasPath(aliasPath: string) {
  return normalizeRoutePath(aliasPath) === "/";
}

function hasUnsupportedRouteSuffix(aliasPath: string) {
  return /[?#]/.test(aliasPath);
}

function pushWarning(warnings: string[], message: string) {
  warnings.push(`uni-routealias: ${message}`);
}

function collectRouteDescriptors(config: PagesJsonConfig) {
  const routeDescriptors: RouteDescriptor[] = [];
  const subPackages = [...(config.subPackages ?? []), ...(config.subpackages ?? [])];

  config.pages?.forEach((page) => {
    if (!page.path) {
      return;
    }

    routeDescriptors.push({
      routePath: normalizeRoutePath(page.path),
      aliasPath: page.routeAlias ? normalizeRoutePath(page.routeAlias) : undefined,
    });
  });

  subPackages.forEach((subPackage) => {
    subPackage.pages?.forEach((page) => {
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

export function createRouteAliasState(config: PagesJsonConfig): RouteAliasState {
  const customAliasCandidates: Record<string, string> = {};
  const customAliasOwners: Record<string, string> = {};
  const actualRouteOwners: Record<string, string> = {};
  const defaultAliases: Record<string, string> = {};
  const defaultAliasOwners: Record<string, string> = {};
  const warnings: string[] = [];
  const routeDescriptors = collectRouteDescriptors(config);
  const actualRoutes = Array.from(new Set(routeDescriptors.map((descriptor) => descriptor.routePath)));
  const homeRoute = actualRoutes[0] ?? DEFAULT_HOME_ROUTE_PATH;

  actualRoutes.forEach((routePath) => {
    actualRouteOwners[routePath] = routePath;
  });

  routeDescriptors.forEach(({ routePath, aliasPath }) => {
    if (!aliasPath) {
      return;
    }

    if (hasUnsupportedRouteSuffix(aliasPath)) {
      pushWarning(
        warnings,
        `custom alias "${aliasPath}" of "${routePath}" contains "?" or "#". Only pure path aliases are supported, so this alias is ignored.`
      );
      return;
    }

    if (isReservedAliasPath(aliasPath)) {
      pushWarning(
        warnings,
        `custom alias "/" of "${routePath}" is ignored. "/" is reserved as the home-route shortcut and always points to "${homeRoute}".`
      );
      return;
    }

    if (aliasPath === routePath) {
      pushWarning(
        warnings,
        `custom alias "${aliasPath}" of "${routePath}" matches the actual route path, so it is ignored as redundant.`
      );
      return;
    }

    const previousAlias = customAliasCandidates[routePath];
    if (previousAlias && previousAlias !== aliasPath && customAliasOwners[previousAlias] === routePath) {
      delete customAliasOwners[previousAlias];
    }

    const existingOwner = customAliasOwners[aliasPath];
    if (existingOwner && existingOwner !== routePath) {
      pushWarning(
        warnings,
        `custom alias "${aliasPath}" is declared by both "${existingOwner}" and "${routePath}". The last declaration wins.`
      );
    }

    customAliasCandidates[routePath] = aliasPath;
    customAliasOwners[aliasPath] = routePath;
  });

  const effectiveCustomAliases: Record<string, string> = {};
  const effectiveCustomAliasOwners: Record<string, string> = {};

  Object.entries(customAliasOwners).forEach(([aliasPath, routePath]) => {
    if (actualRouteOwners[aliasPath] && actualRouteOwners[aliasPath] !== routePath) {
      pushWarning(
        warnings,
        `custom alias "${aliasPath}" of "${routePath}" conflicts with actual route "${actualRouteOwners[aliasPath]}". The custom alias is disabled to avoid H5 route collisions.`
      );
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
      pushWarning(
        warnings,
        `default alias "${defaultAliasPath}" of "${routePath}" conflicts with actual route "${actualRouteOwners[defaultAliasPath]}". The default alias is disabled to avoid H5 route collisions.`
      );
      return;
    }

    if (
      effectiveCustomAliasOwners[defaultAliasPath] &&
      effectiveCustomAliasOwners[defaultAliasPath] !== routePath
    ) {
      pushWarning(
        warnings,
        `default alias "${defaultAliasPath}" of "${routePath}" conflicts with custom alias of "${effectiveCustomAliasOwners[defaultAliasPath]}". The default alias is disabled and the custom alias keeps precedence.`
      );
      return;
    }

    if (effectiveCustomAliasOwners[defaultAliasPath] === routePath) {
      return;
    }

    const existingOwner = defaultAliasOwners[defaultAliasPath];
    if (existingOwner && existingOwner !== routePath) {
      pushWarning(
        warnings,
        `default alias "${defaultAliasPath}" is generated by both "${existingOwner}" and "${routePath}". The later route keeps the alias and the earlier one falls back to its actual path on H5.`
      );
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
