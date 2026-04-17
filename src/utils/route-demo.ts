import {
  getRoutePublicPaths,
  resolveActualRoutePath,
  resolveActualRouteUrl,
  resolvePlatformRouteUrl,
  resolvePublicRouteUrl,
} from "@/uni_modules/uni-routealias";

export type DemoTone = "cyan" | "emerald" | "amber";
export type DemoOpenType = "navigateTo" | "redirectTo" | "reLaunch" | "switchTab";

export type DemoRouteItem = {
  id: string;
  title: string;
  description: string;
  inputUrl: string;
  tone: DemoTone;
  openType?: DemoOpenType;
};

export type RouteRegistryItem = {
  title: string;
  actualPath: string;
  note: string;
  scope: string;
};

export type ProjectModuleItem = {
  name: string;
  summary: string;
  sample: string;
};

export type RouteResolution = {
  actualPath: string;
  actualUrl: string;
  platformUrl: string;
  publicUrl: string;
  publicPaths: string[];
};

export type PageSnapshot = {
  route: string;
  fullPath: string;
  options: Record<string, string>;
  stackDepth: number;
};

export const routeShowcaseItems: DemoRouteItem[] = [
  {
    id: "raw-route",
    title: "原始路由",
    description: "直接使用 /pages/... 打开 Playground。",
    inputUrl: "/pages/routes/playground/index?entry=raw",
    tone: "cyan",
    openType: "navigateTo",
  },
  {
    id: "default-alias",
    title: "默认 alias",
    description: "去掉 /pages 前缀后访问同一个 Playground 页面。",
    inputUrl: "/routes/playground/index?entry=default",
    tone: "cyan",
    openType: "navigateTo",
  },
  {
    id: "custom-alias",
    title: "Tab alias",
    description: "切到 /signal，演示 tab 页也能使用自定义 alias。",
    inputUrl: "/signal",
    tone: "emerald",
    openType: "switchTab",
  },
  {
    id: "detail-alias",
    title: "详情 alias",
    description: "用 /pulse?id=2048 演示自定义 alias + 参数透传。",
    inputUrl: "/pulse?id=2048",
    tone: "amber",
    openType: "navigateTo",
  },
  {
    id: "observatory",
    title: "路由观测台",
    description: "切到 /observatory 查看所有页面的映射关系。",
    inputUrl: "/observatory",
    tone: "cyan",
    openType: "switchTab",
  },
  {
    id: "subpackage",
    title: "分包 alias",
    description: "打开 /campaign，查看分包页的短链写法。",
    inputUrl: "/campaign?entry=subpackage",
    tone: "amber",
    openType: "navigateTo",
  },
];

export const routeRegistryItems: RouteRegistryItem[] = [
  {
    title: "Home",
    actualPath: "/pages/home/index",
    note: "入口页，不写 routeAlias，保留 / 和 /home/index 两种可读入口。",
    scope: "main",
  },
  {
    title: "Observatory",
    actualPath: "/pages/observatory/index",
    note: "自定义 alias 为 /observatory，用于展示项目结构和路由注册表。",
    scope: "main",
  },
  {
    title: "Playground",
    actualPath: "/pages/routes/playground/index",
    note: "没有自定义 alias，专门用来对比原始路由和默认 alias。",
    scope: "main",
  },
  {
    title: "Signal",
    actualPath: "/pages/signal/index",
    note: "自定义 alias 为 /signal，模拟业务感更强的入口页。",
    scope: "main",
  },
  {
    title: "Pulse Detail",
    actualPath: "/pages/article/detail",
    note: "自定义 alias 为 /pulse，用来演示带参数的公开地址。",
    scope: "main",
  },
  {
    title: "Campaign",
    actualPath: "/packages/showcase/campaign/index",
    note: "分包页的实际路径不以 /pages 开头，routeAlias 更有价值。",
    scope: "subpackage",
  },
];

export const projectModules: ProjectModuleItem[] = [
  {
    name: "pages/",
    summary: "页面按业务域拆分，入口、观测台、Playground、Signal、Detail 都是独立页。",
    sample: "pages/home/index.vue",
  },
  {
    name: "packages/",
    summary: "分包页单独收口，示例里把活动页放进 packages/showcase。",
    sample: "packages/showcase/campaign/index.vue",
  },
  {
    name: "components/",
    summary: "抽出统一页面骨架、玻璃面板和路由卡片，页面层只保留业务语义。",
    sample: "components/route-action-card.vue",
  },
  {
    name: "composables/",
    summary: "把导航动作和页面路由状态读取封装成组合式函数，减少重复代码。",
    sample: "composables/use-route-page.ts",
  },
  {
    name: "utils/",
    summary: "演示数据、项目结构说明和路径辅助函数都放到统一的数据层。",
    sample: "utils/route-demo.ts",
  },
];

export function extractRoutePath(url: string) {
  const normalizedUrl = String(url ?? "");
  const hashIndex = normalizedUrl.indexOf("#");
  const pathWithQuery = hashIndex >= 0 ? normalizedUrl.slice(0, hashIndex) : normalizedUrl;
  const queryIndex = pathWithQuery.indexOf("?");
  return queryIndex >= 0 ? pathWithQuery.slice(0, queryIndex) : pathWithQuery;
}

export function normalizeQuery(query: Record<string, unknown> | undefined | null = {}) {
  const safeQuery = query ?? {};

  return Object.entries(safeQuery).reduce<Record<string, string>>((result, [key, value]) => {
    if (value === undefined || value === null || value === "") {
      return result;
    }

    result[key] = Array.isArray(value) ? value.join(",") : String(value);
    return result;
  }, {});
}

export function appendQuery(
  path: string,
  query: Record<string, string | number | undefined> | Record<string, string> = {}
) {
  const search = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");

  if (!search) {
    return path;
  }

  return `${path}?${search}`;
}

export function formatQueryRecord(query: Record<string, string>) {
  const entries = Object.entries(query);
  if (!entries.length) {
    return "无附加参数";
  }

  return entries.map(([key, value]) => `${key}=${value}`).join(" · ");
}

export function labelOpenType(openType: DemoOpenType = "navigateTo") {
  if (openType === "switchTab") {
    return "switchTab";
  }

  if (openType === "redirectTo") {
    return "redirectTo";
  }

  if (openType === "reLaunch") {
    return "reLaunch";
  }

  return "navigateTo";
}

export function getResolvedRouteInfo(url: string): RouteResolution {
  const actualPath = resolveActualRoutePath(extractRoutePath(url));

  return {
    actualPath,
    actualUrl: resolveActualRouteUrl(url),
    platformUrl: resolvePlatformRouteUrl(url),
    publicUrl: resolvePublicRouteUrl(url),
    publicPaths: getRoutePublicPaths(actualPath),
  };
}

export function getCurrentPageSnapshot(): PageSnapshot {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as
    | ({
        route?: string;
        options?: Record<string, unknown>;
        $page?: {
          fullPath?: string;
        };
      })
    | undefined;

  return {
    route: currentPage?.route ? `/${currentPage.route}` : "",
    fullPath: currentPage?.$page?.fullPath ? String(currentPage.$page.fullPath) : "",
    options: normalizeQuery(currentPage?.options),
    stackDepth: pages.length,
  };
}
