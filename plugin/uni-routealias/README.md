# uni-routealias

`uni-routealias` 是一个面向 `uni-app Vue3 + Vite` 的轻量 npm 包，用来为 `pages.json` 中的页面配置更简洁、更稳定的公开路径。

它适合这类场景：

- 想把 `/pages/profile/index` 暴露成 `/mine`
- 想让 H5 地址栏展示更短、更有业务语义的路径
- 想统一生成分享链接、活动链接、落地页链接
- 想在 H5、App、小程序里复用一套公开路径写法
- 想让 `tabBar` 页面和分包页面也具备稳定的对外路径

## 特性

- 构建期自动读取 `pages.json`，生成真实路径、默认 alias、自定义 alias 映射
- 运行时提供真实路径、公开路径、平台跳转路径之间的统一转换方法
- H5 自动注入路由 alias，并同步 `meta.route` 与 `tabBar.pagePath`
- 同时支持主包页面和分包页面
- 对重复 alias、冲突 alias、保留路径 `/` 做显式 warning
- 提供严格解析 API，避免把错误输入静默伪装成 `/pages/...`

## 适用前提

- `uni-app`
- `Vue3`
- `Vite`

> 当前不面向 `uni-app Vue2`，也不面向 `uni-app x`。

## 安装

```bash
pnpm add uni-routealias
```

```bash
npm install uni-routealias
```

```bash
yarn add uni-routealias
```

## 接入

### 1. 在 `vite.config.ts` 注册构建插件

默认会优先读取当前项目根目录下的 `src/pages.json`，如果不存在再回退到 `pages.json`。

```ts
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { createRouteAliasVitePlugin } from "uni-routealias/vite";

export default defineConfig({
  plugins: [createRouteAliasVitePlugin(), uni()],
});
```

如果你的 `pages.json` 放在自定义位置，可以显式传入路径：

```ts
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { createRouteAliasVitePlugin } from "uni-routealias/vite";

export default defineConfig({
  plugins: [createRouteAliasVitePlugin("./src/pages.json"), uni()],
});
```

### 2. 在 `main.ts` 安装运行时插件

```ts
import App from "./App.vue";
import { createSSRApp } from "vue";
import { installRouteAliasPlugin } from "uni-routealias";

installRouteAliasPlugin();

export function createApp() {
  const app = createSSRApp(App);
  return { app };
}
```

### 3. 在 `pages.json` 中配置 `routeAlias`

```json
{
  "pages": [
    {
      "path": "pages/profile/index",
      "routeAlias": "/mine",
      "style": {
        "navigationBarTitleText": "个人中心"
      }
    },
    {
      "path": "pages/article/detail",
      "routeAlias": "/post",
      "style": {
        "navigationBarTitleText": "文章详情"
      }
    }
  ],
  "subPackages": [
    {
      "root": "packages/showcase",
      "pages": [
        {
          "path": "campaign/index",
          "routeAlias": "/campaign"
        }
      ]
    }
  ]
}
```

### 4. 统一通过公开路径跳转

```ts
import { resolvePlatformRouteUrl } from "uni-routealias";

uni.navigateTo({
  url: resolvePlatformRouteUrl("/post?id=9527&tab=comments"),
});
```

```ts
import { resolvePlatformRouteUrl } from "uni-routealias";

uni.switchTab({
  url: resolvePlatformRouteUrl("/mine"),
});
```

```ts
import { resolvePublicRouteUrl } from "uni-routealias";

const shareUrl = resolvePublicRouteUrl("/pages/article/detail?id=9527");
// => /post?id=9527
```

## 路由规则

### 真实路径

真实路径就是 uni-app 原本使用的页面路径，例如：

- `/pages/profile/index`
- `/pages/article/detail`
- `/packages/showcase/campaign/index`

### 默认 alias

当页面路径以 `/pages/` 开头时，插件会自动生成一个默认 alias：

- `/pages/profile/index` -> `/profile/index`
- `/pages/article/detail` -> `/article/detail`

如果页面路径不以 `/pages/` 开头，例如分包根目录写成 `packages/...`，插件不会自动缩短它。这类页面如果希望暴露更短路径，请显式配置 `routeAlias`。

### 自定义 alias

如果页面项配置了 `routeAlias`，它会成为该页面的首选公开路径：

```json
{
  "path": "pages/profile/index",
  "routeAlias": "/mine"
}
```

对应行为：

- H5 地址栏优先展示 `/mine`
- `resolvePublicRouteUrl("/pages/profile/index")` 会返回 `/mine`
- 默认 alias 仍可参与解析，前提是没有发生冲突

### 首页与 `/`

- `/` 永远保留为首页快捷入口
- 不要把任何页面的 `routeAlias` 配成 `/`
- 如果这样配置，构建阶段会 warning，并忽略该 alias

如果你希望首页在 H5 地址栏展示成 `/home` 之类的业务路径，请显式为首页配置 `routeAlias`。

### 冲突处理

插件在构建阶段会尽量拦截危险 alias，规则如下：

- 真实路径优先级最高
- 自定义 alias 冲突时，后声明的页面成为最终生效页面
- 与真实路径冲突的自定义 alias 会被禁用
- 与真实路径或自定义 alias 冲突的默认 alias 会被禁用
- H5 只注入每个页面的首选 alias，避免超出 uni-h5 的单 alias 模型

## API

### `installRouteAliasPlugin()`

安装运行时钩子。通常只需要在 `main.ts` 调用一次。

### `resolveActualRoutePath(path)`

把公开路径转换成真实页面路径。

```ts
resolveActualRoutePath("/mine");
// => /pages/profile/index
```

### `tryResolveActualRoutePath(path)`

严格模式的路径解析。解析失败时返回 `null`。

```ts
tryResolveActualRoutePath("/mine");
// => /pages/profile/index

tryResolveActualRoutePath("/unknown");
// => null
```

### `hasKnownRoutePath(path)`

判断某个路径当前是否能被识别成已知页面。

### `resolveActualRouteUrl(url)`

把公开 URL 转成真实跳转 URL，并保留 query 和 hash。

### `tryResolveActualRouteUrl(url)`

严格模式的 URL 解析。无法映射到已知页面时返回 `null`。

### `resolvePlatformRouteUrl(url)`

返回当前平台真正适合用来跳转的 URL：

- H5 优先返回首选公开路径
- App / 小程序返回真实页面路径
- 外链原样返回

### `resolvePublicRouteUrl(url)`

把真实页面 URL 转成对外展示用的公开 URL。

### `getRoutePublicPaths(path)`

返回某个页面当前所有可用的路径集合。

```ts
getRoutePublicPaths("/pages/profile/index");
// => ["/pages/profile/index", "/profile/index", "/mine"]
```

### `installH5RouteAliases()`

手动把 alias 注入 H5 路由表。一般不需要手动调用，`installRouteAliasPlugin()` 已自动处理。

## 注意事项

- `routeAlias` 只能写在页面项根级，不能写进 `style`
- 自定义 `routeAlias` 不能使用 `/`，也不能携带 `?` 或 `#`
- 如果 `tabBar` 页面要走公开路径，建议统一通过 `resolvePlatformRouteUrl()` 发起 `switchTab`
- 默认 alias 只会自动裁掉 `/pages` 前缀；分包页面通常更适合显式配置 `routeAlias`
- 未知路径不会再被强行推断成一个未注册的 `/pages/...` 页面；如需严格判断，请优先使用 `tryResolveActualRoutePath()` 和 `tryResolveActualRouteUrl()`

## 常见问题

### H5 地址栏没有变成 alias

请依次检查：

- `vite.config.ts` 是否注册了 `createRouteAliasVitePlugin()`
- `main.ts` 是否调用了 `installRouteAliasPlugin()`
- `routeAlias` 是否写在页面根级
- 构建日志里是否存在 alias 冲突 warning

### 分包页面没有自动变短

默认 alias 只会自动裁掉 `/pages` 前缀。对于 `packages/...` 这类路径，请显式写 `routeAlias`。

## License

MIT
