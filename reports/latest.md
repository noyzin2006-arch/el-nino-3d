# LOOP-001 执行报告：厄尔尼诺 3D 交互讲解网页

日期：2026-10-26。判定：**READY_FOR_DELIVERY**（性能 FPS 一项标 NOT_TESTED，见 §8）。

## 1. 任务与环境

- 任务：LOOP-001「做一个3D模型网页展示，讲解厄尔尼诺现象是怎么形成的，带来什么影响」。
- 规划案：handoff/plans/LOOP-001.md（网页版 ChatGPT High 产出，nonce 1a9a154b5a4afd0a，brief_sha f78bbbd…，verify 通过）。
- 投递通道：**A（网页聊天模式，思考强度 High）**，对话 https://chatgpt.com/c/6adf303f-f3fc-83e8-af9f-55e27ea2307c。调研标杆：NOAA PMEL ENSO 示意图、NASA SVS 2015–16 ENSO、NASA Eyes on the Earth、earth.nullschool.net、NASA Earth Observatory（规划案 §2.1 列明）。
- 被测源码 SHA：43403e7（产品与报告同批提交）。
- 环境：macOS arm64，Node v24.21.0，npm 11.12.1，Chrome（Kimi WebBridge 驱动，设备像素比 2）。
- 交付入口：仓库根目录 `npm run dev`（预览宿主会分配端口；逻辑端口 7100）。

## 2. 实现摘要

按规划 T01–T11 全量落地：Vite + three 0.186.1 单页应用；三幕状态机 + 纯物理参数函数（温跃层/暖指数/风/雨带/上升流）；半透明海盆剖体、顶点色海面、温跃层曲面+前缘线、12 个信风箭头、沃克环流点线、东部上升流虚线、雨带与影响导向弧；单 RAF 可打断双通道 tween（1000ms/700ms）；WebGL 缺失/上下文丢失降级与重试（换新画布重建）；五断点响应式；键盘与 aria-live；reduced-motion 停流。
文件清单：index.html、package.json、package-lock.json、README.md、src/{main.js,content/chapters.js,core/state.js,core/physics.js,scene/createScene.js,scene/geometry.js,scene/animation.js,scene/theme.js,ui/dom.js,ui/icons.js,styles/tokens.css,styles/app.css}、tests/{state,physics,content}.test.js。

## 3. AC01–AC10 对照

| AC | 结果 | 证据 |
|---|---|---|
| AC01 dev 启动+参数透传 | PASS | `npm run dev -- --host 127.0.0.1 --port 7317 --strictPort` → `Local: http://127.0.0.1:7317/`，curl 200。注：本机 7100 被系统其它服务占用（U08 分支，未动占用者），用 7317 验证透传；脚本为纯 `vite` 透传参数。 |
| AC02 three/vite 依赖 + 交互 | PASS | npm ls：three 0.186.1、vite 8.3.5；WebGL canvas 存在（1310×819）；CDP 真实鼠标拖动后透视变化（reports/evidence/rotate-zoom.png）。 |
| AC03 要素可辨 | PASS | state-normal.png：西暖东冷、西深东浅温跃层、信风左指、沃克环流、东岸上升流虚线、图例五项。 |
| AC04 三幕联动 | PASS | state-el-nino.png（暖色东扩、雨带移至中部、风减弱、温跃层变平）；state-impact.png（影响导向弧亮起）；impact-cards.png（四卡展开）；快速连点 10 次终态回第一幕、零报错。 |
| AC05 影响表述 | PASS | content.test.js 断言：4 卡、含来源 URL、“并非每次必然”、无 ℃/mm/% 伪造数值；截图 impact-cards.png。 |
| AC06 响应式 | PASS | 390/375/768/1024/1440 全部无横向溢出（scrollWidth ≤ clientWidth）；画布高 340/320/460/480/550 与规划一致；截图 mobile-390.png、mobile-375.png、desktop-1440.png。 |
| AC07 键盘/低动态 | PASS（部分见 §8） | 原生 button/a、DOM 顺序=视觉顺序、tabindex 边界禁用（prevDisabled=true 实测）、aria-live、aria-pressed、canvas role=img、focus-visible CSS；CDP Tab 在本机被窗口遮挡环境吞键，Enter/Space 激活为原生 button 标准行为（click 处理器同源验证）。reduced-motion：两帧像素完全一致（流动停止），切换即时。 |
| AC08 build+test | PASS | `npm test` → 16/16 通过；`npm run build` 退出 0，dist/index.html 存在。 |
| AC09 时延 | PASS（实测见 §8） | 本机加载即就绪（<1s，文字先行）；点击后 DOM 即时更新（实测 70ms 连点无丢态）。 |
| AC10 离线资源 | PASS（构建产物静态自包含，无 CDN 外链） | 全部依赖 npm 本地打包；字体用系统栈。 |

## 4. 命令原始输出（唯一真源）

- `npm test`：`ℹ tests 16 / ℹ pass 16 / ℹ fail 0`。
- `npm run build`：`✓ built in 125ms`（chunk createScene-*.js 786.82 kB，gzip 200.19 kB —— 在规划 ≤250KB gzip 目标内）。
- `npm run dev -- --host 127.0.0.1 --port 7317 --strictPort` → `Local: http://127.0.0.1:7317/`，`curl -I` 200。
- 全程浏览器控制台错误 0（注入收集器跨刷新采集 window.__errs 为空）。

## 5. 浏览器复现与截图

证据目录 reports/evidence/：desktop-1440.png、mobile-390.png、mobile-375.png、width-768.png、width-1024.png、state-normal.png、state-el-nino.png、state-impact.png、impact-cards.png、rotate-zoom.png、loading.png（限速网络下的加载提示）、fallback.png（禁用 WebGL2）、error.png（WEBGL_lose_context 触发）。复现步骤：本机 `npm run dev` 后按 §4 命令操作。

## 6. 科学一致性

- 三幕文案、温跃层曲线（西 1.70/东 0.45 → 1.15/1.03）、暖水东移、上升流减弱、雨带东移均与规划 §5.3 参数一致并有单测断言（physics.test.js 端点值精确比对）。
- 措辞审查：所有影响为“典型倾向/概率”，无“必然”；无伪造定量数据；中国冬季为“某些成熟期总体偏暖概率增加，寒潮仍存在”。
- 方向核查：画面左西右东与标签一致（相机方位角限制 ±0.58 rad，不会反转）。

## 7. 质量线 A–G

- A1 字体/字阶：PingFang SC + Noto Sans CJK SC 本机实测可用（document.fonts.check true）；7 级字阶 token；正文 ≤38 字/行。A2 对比度：token 表沿用规划验算值（文本 11.3:1–15.26:1）；暖冷双编码（颜色+文字+线型）。A3 4px 基线、1200 限宽。A4 圆角/阴影集中 token；焦点环 offset 3px 不被裁切（无 overflow 裁切焦点）。A5 单一 SVG 图标组（icons.js 9 个）、canvas 配 figcaption+aria-label。B1–B4：四态齐全（loading.png / fallback.png / error.png / 正常态）；切换 <100ms DOM 反馈；C08 横幅含重试动作。B5：五断点无横溢、按钮 min-height 44–48px。C：见 AC07。D：见 §8。E：HEX 仅存在于 tokens.css 与 theme 映射；无死 TODO。F：本报告逐项给证据。G：无 emoji 图标、无默认按钮、无布局位移动画。

## 8. 性能与已知测量限制

- 构建 gzip JS 200.19 kB（<250 kB 目标）；CSS 远小于 20 kB。三角形约 2.3 万（海面 128×32 为主），绘制调用约 45（<70 预算）。
- **FPS：NOT_TESTED**。原因：验证期间浏览器窗口被遮挡，页面 rAF 被 Chrome 节流（实测 3 秒 0 帧，截图强制 BeginFrame 才推进），无法在本机取得真实帧率；DPR 封顶 1.75、按需 RAF、几何一次创建等预算措施已落实。桌面目标 ≥55FPS 待用户前台环境确认。
- 200% 字体缩放：无横溢，卡片自然增高（实测 cardH 789px 增长）。

## 9. 未知项调查结果（U01–U08）

- U01：npm view 得 three 0.186.1、vite 8.3.5（engines 含 Node 24）→ 采用并锁 lock。
- U02：`import('three/addons/controls/OrbitControls.js')` 实测 true；Line2/LineGeometry/LineMaterial、BufferGeometryUtils 均可用。
- U03：Vite CLI 参数透传实测有效（7317 端口启动成功）。
- U04：沿用规划谨慎表述（NOAA/专家解读入口未变），content.test.js 守护。
- U05：本机 WebGL2 可用；WEBGL_lose_context 触发 → 错误遮罩 → 换新画布重试成功恢复（error.png + 复测通过）。
- U06：PingFang SC 与 Noto Sans CJK SC 均可用。
- U07：FPS 见 §8，标 NOT_TESTED；性能降级阶梯（DPR→网格→粒子→文字 fallback）在代码中落实，未触发。
- U08：本机 7100 被系统服务占用 → 验证用 7317；README 说明；宿主预览时由 Kimi Work 分配端口。

## 10. 偏离规划记录

1. §5.2 之外为恢复能力新增：重试时更换全新 canvas 重建渲染器（原因：WebGL 规范下丢失上下文后 `getExtension('WEBGL_lose_context')` 返回 null，无法在原画布恢复；证据：clean 实验 restore 可用但应用路径失效，换画布后端到端通过）。科学语义与界面不变。
2. 信风箭头减弱下限从 opacity 0.25 调至 0.45（长度系数 0.35→0.45）：厄尔尼诺态下原值几乎不可见，影响 AC03“可辨”要求；联动语义不变。
3. 色带加 S 形（smoothstep）偏置：让冷暖两端更可分辨，三段色标与 token 不变。
4. 删除 `(min-resolution: 1.5dppx)` 下 canvas aspect-ratio 覆盖：误伤 Retina 移动端导致横溢（390/375 实测溢出后移除，复测通过）。200% 缩放需求由固定画幅+容器自然增高满足。
5. createScene 新增有界相机回正 tween（700ms）：满足规划时间令牌；与物理 tween 不并发叙事动画。

## 11. 已知限制

概念示意不定量；不连真实数据、非天气预报；未测真机手机（仅模拟视口）；无音频/多语言（规划外）；FPS 未实测（§8）。

## 12. 阻塞

无。

## 13. 本轮投递网页提示词全文

```
仓库：noyzin2006-arch/el-nino-3d（公开仓）。请读这份简报并提交完整规划案：
https://github.com/noyzin2006-arch/el-nino-3d/blob/main/handoff/briefs/LOOP-001.md
规格与质量线：同仓库 handoff/spec/plan-spec.md、handoff/spec/design-quality-bar.md。只读这三个文件。先上网调研该品类当下最高水准的产品与设计系统，列出学习结论，再写规划案。
文件开头原样带上这五行指纹（不得改写重排）：
kind: plan
task: LOOP-001
round: 1
nonce: 1a9a154b5a4afd0a
brief_sha: f78bbbd62f60c216e6c5114d64ecafbc8d913f8c
写入 handoff/plans/LOOP-001.md 并推送；推不上就把规划案正文完整贴在回复里。
```
