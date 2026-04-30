# uni-routealias

[![npm version](https://img.shields.io/npm/v/uni-routealias.svg)](https://www.npmjs.com/package/uni-routealias)
[![license](https://img.shields.io/npm/l/uni-routealias.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/uni-routealias.svg)](https://www.npmjs.com/package/uni-routealias)

为 `uni-app Vue3 + Vite` 提供 `pages.json` 路由别名、公开路径转换与 H5 地址栏 alias 注入。

`uni-routealias` 可以把 uni-app 真实页面路径转换成更短、更稳定、更适合对外展示的公开路径。例如把 `/pages/custom/index` 暴露成 `/custom-entry`，并在 H5、App、小程序等平台中统一处理跳转路径。

## 相关链接

- npm：[`uni-routealias`](https://www.npmjs.com/package/uni-routealias)
- DCloud 插件市场：[`quiethui-routealias`](https://ext.dcloud.net.cn/plugin?id=27693)

## 特性

- 从 `pages.json` 自动生成真实路径、默认 alias、自定义 alias 映射
- 支持 H5 地址栏展示业务化公开路径
- 支持主包页面、分包页面和 `tabBar` 页面
- 提供真实路径、公开路径、平台跳转路径之间的转换 API
- 对重复 alias、冲突 alias、保留路径 `/` 输出构建期 warning
- 提供严格解析 API，避免未知路径被误解析为未注册页面

## 适用场景

- 希望 H5 地址栏展示 `/mine`、`/campaign` 这类业务路径，而不是 `/pages/**/index`
- 希望分享链接、活动链接、落地页链接保持简洁稳定
- 希望同一套路由写法兼容 H5、App 和小程序
- 希望给分包页面配置更短的公开访问路径

## 安装

### 环境要求

- Node.js `>= 18`
- `uni-app Vue3 + Vite`
- 推荐使用 `pnpm`

### 安装依赖

```bash
pnpm add uni-routealias
```

也可以使用 npm 或 yarn：

```bash
npm install uni-routealias
yarn add uni-routealias
```

## 快速开始

### 1. 注册 Vite 插件

在 `vite.config.ts` 中注册 `createRouteAliasVitePlugin()`：

```ts
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { createRouteAliasVitePlugin } from "uni-routealias/vite";

export default defineConfig({
  plugins: [createRouteAliasVitePlugin(), uni()],
});
```

默认会优先读取项目根目录下的 `src/pages.json`，如果不存在再回退到 `pages.json`。如果你的配置文件在其他位置，可以显式传入路径：

```ts
createRouteAliasVitePlugin("./src/pages.json");
```

### 2. 安装运行时插件

在 `src/main.ts` 中调用一次 `installRouteAliasPlugin()`：

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

### 3. 配置页面 alias

在 `pages.json` 的页面项根级添加 `routeAlias`：

```json
{
  "pages": [
    {
      "path": "pages/home/index",
      "routeAlias": "/home",
      "style": {
        "navigationBarTitleText": "首页"
      }
    },
    {
      "path": "pages/custom/index",
      "routeAlias": "/custom-entry",
      "style": {
        "navigationBarTitleText": "自定义 alias 示例"
      }
    }
  ],
  "subPackages": [
    {
      "root": "packages/demo",
      "pages": [
        {
          "path": "subpage/index",
          "routeAlias": "/subpackage-entry"
        }
      ]
    }
  ]
}
```

> `routeAlias` 必须写在页面配置根级，不能写进 `style`。

### 4. 使用公开路径跳转

页面中统一使用 `resolvePlatformRouteUrl()` 处理跳转路径：

```ts
import { resolvePlatformRouteUrl } from "uni-routealias";

uni.navigateTo({
  url: resolvePlatformRouteUrl("/custom-entry?id=1001"),
});
```

它会根据平台返回合适的路径：

- H5：优先使用公开路径 / alias，地址栏更简洁
- App / 小程序：返回 uni-app 可识别的真实页面路径
- 外链：原样返回

## 路由规则

### 真实路径

真实路径就是 uni-app 原本使用的页面路径：

```text
/pages/home/index
/pages/custom/index
/packages/demo/subpage/index
```

### 默认 alias

当页面路径以 `/pages/` 开头时，插件会自动生成一个默认 alias：

```text
/pages/profile/index -> /profile/index
/pages/article/detail -> /article/detail
```

分包路径不会自动缩短。如果分包页面也需要公开路径，请显式配置 `routeAlias`。

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
- `resolvePublicRouteUrl("/pages/profile/index")` 返回 `/mine`
- 默认 alias 仍可参与解析，前提是没有发生冲突

### 首页与 `/`

- `/` 永远保留为首页快捷入口
- 不建议把任何页面的 `routeAlias` 配成 `/`
- 如果这样配置，构建阶段会输出 warning，并忽略该 alias

## API

| API | 作用 |
| --- | --- |
| `installRouteAliasPlugin()` | 安装运行时插件，通常在 `main.ts` 调用一次 |
| `resolveActualRoutePath(path)` | 将公开路径转为真实页面路径 |
| `tryResolveActualRoutePath(path)` | 严格解析公开路径，失败返回 `null` |
| `hasKnownRoutePath(path)` | 判断路径是否属于已知页面 |
| `resolveActualRouteUrl(url)` | 将公开 URL 转成真实跳转 URL，并保留 query 和 hash |
| `tryResolveActualRouteUrl(url)` | 严格解析公开 URL，失败返回 `null` |
| `resolvePlatformRouteUrl(url)` | 返回当前平台适合跳转的 URL |
| `resolvePublicRouteUrl(url)` | 将真实页面 URL 转为对外展示用的公开 URL |
| `getRoutePublicPaths(path)` | 获取某个页面全部可用公开路径 |
| `installH5RouteAliases()` | 手动注入 H5 路由 alias，通常不需要直接调用 |

## 示例项目

本仓库包含一个可直接运行的 `uni-app Vue3 + Vite` 示例项目，用于演示 `uni-routealias` 的接入方式与实际效果。

```bash
pnpm install
pnpm dev:h5
```

示例项目覆盖以下路由场景：

| 场景 | 真实路径 | 公开路径 / alias |
| --- | --- | --- |
| 首页 alias | `/pages/home/index` | `/home` |
| 真实路径 | `/pages/with-pages/index` | `/pages/with-pages/index` |
| 默认 alias | `/pages/default-alias/index` | `/default-alias/index` |
| 自定义 alias | `/pages/custom/index` | `/custom-entry` |
| 分包 alias | `/packages/demo/subpage/index` | `/subpackage-entry` |

## 项目结构

```text
.
├─ plugin/
│  └─ uni-routealias/        # 插件源码与 npm 发布目录
├─ src/                      # uni-app 示例项目源码
│  ├─ pages/                 # 主包页面
│  ├─ packages/demo/         # 分包页面
│  ├─ main.ts                # 运行时插件安装入口
│  └─ pages.json             # 页面与 routeAlias 示例配置
├─ vite.config.ts            # 示例项目 Vite 配置
└─ package.json              # 示例项目脚本与本地 file 依赖
```

插件 npm 包源码位于 [`plugin/uni-routealias`](./plugin/uni-routealias)：

- `vite.ts`：Vite 插件入口，读取 `pages.json` 并注入虚拟模块
- `route-alias-state.ts`：生成真实路径、默认 alias、自定义 alias 映射
- `core/runtime.ts`：运行时路径解析、公开路径转换、H5 alias 注入逻辑
- `core/install.ts`：运行时安装入口

## 开发

### 示例项目脚本

```bash
pnpm dev:h5          # 启动 H5 开发服务
pnpm build:h5        # 构建 H5 示例
pnpm type-check      # TypeScript 类型检查
pnpm dev:mp-weixin   # 启动微信小程序开发构建
pnpm build:mp-weixin # 构建微信小程序
```

### 插件包脚本

```bash
cd plugin/uni-routealias
pnpm install
pnpm build
```

## 注意事项

- 当前面向 `uni-app Vue3 + Vite`，不面向 `uni-app Vue2` 或 `uni-app x`
- `routeAlias` 只能是纯路径，不能携带 `?` 或 `#`
- 默认 alias 只会自动裁掉 `/pages` 前缀，分包页面建议显式配置 `routeAlias`
- 自定义 alias 与真实路径或其他 alias 冲突时，构建阶段会输出 warning
- 如果 H5 地址栏没有展示 alias，请确认 `vite.config.ts` 和 `main.ts` 是否都已完成接入

## 贡献

欢迎提交 issue、功能建议和 pull request。开始贡献前请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 安全

如果你发现安全问题，请参考 [SECURITY.md](./SECURITY.md) 中的反馈方式。

## License

[MIT](./LICENSE)
