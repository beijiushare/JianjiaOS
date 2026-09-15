/**
 * 集锦数据。
 *
 * 添加新条目：在数组末尾加一项即可，搜索自动生效。
 * 格式：{ name: '名称', url: '链接', description: '描述' }
 */
export interface Entry {
  name: string
  url: string
  description: string
}

export interface CreditLink {
  name: string
  url: string
}

export interface CreditGroup {
  title: string
  items: CreditLink[]
}

export const entries: Entry[] = [
  {
    name: 'JianjiaOS',
    url: 'https://github.com/beijiushare/JianjiaOS',
    description: '本项目 —— 基于 Capacitor + React + TypeScript 的 Android 应用壳，包含多个注册式子应用',
  },
  {
    name: 'ABot-Recon',
    url: 'https://github.com/amap-cvlab/ABot-Recon',
    description: '仅从视频输入进行流式3D重建，行车记录仪生成3D建模',
  },
  {
    name: 'hucre',
    url: 'https://github.com/productdevbook/hucre',
    description: '零依赖的 TypeScript 电子表格引擎',
  },
  {
    name: 'dompdf.js',
    url: 'https://github.com/lmn1919/dompdf.js',
    description: '网页转pdf,不再把网页变成图片，而是直接解析 DOM 结构与页面样式，原生生成 PDF 文档',
  },
  {
    name: 'three-editor',
    url: 'https://github.com/z2586300277/threejs-editor',
    description: '一个在线低代码3D编辑器，基于threejs，包括科技风地图案例',
  },
  {
    name: 'arnis',
    url: 'https://github.com/louis-e/arnis',
    description: '在《我的世界》中以极高的细节度生成现实世界中的任意地点',
  },
  {
    name: 'AnythingZoomer',
    url: 'https://github.com/CSS-Tricks/AnythingZoomer',
    description: '一个轻量的，能让任何东西都能“放大”看的JavaScript库',
  },
  {
    name: '如何使用 Echarts 地图点击定位到用户的家乡城市区县',
    url: 'https://mp.weixin.qq.com/s/4RItsaQjngLbaadB5TTgSA',
    description: '基于echarts，地图跳转效果',
  },
  {
    name: 'FossFLOW',
    url: 'https://github.com/stan-smith/FossFLOW',
    description: '类似于drawio的3D流程图编辑器',
  },
  {
    name: 'MediaCrawler - 自媒体平台爬虫',
    url: 'https://github.com/NanmiCoder/MediaCrawler',
    description: '小红书笔记 | 评论爬虫、抖音视频 | 评论爬虫、快手视频 | 评论爬虫、B 站视频 ｜ 评论爬虫、微博帖子 ｜ 评论爬虫、百度贴吧帖子 ｜ 百度贴吧评论回复爬虫 | 知乎问答文章｜评论爬虫',
  },
  {
    name: 'public-apis',
    url: 'https://github.com/public-apis/public-apis',
    description: '为开发者提供一个集中、分类、易于搜索的API资源库',
  },
  {
    name: 'GPUI',
    url: 'https://www.gpui.rs/',
    description: 'Zed团队推出的原生UI框架，完全用 Rust + GPU 渲染，直接调用GPU来渲染界面。小体积，高性能',
  },
  {
    name: 'neutts',
    url: 'https://github.com/neuphonic/neutts',
    description: '在本地设备上运行、实时合成、即时克隆声音。基于轻量级 LLM 骨干网络构建，可以在android手机上跑起来。且可以内置水印',
  },
  {
    name: 'PP-OCRv6',
    url: 'https://github.com/PaddlePaddle/PaddleOCR',
    description: '百度飞桨开源，小体积、高性能OCR',
  },
  {
    name: 'three-scope-map-skill',
    url: 'https://github.com/songsummer920-dazzle/three-scope-map-skill',
    description: 'vue,可复用的 3D 地图skill',
  },
  {
    name: 'Piper',
    url: 'https://github.com/OHF-Voice/piper1-gpl',
    description: '快速、本地化的神经网络文本转语音引擎，语音非常自然、流畅，接近真人发音，支持多语言。一行命令，装完就能说话，专为低算力设备优化',
  },
  {
    name: 'grok-icon-study',
    url: 'https://github.com/blessonism/grok-icon-study',
    description: 'grok bot动画复刻',
  },
  {
    name: 'animal-island-ui',
    url: 'https://github.com/guokaigdg/animal-island-ui',
    description: '动森风格的React组件库，奶油、可爱风、动物、森林',
  },
  {
    name: 'workout-guide',
    url: 'https://github.com/bryllim/workout-guide',
    description: '把健身动作全部做成插画的开源素材库',
  },
  {
    name: 'Game-Icon-Pack',
    url: 'https://github.com/Nieobie/Game-Icon-Pack',
    description: '一套特征鲜明的图标库：800+ 图标全部圆角处理，没有尖角',
  },
  {
    name: 'free-for.dev',
    url: 'https://github.com/ripienaar/free-for-dev',
    description: '专门给开发者准备的免费服务清单，共 57 个大类，1200 多条服务。云服务器、数据库、对象存储、CDN、域名、邮件、监控、日志、CI/CD、身份认证、支付、截图 API、地图、搜索。。。。。。',
  },
  {
    name: 'mapcn',
    url: 'https://github.com/AnmolSaini16/mapcn',
    description: 'React地图套件',
  },
  {
    name: 'OpenFileViewer',
    url: 'https://github.com/xushanpei/open-file-viewer',
    description: '面向现代 Web 产品的文件预览 SDK。它把 PDF、Office、图片、音视频、压缩包、邮件、图纸、3D、GIS 和代码文件放进同一个可控容器里，并同时支持原生 JavaScript、React、Vue 和 Svelte。',
  },
  {
    name: 'animejs.com/',
    url: 'https://animejs.com/',
    description: '炫酷的web动效，动画,ui，可编辑下载',
  },
  {
    name: 'timesfm',
    url: 'https://github.com/google-research/timesfm/',
    description: '谷歌开发的一款用于时间序列预测的预训练时间序列基础模型，喂数据，直接出预测，数据分析',
  },
  {
    name: 'vue-clamp',
    url: 'https://vue-clamp.void.app/',
    description: 'vue，文本截断包',
  },
  {
    name: 'Lingbot-map',
    url: 'https://github.com/robbyant/lingbot-map',
    description: '用于流式三维重建的前馈三维基础模型',
  },
]

export const creditGroups: CreditGroup[] = [
  {
    title: '移动端',
    items: [
      { name: 'React', url: 'https://github.com/facebook/react/blob/main/LICENSE' },
      { name: 'Capacitor', url: 'https://github.com/ionic-team/capacitor/blob/main/LICENSE' },
      { name: '@capacitor/app', url: 'https://github.com/ionic-team/capacitor-plugins/blob/main/app/LICENSE' },
      { name: '@capacitor/browser', url: 'https://github.com/ionic-team/capacitor-plugins/blob/main/browser/LICENSE' },
      { name: '@capacitor/preferences', url: 'https://github.com/ionic-team/capacitor-plugins/blob/main/preferences/LICENSE' },
      { name: 'Vite', url: 'https://github.com/vitejs/vite/blob/main/LICENSE' },
      { name: 'TypeScript', url: 'https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt' },
      { name: 'oxlint', url: 'https://github.com/oxc-project/oxc/blob/main/LICENSE' },
    ],
  },
  {
    title: '设计参考',
    items: [
      { name: 'telegram-tt', url: 'https://github.com/nicepkg/nicegram' },
      { name: 'RemixIcon', url: 'https://github.com/Remix-Design/RemixIcon/blob/master/License' },
    ],
  },
]
