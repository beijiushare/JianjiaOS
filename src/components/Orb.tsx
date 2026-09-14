/**
 * Orb —— 由 React Bits 引入的 WebGL 着色器背景组件。
 *
 * 来源：https://reactbits.dev （Orb 组件，JavaScript + CSS 变体）
 * 依赖：ogl
 *
 * ⚠️ 性能：内部是一个常驻的 requestAnimationFrame 渲染循环，只要组件挂载就会
 *    每帧执行片元着色器。在移动端是持续的 GPU 与电量开销，低端设备上可能掉帧。
 *    若只在主屏使用，建议在进入子页面时卸载（当前实现随 HomePage 常驻）。
 *
 * ⚠️ 主题：backgroundColor 由 matchMedia 跟随系统深浅色切换。
 *    该值会传入着色器参与取色计算，不能传 CSS 变量 —— 组件内部按 hex/rgb/hsl
 *    字符串解析，收到 var(...) 会解析成黑色。
 */

import { Mesh, Program, Renderer, Triangle, Vec3 } from 'ogl'
import { useEffect, useRef } from 'react'

import './Orb.css'

declare global {
  interface Window {
    /** 【本地修改 · 临时调试】真机排查入口，与 uDebugV0 一同删除。 */
    __orb?: {
      gl: unknown
      program: Program
      canvas: HTMLCanvasElement
    }
  }
}

interface OrbProps {
  /** 基础色相（度） */
  hue?: number
  /** 悬停扭曲强度 */
  hoverIntensity?: number
  /** 悬停时是否持续旋转 */
  rotateOnHover?: boolean
  /** 强制处于悬停状态 */
  forceHoverState?: boolean
  /** 容器背景色，参与着色器取色计算 */
  backgroundColor?: string
}

export default function Orb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
  backgroundColor = '#000000',
}: OrbProps) {
  const ctnDom = useRef<HTMLDivElement>(null)

  /**
   * 【本地修改】forceHoverState 经 ref 读取，**不放入下方的依赖数组**。
   *
   * 上游版本把它放在依赖里，任何变化都会重建 WebGL 上下文（含着色器编译，
   * 移动端数十毫秒）。而本项目中它跟随搜索框聚焦状态切换，属于高频变动，
   * 放进依赖会导致每次聚焦/失焦都卡顿一下。
   *
   * 用 ref 后仍能实时生效：渲染循环每帧读取 ref.current。
   * 若将来更新 Orb 上游版本，需重新套用此改动。
   */
  const forceHoverRef = useRef(forceHoverState)
  forceHoverRef.current = forceHoverState

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `

  const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    uniform vec3 backgroundColor;
    varying vec2 vUv;

    // 【本地修改 · 临时调试】真机排查 v0 归零用。
    // uDebugV0 > 0.5 时输出三个中间量：R = v0，G = n0（噪声，应满屏花纹），B = v2（球体遮罩）。
    // 排查完应连同 Program 里的 uDebugV0 与 window.__orb 一起删除。
    uniform float uDebugV0;
    float dbgV0;
    float dbgN0;
    float dbgV2;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }

    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }

    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    vec3 hash33(vec3 p3) {
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }

    float snoise3(vec3 p) {
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0, d0),
        dot(d1, d1),
        dot(d2, d2),
        dot(d3, d3)
      ), 0.0);
      vec4 n = h * h * h * h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    vec4 extractAlpha(vec3 colorIn) {
      float a = max(max(colorIn.r, colorIn.g), colorIn.b);
      return vec4(colorIn.rgb / (a + 1e-5), a);
    }

    const vec3 baseColor1 = vec3(0.611765, 0.262745, 0.996078);
    const vec3 baseColor2 = vec3(0.298039, 0.760784, 0.913725);
    const vec3 baseColor3 = vec3(0.062745, 0.078431, 0.600000);
    const float innerRadius = 0.6;
    const float noiseScale = 0.65;

    float light1(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * attenuation);
    }
    float light2(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * dist * attenuation);
    }

    vec4 draw(vec2 uv) {
      vec3 color1 = adjustHue(baseColor1, hue);
      vec3 color2 = adjustHue(baseColor2, hue);
      vec3 color3 = adjustHue(baseColor3, hue);

      float ang = atan(uv.y, uv.x);
      float len = length(uv);
      float invLen = len > 0.0 ? 1.0 / len : 0.0;

      float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));

      float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
      float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
      float d0 = distance(uv, (r0 * invLen) * uv);
      float v0 = light1(1.0, 10.0, d0);

      // 【本地修改】原写法 smoothstep(r0 * 1.05, r0, len) 的 edge0 > edge1，
      // 属 GLSL 规范中的未定义行为。桌面驱动按 (x-e0)/(e1-e0) 的负分母算出下降沿，
      // 但真机疑似整段返回 0 —— 那样 v0 恒为 0，浅色路径退化成纯背景色
      // （深色路径有 color3 兜底，所以看不出症状）。改成等价的有定义写法，桌面渲染不变。
      v0 *= 1.0 - smoothstep(r0, r0 * 1.05, len);
      float innerFade = smoothstep(r0 * 0.8, r0 * 0.95, len);
      v0 *= mix(innerFade, 1.0, bgLuminance * 0.7);
      // 【本地修改 · 临时调试】v0 此后不再变化，即浅色路径实际取用的值
      dbgV0 = v0;
      dbgN0 = n0;
      float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;

      float a = iTime * -1.0;
      vec2 pos = vec2(cos(a), sin(a)) * r0;
      float d = distance(uv, pos);
      float v1 = light2(1.5, 5.0, d);
      v1 *= light1(1.0, 50.0, d0);

      // 【本地修改】同上，原写法 edge0 = 1.0 > edge1 亦属未定义行为，改为等价写法。
      float v2 = 1.0 - smoothstep(mix(innerRadius, 1.0, n0 * 0.5), 1.0, len);
      dbgV2 = v2;
      float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

      vec3 colBase = mix(color1, color2, cl);
      float fadeAmount = mix(1.0, 0.1, bgLuminance);

      vec3 darkCol = mix(color3, colBase, v0);
      darkCol = (darkCol + v1) * v2 * v3;
      darkCol = clamp(darkCol, 0.0, 1.0);

      vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);

      // 【本地修改】给 v0 加下限。
      // 浅色路径的颜色完全由 v0 决定（深色路径有 color3 兜底，v0 归零仍有形状），
      // v0→0 时这里等于 backgroundColor，在纯白主页上就是整屏空白 —— 真机实测正是如此。
      // 加下限后浅色不再依赖 v0 的绝对值，任何把 v0 压低的原因都兜得住。
      // 0.25 对桌面现状的平均色差约 2.6/255，肉眼不可见；若真机上球体偏平可上调
      // （0.35 ~ 0.45），代价是浅色球心更实。
      float v0Light = max(v0, 0.25);
      lightCol = mix(backgroundColor, lightCol, v0Light);

      // 【本地修改】乘上球体遮罩 v2，让球体外部的颜色归零。
      // 上游漏了这一步：球外 v0≈0，lightCol 因此等于 backgroundColor，
      // extractAlpha 会给出一个非零 alpha（= 背景色最大通道，约 0.28），
      // 于是整个 canvas 变成一块不透明的实心矩形。
      // 上游假设「传进来的 backgroundColor 就是真实背景，填满也看不出来」——
      // 这在纯色背景上成立，但本项目主页用的是渐变，矩形边界会露出来。
      // darkCol 已乘过 v2，此处补齐。
      lightCol *= v2;
      lightCol = clamp(lightCol, 0.0, 1.0);

      vec3 finalCol = mix(darkCol, lightCol, bgLuminance);

      return extractAlpha(finalCol);
    }

    vec4 mainImage(vec2 fragCoord) {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;

      float angle = rot;
      float s = sin(angle);
      float c = cos(angle);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

      uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);

      return draw(uv);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);

      // 【本地修改 · 临时调试】控制台里 __orb.program.uniforms.uDebugV0.value = 1
      // 即把中间量画成 RGB：R = v0，G = n0，B = v2。排查完删除。
      if (uDebugV0 > 0.5) {
        gl_FragColor = vec4(dbgV0, dbgN0, dbgV2, 1.0);
        return;
      }

      gl_FragColor = vec4(col.rgb * col.a, col.a);
    }
  `

  useEffect(() => {
    const container = ctnDom.current
    if (!container) return

    /**
     * 【本地修改】premultipliedAlpha 由 false 改为 true。
     *
     * 上游写的是 false，但它的 shader 输出的是**预乘**颜色：
     *     gl_FragColor = vec4(col.rgb * col.a, col.a);
     * 两者不匹配时浏览器会按非预乘公式再合成一次，等于 alpha 被乘了两遍，
     * 半透明区域的颜色被双重削弱。
     *
     * 症状：浅色主题下整个球看不见（浅色路径本身就把颜色往背景白里混过一遍，
     * 再削弱一次就彻底融进白底）；深色主题对比余量大，扛得住，所以看不出问题。
     *
     * 若将来更新 Orb 上游版本，需重新套用此改动。
     *
     * 【本地修改 · 临时调试】preserveDrawingBuffer 由 false 改为 true。
     *
     * 它是判断「球体到底画出了什么」的唯一手段：默认情况下帧缓冲在合成后即被丢弃，
     * toDataURL() / readPixels() 拿到的都是空的，只能靠猜。
     * 打开后可在 chrome://inspect 控制台直接读画布内容。
     *
     * 代价：驱动需要保留一份帧缓冲拷贝，移动端有实际开销。排查完应改回 false。
     */
    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
    })
    const gl = renderer.gl
    const canvas = gl.canvas as HTMLCanvasElement

    gl.clearColor(0, 0, 0, 0)
    container.appendChild(canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(
            canvas.width,
            canvas.height,
            canvas.width / canvas.height,
          ),
        },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: hoverIntensity },
        backgroundColor: { value: hexToVec3(backgroundColor) },
        // 【本地修改 · 临时调试】默认 0，控制台置 1 输出中间量灰度图，排查完删除
        uDebugV0: { value: 0 },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    /**
     * 【本地修改 · 临时调试】把 WebGL 上下文与 program 暴露到全局，供真机排查。
     *
     * chrome://inspect 控制台里可用：
     *   __orb.program.uniforms.uDebugV0.value = 1   // 切到中间量可视化
     *   __orb.canvas.toDataURL()                    // 需 preserveDrawingBuffer 为 true
     *
     * 排查完应连同 uDebugV0、preserveDrawingBuffer 一起删除。
     */
    window.__orb = { gl, program, canvas }

    function resize(): void {
      if (!container) return
      const dpr = window.devicePixelRatio || 1
      const width = container.clientWidth
      const height = container.clientHeight
      // 【本地修改】尺寸为 0 时直接返回。
      // setSize(0, 0) 会让 iResolution 变成 (0, 0, NaN)，随之 uv 全为 NaN，
      // 整个着色器静默无输出 —— 表面上就是「什么都没画」，且控制台没有任何报错。
      if (width === 0 || height === 0) return
      renderer.setSize(width * dpr, height * dpr)
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      program.uniforms.iResolution.value.set(
        canvas.width,
        canvas.height,
        canvas.width / canvas.height,
      )
    }
    window.addEventListener('resize', resize)
    resize()

    let targetHover = 0
    let lastTime = 0
    let currentRot = 0
    const rotationSpeed = 0.3

    const handleMouseMove = (e: MouseEvent): void => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const width = rect.width
      const height = rect.height
      const size = Math.min(width, height)
      const centerX = width / 2
      const centerY = height / 2
      const uvX = ((x - centerX) / size) * 2.0
      const uvY = ((y - centerY) / size) * 2.0

      targetHover = Math.sqrt(uvX * uvX + uvY * uvY) < 0.8 ? 1 : 0
    }

    const handleMouseLeave = (): void => {
      targetHover = 0
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    let rafId = 0
    const update = (t: number): void => {
      rafId = requestAnimationFrame(update)
      const dt = (t - lastTime) * 0.001
      lastTime = t
      program.uniforms.iTime.value = t * 0.001
      program.uniforms.hue.value = hue
      program.uniforms.hoverIntensity.value = hoverIntensity
      program.uniforms.backgroundColor.value = hexToVec3(backgroundColor)

      const effectiveHover = forceHoverRef.current ? 1 : targetHover
      program.uniforms.hover.value +=
        (effectiveHover - program.uniforms.hover.value) * 0.1

      if (rotateOnHover && effectiveHover > 0.5) {
        currentRot += dt * rotationSpeed
      }
      program.uniforms.rot.value = currentRot

      renderer.render({ scene: mesh })
    }
    rafId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      delete window.__orb
      if (canvas.parentNode === container) container.removeChild(canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    // ⚠️ 不含 forceHoverState —— 见组件顶部说明
  }, [hue, hoverIntensity, rotateOnHover, backgroundColor])

  return <div ref={ctnDom} className="orb-container" />
}

function hslToRgb(h: number, s: number, l: number): Vec3 {
  let r: number
  let g: number
  let b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return new Vec3(r, g, b)
}

function hexToVec3(color: string): Vec3 {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16) / 255
    const g = parseInt(color.slice(3, 5), 16) / 255
    const b = parseInt(color.slice(5, 7), 16) / 255
    return new Vec3(r, g, b)
  }

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) {
    return new Vec3(
      parseInt(rgbMatch[1], 10) / 255,
      parseInt(rgbMatch[2], 10) / 255,
      parseInt(rgbMatch[3], 10) / 255,
    )
  }

  const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/)
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360
    const s = parseInt(hslMatch[2], 10) / 100
    const l = parseInt(hslMatch[3], 10) / 100
    return hslToRgb(h, s, l)
  }

  return new Vec3(0, 0, 0)
}
