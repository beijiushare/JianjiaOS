# JianjiaOS

个人自用的 Android 应用外壳：Capacitor + React + TypeScript。

---

## 开源致谢

本项目大量依赖他人成果。按「用到的方式」分三类列出。

### 一、角色引擎（上游源码原样引入）

**[Grok Bot 角色引擎](https://github.com/blessonism/grok-icon-study)**

- **用途**：主页搜索框上方的机器人。引擎按上游拆分出的模块原样放在
  `src/components/grok-bot/vendor/`，**本项目未改动其中任何一行**
- **上游做了什么**：把 Grok Bot.app v0.18.0 的 `app.asar` 抽出并整理成可读的
  模块拆分（pose / tricks / eyes / fx / math / tables），用于研究其状态机、
  弹簧动画与多边形眼睛的实现
- ⚠️ **授权状态：该项目不是开源许可。** 其 README 明确声明 —— 角色造型、
  商标、图标、几何数据及从应用包中提取的内容均归 **xAI / 相应权利人**所有，
  「**仅供学习参考，请勿商用或再分发**」。本项目同样只作个人学习用途

### 二、图标与设计素材

| 来源 | 用途 | 许可 |
|---|---|---|
| [Remix Icon](https://github.com/Remix-Design/RemixIcon) | `src/assets/icons/` 下的全部界面图标 | Apache-2.0 |
| [telegram-tt](https://github.com/Ajaxy/telegram-tt) | `src/styles/tokens.css` 的颜色与尺寸数值、聊天背景的四色渐变、`src/assets/backgrounds/tt-*.svg` 图案 | 见上游仓库 |

telegram-tt 的取值位置在源码注释里均有标注（`tokens.css` 顶部、`index.css`
中「取自 telegram-tt …」处），未凭印象改动过数值。

### 三、第三方依赖

**运行时**

| 包 | 用途 | 许可 |
|---|---|---|
| [react](https://github.com/facebook/react) / [react-dom](https://github.com/facebook/react) | UI 框架 | MIT |
| [zustand](https://github.com/pmndrs/zustand) | 状态管理 | MIT |
| [@capacitor/core](https://github.com/ionic-team/capacitor) | Web ↔ 原生桥 | MIT |
| [@capacitor/android](https://github.com/ionic-team/capacitor) | Android 平台支持 | MIT |
| [@capacitor/app](https://github.com/ionic-team/capacitor) | 应用生命周期与返回键 | MIT |
| [@capacitor/browser](https://github.com/ionic-team/capacitor) | 打开外部链接 | MIT |
| [@capacitor/preferences](https://github.com/ionic-team/capacitor) | 键值持久化 | MIT |

**开发时**

| 包 | 用途 | 许可 |
|---|---|---|
| [vite](https://github.com/vitejs/vite) | 构建与开发服务器 | MIT |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | React 支持 | MIT |
| [vite-plugin-svgr](https://github.com/pd4d10/vite-plugin-svgr) | 将 SVG 导入为 React 组件 | MIT |
| [typescript](https://github.com/microsoft/TypeScript) | 类型检查 | Apache-2.0 |
| [oxlint](https://github.com/oxc-project/oxc) | Lint | MIT |
| [@capacitor/cli](https://github.com/ionic-team/capacitor) | Capacitor 命令行 | MIT |
| [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped) · [@types/react](https://github.com/DefinitelyTyped/DefinitelyTyped) · [@types/react-dom](https://github.com/DefinitelyTyped/DefinitelyTyped) | 类型声明 | MIT |

> 上表中依赖的许可证直接读自各自 `node_modules/*/package.json` 的 `license` 字段。
> 素材类来源的许可证以对应仓库为准。
