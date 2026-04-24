# uni-app 路由别名插件实践：用 uni-routealias 优化 pages.json 路径

> 一个轻量的小工具，帮你在 uni-app Vue3 + Vite 项目里给页面路径起别名，顺便解决 H5 和移动端跳转路径不一致的头疼事。

---

## 先说说为啥要写这玩意

做 uni-app 项目的时候，路径里那个 `/pages/` 前缀看久了是真的烦。

用户分享出去的 H5 链接长成 `https://example.com/#/pages/article/detail?id=123`，又长又丑，还暴露项目结构。想改成 `/post?id=123` 这种清爽的样子，得自己折腾路由映射，麻烦得很。

更烦人的是多端兼容。H5 那边地址栏可以玩花样，但 App 和小程序跳转必须用真实路径 `/pages/xxx/xxx`，同一段跳转逻辑在不同平台得写两套，心里特别不舒坦。

所以就搓了 `uni-routealias` 这个包，两件事：一是给页面起别名，让对外链接体面一点；二是提供一套统一的方法，自动根据当前平台返回该用哪种路径去跳转。

- npm 包：[uni-routealias](https://www.npmjs.com/package/uni-routealias)
- GitHub：[https://github.com/quiethui/uni-routealias](https://github.com/quiethui/uni-routealias)

---

## 它能干嘛

### 1. 给 pages.json 配别名，H5 地址栏自动生效

直接在 `pages.json` 的页面配置里加个 `routeAlias` 字段就行：

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
  ]
}
```

构建的时候插件会自动读取 `pages.json`，把这些别名注册到 H5 路由里。用户在地址栏看到的就是 `/mine` 和 `/post`，清爽多了。

### 2. 默认 alias，不用配也能缩短

如果不写 `routeAlias`，插件也会自动给主包页面生成一个默认别名，就是把 `/pages` 前缀去掉。比如 `/pages/profile/index` 默认也能通过 `/profile/index` 访问。想更短就手动配一个自定义的，不想动脑子就用默认的。

### 3. 分包页面也能用

subPackages 里的页面一样支持 `routeAlias`，不会因为放在分包里就被忽略。

### 4. 冲突检测和兜底

构建阶段会检查 alias 有没有撞车，比如两个页面都配了 `/detail`，或者 alias 和真实路径重了，都会在控制台打 warning，告诉你哪个生效、哪个被忽略了，不会偷偷摸摸搞崩路由。

---

## 重点：平台链接兼容，H5 和移动端走一套逻辑

这是我最想聊的部分，也是做这个包的初衷之一。

PC 端（H5）的链接通常是没有 `pages` 这种技术目录前缀的，业务路径就是 `/mine`、`/post`。但 uni-app 的 App 和小程序端，页面跳转必须用真实文件路径，也就是 `/pages/profile/index` 这种格式。

问题来了：同一份分享链接，H5 打开要用别名路径，App 里 `uni.navigateTo` 又得换成真实路径。代码里到处是平台判断，写起来啰嗦，维护起来更啰嗦。

`uni-routealias` 里有个 `resolvePlatformRouteUrl` 方法，专门治这个：

```ts
import { resolvePlatformRouteUrl } from "uni-routealias";

uni.navigateTo({
  url: resolvePlatformRouteUrl("/post?id=9527"),
});
```

它的行为很简单，但省大事：

- **H5**：返回别名路径 `/post?id=9527`，地址栏好看，分享出去也体面。
- **App / 小程序**：返回真实路径 `/pages/article/detail?id=9527`，保证 `navigateTo`、`switchTab` 这些原生跳转不会报错。
- **外链**：原样返回，不做任何改动。

也就是说，你可以在全项目统一用别名路径来写跳转逻辑，不用关心底下跑的是哪个平台，插件在运行时会自动帮你转成当前平台认得的格式。

反过来，如果你手里拿到的是真实路径，想转成对外展示用的公开路径，也有现成方法：

```ts
import { resolvePublicRouteUrl } from "uni-routealias";

const shareUrl = resolvePublicRouteUrl("/pages/article/detail?id=9527");
// => /post?id=9527
```

这一套下来，H5 和移动端在路径这块终于能对上口了。分享链接可以统一用公开路径生成，落地页可以根据平台自动解析到正确页面，不用再自己手写一堆 `ifdef`。

---

## 怎么接入

两步搞定。

### 第一步：vite.config.ts 里注册构建插件

```ts
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { createRouteAliasVitePlugin } from "uni-routealias/vite";

export default defineConfig({
  plugins: [createRouteAliasVitePlugin(), uni()],
});
```

默认会找项目根目录下的 `src/pages.json`，如果没有就回退到 `pages.json`。路径不一样的话，可以手动传：

```ts
createRouteAliasVitePlugin("./src/pages.json")
```

### 第二步：main.ts 里安装运行时插件

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

然后就完事了，该配的配好，该用的方法直接 import 来用。

---

## 几个实用的小方法

除了前面说的平台兼容方法，包里还塞了一些平时用得上的工具函数：

- `resolveActualRoutePath("/mine")`：把别名转回真实路径，比如返回 `/pages/profile/index`。
- `tryResolveActualRoutePath("/mine")`：严格版，解析失败返回 `null`，不会硬塞一个默认结果给你。
- `hasKnownRoutePath("/mine")`：判断这个路径当前是不是已知的页面，做权限拦截或者 404 判断时挺方便。
- `getRoutePublicPaths("/pages/profile/index")`：返回某个页面当前可用的所有路径集合，比如 `[/pages/profile/index, /profile/index, /mine]`，一目了然。

---

## 写在最后

这个包不大，做的事情也挺聚焦，就是把 uni-app 的路由别名和平台兼容这两个小痛点包起来，让代码干净一点，链接好看一点，少写几个平台判断。

如果你也在 uni-app Vue3 + Vite 的项目里被路径问题折磨过，可以装来试试：

```bash
pnpm add uni-routealias
```

另外，这个插件也发布到了 DCloud 插件市场，如果你习惯从插件市场安装，也可以直接去那边搜 `路由别名`。

有问题或者建议，直接去 GitHub 提 issue，或者翻源码看看，代码量不多，很容易看懂。

---

**相关链接**

- npm 包：[uni-routealias](https://www.npmjs.com/package/uni-routealias)
- DCloud 插件市场：[quiethui-routealias](https://ext.dcloud.net.cn/plugin?id=27693)
- GitHub 仓库：[https://github.com/quiethui/uni-routealias](https://github.com/quiethui/uni-routealias)
