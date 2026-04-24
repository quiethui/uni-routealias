# uni-app 的路由别再裸奔了：用 uni-routealias 把 /pages 藏起来

> 文章简介：`uni-routealias` 是我给 `uni-app Vue3 + Vite` 项目做的一个路由别名插件。它解决的不是“能不能跳转”的问题，而是 H5 地址栏、分享链接、PC 端兼容链接和 App / 小程序内部跳转之间，路径写法不一致的问题。插件已经发布到 npm，也上架了 DCloud 插件市场，源码放在 GitHub：<https://github.com/quiethui/uni-routealias>。

### 我为什么要写这个插件

做 uni-app 项目时，路由路径通常长这样：

```text
/pages/profile/index
/pages/article/detail
/packages/showcase/campaign/index
```

从框架内部看，这没什么问题。`pages.json` 就是这么组织页面的，`uni.navigateTo`、`uni.switchTab` 也都认这种真实路径。

但一旦这些路径要出现在用户面前，就有点别扭了。

比如一个个人中心页面，对外更像应该叫 `/mine`；一篇文章详情页，更适合叫 `/post?id=9527`；一个活动页，可能希望跟 PC 端保持同一个链接结构，比如 PC 是 `/campaign`，移动端也最好能打开 `/campaign`，而不是让用户看到 `/pages/campaign/index` 或 `/packages/demo/subpage/index`。

这就是 `uni-routealias` 想解决的问题：真实页面路径继续交给 uni-app，公开路径交给业务。

### `/pages` 最大的问题不是长，而是不稳定

很多时候我们会觉得 `/pages/xxx/index` 只是“不好看”。但真正麻烦的是，它把项目目录结构暴露给了外部链接。

目录一改，链接就跟着变。页面从主包挪到分包，链接也要重新处理。PC 端已经上线的链接是 `/article/123`，移动端却只能识别 `/pages/article/detail?id=123`，最后就会出现一堆临时判断和重定向。

这些判断短期看能跑，长期看会变成路由债务。

我的做法是把路径拆成两层：

- 真实路径：框架内部使用，比如 `/pages/article/detail`
- 公开路径：对外展示和传播，比如 `/post`

真实路径可以随着项目结构调整，公开路径尽量保持稳定。用户、运营、PC 端、外部投放链接都只关心公开路径。

### uni-routealias 做了什么

`uni-routealias` 的核心思路很简单：构建期读取 `pages.json`，生成一份路由映射；运行时再根据当前平台，把公开路径转换成真正可跳转的路径。

它主要做几件事：

- 自动读取 `pages.json` 里的页面和分包配置
- 支持在页面配置上写 `routeAlias`
- 给 `/pages/...` 页面生成默认 alias，比如 `/pages/profile/index` 可以对应 `/profile/index`
- H5 下把 alias 注入到路由表，让地址栏能显示更干净的路径
- App 和小程序下仍然返回 uni-app 能识别的真实页面路径
- 保留 query 和 hash，不会因为转换路径丢参数
- 对重复 alias、`/` 保留路径、和真实路径冲突的 alias 给出 warning

我不想让它变成一个大而全的路由系统。它只做一件事：把“公开路径”和“真实页面路径”之间的转换管好。

### 安装和接入

包已经发布到 npm：

```bash
npm install uni-routealias
```

也可以用 pnpm：

```bash
pnpm add uni-routealias
```

如果你习惯用 HBuilderX 或 `uni_modules` 的方式管理插件，也可以直接从 DCloud 插件市场安装：<https://ext.dcloud.net.cn/plugin?id=27693>。

这两个渠道没有本质区别。npm 更适合纯工程化项目，插件市场更适合已经围绕 HBuilderX 和 DCloud 生态开发的项目。选你项目里更顺手的那个就行。

然后在 `vite.config.ts` 里注册构建插件：

```ts
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { createRouteAliasVitePlugin } from "uni-routealias/vite";

export default defineConfig({
  plugins: [createRouteAliasVitePlugin("./src/pages.json"), uni()],
});
```

如果你的 `pages.json` 就在默认位置，通常也可以直接写：

```ts
createRouteAliasVitePlugin()
```

插件会优先找 `src/pages.json`，找不到再回退到项目根目录的 `pages.json`。

接着在 `main.ts` 安装运行时插件：

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

最后在 `pages.json` 里给页面写别名：

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

`routeAlias` 要写在页面项的根级，不要写进 `style`。另外，`/` 是首页快捷入口，别把某个页面的 alias 配成 `/`。

### 跳转时不要自己猜平台

这个插件里我最常用的是 `resolvePlatformRouteUrl`。

```ts
import { resolvePlatformRouteUrl } from "uni-routealias";

uni.navigateTo({
  url: resolvePlatformRouteUrl("/custom-entry?from=home"),
});
```

在 H5 里，它会尽量返回公开路径，让地址栏保持 `/custom-entry?from=home` 这种更适合传播的形式。

在 App 和小程序里，它会返回真实页面路径，例如 `/pages/custom/index?from=home`，因为这些平台的 `uni.navigateTo` 更关心 `pages.json` 里注册过的路径。

也就是说，业务代码可以一直写公开路径，把平台差异交给插件处理。

这点很重要。否则项目里很容易散落一堆这样的代码：

```ts
// 不推荐：平台判断散在业务里，后面很难维护
const url = isH5 ? "/custom-entry" : "/pages/custom/index";
```

我更希望它变成这样：

```ts
const url = resolvePlatformRouteUrl("/custom-entry");
```

路径规则集中之后，链接兼容问题就不会到处扩散。

### 和 PC 端链接保持一致

`uni-routealias` 还有一个我很在意的用途：让移动端兼容 PC 端已经存在的链接。

很多业务最早是 PC 页面先上线，链接可能已经被搜索、投放、短信、公众号或者客户系统引用了。PC 端链接通常不会带 `/pages`，比如：

```text
/product/detail?id=1001
/campaign
/article?id=9527
```

而移动端 uni-app 项目的真实路径可能是：

```text
/pages/product/detail
/packages/demo/campaign/index
/pages/article/detail
```

如果不做兼容，就会出现两个问题：

第一，PC 链接发到手机上打不开，或者要额外写一层中转页。

第二，移动端分享出去的链接和 PC 端不一致，后续做统计、投放归因、客服排查都会麻烦。

有了 `routeAlias` 之后，可以直接把移动端页面挂到和 PC 一样的公开路径上：

```json
{
  "path": "pages/article/detail",
  "routeAlias": "/article"
}
```

业务里继续用：

```ts
uni.navigateTo({
  url: resolvePlatformRouteUrl("/article?id=9527"),
});
```

这样 H5 地址栏、外部分享链接、PC 端已有链接都可以围绕 `/article?id=9527` 这套公开地址来设计。移动端内部需要的 `/pages/article/detail?id=9527`，插件会在合适的平台上自动转换。

这不是为了“好看”而做的优化，它解决的是平台链接兼容性。

### 分享链接也应该用公开路径

跳转是一个场景，生成分享链接是另一个场景。

如果你手里拿到的是真实路径，可以用 `resolvePublicRouteUrl` 转成对外展示的路径：

```ts
import { resolvePublicRouteUrl } from "uni-routealias";

const shareUrl = resolvePublicRouteUrl("/pages/article/detail?id=9527");
// /article?id=9527
```

这样分享出去的链接不会带着项目目录结构。对用户来说，它更短；对开发来说，它也更稳定。

还有一个辅助方法 `getRoutePublicPaths`，可以拿到某个页面对应的所有可识别路径。排查路由问题时挺有用，尤其是页面同时有真实路径、默认 alias、自定义 alias 的时候。

### 分包页面要显式写 routeAlias

默认 alias 只会自动裁掉 `/pages` 前缀。

比如：

```text
/pages/default-alias/index -> /default-alias/index
```

但分包路径一般不是 `/pages` 开头，像这样：

```text
/packages/demo/subpage/index
```

插件不会擅自把它猜成某个短路径。分包页面如果要有稳定的公开地址，我建议显式写 `routeAlias`：

```json
{
  "path": "subpage/index",
  "routeAlias": "/subpackage-entry"
}
```

这也是我刻意保守的地方。路由插件最怕“猜得很聪明”，结果线上跳到了错误页面。相比自动脑补，我更愿意让重要的对外路径被明确写出来。

### 有些限制是故意留下的

`routeAlias` 只能是纯路径，不能带 `?` 和 `#`。

也就是说，应该这样写：

```json
{
  "routeAlias": "/article"
}
```

然后在跳转时带参数：

```ts
resolvePlatformRouteUrl("/article?id=9527#comments")
```

不要这样写：

```json
{
  "routeAlias": "/article?id=9527"
}
```

这个限制看起来麻烦，但它能让路由表保持清晰：路径归路径，参数归参数。

另外，未知路径不会被强行推断成某个 `/pages/...` 页面。如果你想做严格判断，可以用 `tryResolveActualRoutePath` 或 `tryResolveActualRouteUrl`。解析失败时它们会返回 `null`，比静默兜底更适合做错误处理。

### 我推荐的使用方式

如果项目刚接入，我建议按这个顺序来：

1. 先给需要对外传播的页面配置 `routeAlias`
2. 业务跳转统一走 `resolvePlatformRouteUrl`
3. 分享、短信、投放链接统一用 `resolvePublicRouteUrl`
4. PC 和移动端共用的链接，优先以 PC 已有公开路径为准
5. 分包页面不要依赖默认 alias，直接显式配置

这样改动不会太大，也不会一次性把项目里的所有路由都翻出来重构。

### 最后

`uni-routealias` 不是一个复杂插件，它只是把 uni-app 项目里经常被忽略的路由细节收拢起来。

以前我们可能会在 H5、App、小程序、PC 兼容链接之间反复写判断。现在可以把规则写在 `pages.json`，把跳转入口收敛到几个 API 上。

对我来说，这类工具最好的状态就是：平时感觉不到它，链接发出去之后也不需要再解释“为什么这里有个 `/pages`”。

如果你也在维护 `uni-app Vue3 + Vite` 项目，并且已经被 H5 地址栏、分享链接、PC 和移动端链接兼容折腾过，可以试试这个包：

- npm 包：`uni-routealias`
- DCloud 插件市场：<https://ext.dcloud.net.cn/plugin?id=27693>
- GitHub：<https://github.com/quiethui/uni-routealias>

> 说明：本文部分内容由 AI 辅助生成，已结合插件实际实现、示例项目和作者表达意图进行整理、修改与校对。


