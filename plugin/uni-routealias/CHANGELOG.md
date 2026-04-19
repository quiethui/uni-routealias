# Changelog

## 1.0.1

- 初始化 `uni-routealias` 的 npm 发布结构。
- 支持构建期读取 `pages.json`，生成真实路径、默认 alias、自定义 alias 映射。
- 支持 H5 路由 alias 注入，并同步 `meta.route` 与 `tabBar.pagePath`。
- 支持主包页面、分包页面、公开路径、真实路径、平台跳转路径之间的互转。
- 提供更严格的路径解析能力，避免把未知路径静默伪装成错误的 `/pages/...` 页面。
- README 调整为 npm 安装与包名导入方式。
