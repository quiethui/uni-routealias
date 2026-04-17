# uni-routealias Demo App

这是一个可直接运行的 `uni-app Vue3 + Vite` 示例工程，用来演示 `uni-routealias` 插件在真实项目里的使用方式。

根目录的 `plugin/uni-routealias` 是待发布的 npm 包，示例工程通过本地 `file:` 依赖以 npm 方式消费它。

## 这个示例包含什么

- 带 `/pages/...` 的原始路由示例
- 去掉 `/pages` 前缀后的默认 alias 示例
- `pages.json` 里手工声明的自定义 alias 示例
- 带 query 的自定义 alias 示例
- 分包页面 alias 示例
- 一个可运行的路由观测台页面，用来查看实际路径、公开路径和平台跳转路径

## 项目结构

```text
src/
  pages/
    home/
    observatory/
    routes/playground/
    signal/
    article/
  packages/
    showcase/campaign/
  components/
  composables/
  utils/
plugin/
  uni-routealias/
```

## 运行方式

```bash
pnpm install
pnpm dev:h5
```

## 推荐浏览顺序

1. 首页：查看三种核心路由入口和完整示例矩阵
2. Playground：对比原始 `/pages/...` 路径和默认 alias
3. Signal：查看自定义 alias `/signal`
4. Pulse Detail：查看带 query 的 alias
5. Campaign：查看分包 alias
6. Observatory：查看整套路由注册表和项目结构
