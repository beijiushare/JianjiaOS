/**
 * Grok Bot 角色引擎 —— 上游文件原样引入，未做任何修改。
 *
 * 来源：https://github.com/blessonism/grok-icon-study
 * 该项目把 Grok Bot.app v0.18.0 的 app.asar 抽成可读的模块拆分，
 * 用于研究其状态机、弹簧动画与多边形眼睛的实现。
 *
 * ⚠️ 授权：上游 README 声明这些素材归 xAI / 相应权利人所有，
 *    **仅供学习参考，请勿商用或再分发**。本目录同样仅作学习用途。
 *
 * ⚠️ 加载顺序：这些文件是 IIFE，求值时把引擎挂到 window 上
 *    （window.GROK_GEO / GROK_MATH / GROK_TABLES / GROK_POSE /
 *     GROK_TRICKS / GROK_FX / GROK_EYES / GrokCharacter）。
 *    后一个文件在**顶层**就读取前一个的全局（如 character.js 一进来就取
 *    `g.GROK_FX`），所以 import 顺序不能动，且只能作副作用引入。
 *    顺序与上游 replica/index.html 的 <script> 顺序一致。
 */
import './geometry-data.js'
import './src/math.js'
import './src/tables.js'
import './src/pose.js'
import './src/tricks.js'
import './src/fx.js'
import './src/eyes.js'
import './src/character.js'
