# Contributing

感谢你愿意为 `uni-routealias` 做贡献。

## 参与方式

- 提交 issue：报告 bug、提出使用问题或功能建议
- 提交 pull request：修复问题、补充测试、改进文档或实现新能力
- 分享使用反馈：真实项目里的边界场景会帮助这个包变得更稳定

## 本地开发

克隆仓库后，在根目录安装示例项目依赖：

```bash
pnpm install
```

启动 H5 示例项目：

```bash
pnpm dev:h5
```

构建插件包：

```bash
cd plugin/uni-routealias
pnpm install
pnpm build
```

## 提交 PR 前

请尽量完成以下检查：

```bash
pnpm type-check
pnpm build:h5
```

如果改动了插件包源码，请同时运行：

```bash
cd plugin/uni-routealias
pnpm build
```

## PR 建议

- 保持改动聚焦，一次 PR 解决一个问题
- 在 PR 描述中说明问题背景、实现方式和验证结果
- 如果涉及行为变化，请同步更新 `README.md` 或 `plugin/uni-routealias/README.md`
- 如果引入破坏性变化，请在描述中明确标注

## 代码风格

- TypeScript 代码保持现有风格
- 文档使用中文为主，必要时保留英文技术名词
- 新增 API 应提供清晰命名、类型声明和使用示例

## 发布说明

当前 npm 发布目录为 `plugin/uni-routealias`。版本号、`CHANGELOG.md` 和 npm 包 README 也维护在该目录下。
