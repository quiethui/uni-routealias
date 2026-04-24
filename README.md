# uni-routealias 示例项目

一个可直接运行的 `uni-app Vue3 + Vite` 示例项目，用于演示路由别名插件 [`uni-routealias`](./plugin/uni-routealias) 的接入方式与实际效果。

`uni-routealias` 可以把 `pages.json` 里的真实页面路径转换成更短、更稳定、更适合对外展示的公开路径。例如把 `/pages/custom/index` 暴露成 `/custom-entry`，并在 H5、App、小程序等平台中统一处理跳转路径。

## 相关链接

- npm 包：[`uni-routealias`](https://www.npmjs.com/package/uni-routealias)
- DCloud 插件市场：[`uni-routealias`](https://ext.dcloud.net.cn/plugin?id=27693)

## 项目亮点

- 演示 `uni-routealias` 在真实 `uni-app Vue3 + Vite` 项目中的完整接入流程
- 覆盖真实路径、默认 alias、自定义 alias、分包 alias 四种常见路由场景
- 使用本地 `file:` 依赖消费待发布 npm 包，便于插件开发与示例联调
- H5 下支持更友好的地址栏路径，非 H5 平台自动转换为 uni-app 可跳转的真实页面路径
- 提供清晰的页面入口，启动后可直接点击验证不同路由写法

## 技术栈

- `Vue 3`
- `uni-app`
- `Vite 5`
- `TypeScript`
- `uni-routealias`

## 目录结构

```text
.
├─ plugin/
│  └─ uni-routealias/        # 路由别名插件源码，作为本地 npm 包被示例项目引用
├─ src/
│  ├─ pages/                 # 主包页面
│  │  ├─ home/               # 首页，自定义 alias: /home
│  │  ├─ with-pages/         # 真实路径访问示例
│  │  ├─ default-alias/      # 默认 alias 示例
│  │  └─ custom/             # 自定义 alias 示例
│  ├─ packages/demo/         # 分包页面
│  │  └─ subpage/            # 分包 alias 示例
│  ├─ main.ts                # 安装运行时插件
│  └─ pages.json             # 页面与 routeAlias 配置
├─ vite.config.ts            # 注册 uni-routealias Vite 插件
└─ package.json
```

## 快速开始

### 环境要求

- Node.js `>= 18`
- 推荐使用 `pnpm`

### 安装依赖

```bash
pnpm install
```

如果使用 npm：

```bash
npm install
```

### 启动 H5 示例

```bash
pnpm dev:h5
```

启动后在浏览器中打开终端输出的本地地址，即可查看示例页面。

### 构建 H5

```bash
pnpm build:h5
```

## 示例路由

本项目在 `src/pages.json` 中配置了以下页面：

| 场景 | 真实路径 | 公开路径 / alias | 说明 |
| --- | --- | --- | --- |
| 首页 alias | `/pages/home/index` | `/home` | 首页显式配置 `routeAlias` |
| 真实路径 | `/pages/with-pages/index` | `/pages/with-pages/index` | 保留 uni-app 原始路径访问方式 |
| 默认 alias | `/pages/default-alias/index` | `/default-alias/index` | 未配置 `routeAlias` 时自动裁掉 `/pages` 前缀 |
| 自定义 alias | `/pages/custom/index` | `/custom-entry` | 通过 `routeAlias` 指定业务化公开路径 |
| 分包 alias | `/packages/demo/subpage/index` | `/subpackage-entry` | 分包页面显式配置公开路径 |

首页会展示四种入口按钮，可以依次点击验证：

- 带 `/pages` 的真实路径
- 不带 `/pages` 的默认 alias
- 自定义 `routeAlias`
- 分包页面 `routeAlias`

## 插件接入方式

示例项目通过本地依赖引用插件源码：

```json
{
  "dependencies": {
    "uni-routealias": "file:./plugin/uni-routealias"
  }
}
```

### 1. 注册 Vite 插件

在 `vite.config.ts` 中读取 `src/pages.json`，生成路由映射配置：

```ts
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { createRouteAliasVitePlugin } from "uni-routealias/vite";

export default defineConfig({
  plugins: [createRouteAliasVitePlugin("./src/pages.json"), uni()],
});
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

在 `src/pages.json` 的页面项根级添加 `routeAlias`：

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
  url: resolvePlatformRouteUrl("/custom-entry"),
});
```

它会根据平台返回合适的路径：

- H5：优先使用公开路径 / alias，地址栏更简洁
- App / 小程序：返回 uni-app 可识别的真实页面路径
- 外链：原样返回

## 常用 API

`uni-routealias` 暴露的常用方法包括：

| API | 作用 |
| --- | --- |
| `installRouteAliasPlugin()` | 安装运行时插件，通常在 `main.ts` 调用一次 |
| `resolvePlatformRouteUrl(url)` | 将公开 URL 转为当前平台适合跳转的 URL |
| `resolvePublicRouteUrl(url)` | 将真实页面 URL 转为对外展示用的公开 URL |
| `resolveActualRoutePath(path)` | 将公开路径转为真实页面路径 |
| `tryResolveActualRoutePath(path)` | 严格解析公开路径，失败返回 `null` |
| `hasKnownRoutePath(path)` | 判断路径是否属于已知页面 |
| `getRoutePublicPaths(path)` | 获取某个页面全部可用公开路径 |

更多插件规则、冲突处理与完整 API 请查看 [`plugin/uni-routealias/README.md`](./plugin/uni-routealias/README.md)。

## 可用脚本

```bash
pnpm dev:h5          # 启动 H5 开发服务
pnpm build:h5        # 构建 H5
pnpm type-check      # TypeScript 类型检查
pnpm dev:mp-weixin   # 启动微信小程序开发构建
pnpm build:mp-weixin # 构建微信小程序
```

更多平台脚本可查看 [`package.json`](./package.json)。

## 插件源码说明

插件源码位于 [`plugin/uni-routealias`](./plugin/uni-routealias)：

- `vite.ts`：Vite 插件入口，读取 `pages.json` 并注入虚拟模块
- `route-alias-state.ts`：生成真实路径、默认 alias、自定义 alias 映射，并输出冲突 warning
- `core/runtime.ts`：运行时路径解析、公开路径转换、H5 alias 注入逻辑
- `core/install.ts`：运行时安装入口
- `README.md`：插件 npm 包使用文档

## 适用场景

- 希望 H5 地址栏展示业务化路径，而不是 `/pages/**/index`
- 希望分享链接、活动链接、落地页链接保持稳定
- 希望同一套路由写法兼容 H5、App、小程序
- 希望给分包页面配置更短的公开访问路径
- 希望在插件发布前，用真实 uni-app 项目完成集成验证

## 注意事项

- `routeAlias` 只能是纯路径，不能携带 `?` 或 `#`
- `/` 是首页快捷入口，不建议配置成任何页面的 `routeAlias`
- 默认 alias 只会自动裁掉 `/pages` 前缀，分包页面建议显式配置 `routeAlias`
- 自定义 alias 与真实路径或其他 alias 冲突时，构建阶段会输出 warning
- 如果 H5 地址栏没有展示 alias，请先确认 `vite.config.ts` 和 `main.ts` 是否都已完成接入

## License

MIT
