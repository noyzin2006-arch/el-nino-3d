kind: plan
task: LOOP-001
round: 1
nonce: 1a9a154b5a4afd0a
brief_sha: f78bbbd62f60c216e6c5114d64ecafbc8d913f8c

# LOOP-001 首轮完整规划案｜厄尔尼诺：赤道太平洋海气耦合的 3D 交互解释

版本：2026-10-26。角色：独立首席设计与规划。执行方：本机 macOS arm64 Agent。性质：一次性、零提问、可直接实现的规范；本文不是完成报告。本规划仅依据指定简报及两份规范编制，未读取仓库其他文件。网页只解释一般科学机制，不展示 2026 年实时 ENSO 状况，也不充当灾害预测。

## 1. 需求、范围与非目标

### 1.1 需求与成果定位
用户原话：「做一个3D模型网页展示，讲解厄尔尼诺现象是怎么形成的，带来什么影响」。

交付一个中文单页、真正 Three.js WebGL 实时渲染的“可操纵地球科学剖面”：左为印度尼西亚/西太平洋，右为南美洲/东太平洋。把正常态、厄尔尼诺形成、典型气候影响串成一条可点击的三幕科学叙事。观察者同时看到信风箭头、空气上升与回流、暖池位置、温跃层倾斜、东部上升流、降雨区转移；按步骤切换时场景连续改变。气候影响用可读的四张地域卡而不是假造的全球风险地图表达。

### 1.2 范围内
- 单页信息架构：品牌/科学问题、步骤导航、三维主舞台、当幕解释、变量图例、全球影响与知识澄清、科学来源、无障碍替代描述。
- Three.js（npm 安装）实时三维场景：有厚度的海水剖体、顶面温度色带、温跃层曲面与前方切面、海洋上升流、信风与高空回流箭头、对流/降雨示意、方向标签；OrbitControls 可旋转/缩放和重置。
- 三个物理情境 NORMAL / EL_NINO / IMPACT，统一状态插值；IMPACT 在维持厄尔尼诺态的同时加强雨带及地域联动提示。
- 三幕中文科学文案，包含“典型相关而非必然”的边界说明。
- 响应式、全键盘核心路径、低动态偏好、WebGL 缺失的文字降级、错误和重试、可检查的测试与执行报告。

### 1.3 明确不做
不做账号、后端、语言切换、真实海温数据、逐日 ENSO 动态预测、2026 年实时监测、精确海陆地图/经纬地形、原生应用、PWA、音频、气候风险概率量化、基于场景参数的物理求解器。动画是解释性插值，不是精确气候数值模拟。不使用 R3F、外链 CDN、外部收费服务、远程 GIS 地图或外部动态图。

### 1.4 可验证验收（AC）
| ID | 明确门槛及可复核动作 |
|---|---|
| AC01 | 在仓库根目录 npm install && npm run dev -- --host 127.0.0.1 --port 7100 --strictPort，localhost:7100 返回页面；CLI host/port 实际生效；无白屏、控制台无未处理异常。 |
| AC02 | package.json 直接依赖 three 和 vite；浏览器 DevTools 有 WebGL canvas；拖动旋转、滚轮/触控双指缩放、重置可见；禁止以视频/静图充当画布。 |
| AC03 | 3D 同时可辨赤道太平洋西/东、向西信风、沃克空气环流、倾斜温跃层、表层温度差异、东岸上升流；图例与屏幕文字一一对应。 |
| AC04 | 3 个步骤均能点击、用键盘操作；NORMAL→EL_NINO 时信风变弱、东部温跃层下沉、西部相对抬升、暖色扩展东移、对流雨带东移；IMPACT 切换时 3D 再出现影响引导高亮，卡片同步变化。 |
| AC05 | 显示秘鲁/厄瓜多尔洪涝及沿岸渔业影响、印尼/澳大利亚偏旱风险、中国冬季总体偏暖可能性；所有影响明确“典型概率倾向，非必然”。不出现无来源的气温、降雨、渔获统计数值。 |
| AC06 | Chromium 系浏览器 1440、1024、768、390、375 CSS px 和 200% 字体缩放逐一检查，内容完整、无页面横向溢出、按钮触控区域 ≥44×44px。 |
| AC07 | Tab/Shift+Tab/Enter/Space/Escape 可遍历及操作步骤、前后步、重置、动画开关、来源链接；focus ≥2px 可见；prefers-reduced-motion 下阶段切换不缓动、粒子停止。 |
| AC08 | 可在 npm run build 构建；npm test 中纯逻辑测试全通过；人工核对四态、响应式、控制台、截图；执行报告不能把未跑测试写为 PASS。 |
| AC09 | 用户第一次进入 2.5s 内有可交互页面或可见等待说明；任一步操作 100ms 内改变选中/说明，轻交互 300ms 内完成 DOM 更新。 |
| AC10 | 无外部网络仍可加载本地已构建的应用资源（通过本地 HTTP 服务，不是 file://）；离线访问科学来源链接失败不影响核心展示。 |

### 1.5 环境与假设
指定环境：macOS arm64，Node 24.21.0，npm 11.12.1；无 TTY 和付费 key；npm 公网可用。浏览器基线：当前 Chrome/Chromium、Safari 的 WebGL2 路径，WebGL 不可用时必须文本可用。脚本为 dev: vite、build: vite build、test: node --test tests/*.test.js、preview: vite preview；Vite 原生透传参数，不在脚本里写死 7100。建立 package-lock.json；依赖安装时查询 npm 官方版本并锁定，禁止在方案里杜撰截至今天的精确版本号。

## 2. 调研结论与最高水准参照

### 2.1 实地网络查验的五个标杆（来源与提炼）
| 标杆与真实入口 | 强点（实际可学） | 本项目执行映射 | 不复制之处 |
|---|---|---|---|
| NOAA Pacific Marine Environmental Laboratory 的 ENSO 示意图，https://www.pmel.noaa.gov/elnino/schematic-diagrams/ | 三种状态共享东西方向、温跃层和暖池的同一图解语法，能一眼比较 | 保留固定东西方向、保持横剖面基准，三幕只更新变量，不换透视投影 | 它是静态解释图，不能直接复制静图当交互 |
| NASA Scientific Visualization Studio 的 2015–16 3D ENSO 可视化，https://svs.gsfc.nasa.gov/4544/ | 上层海温与洋流在时间上共同变化；有科学标注与来源 | 海温带、海下剖面和洋流用同一时钟变化，突出物理因果链 | 不直接挪用其视频、历史实测场做虚拟实时数据 |
| NASA Eyes on the Earth，https://eyes.nasa.gov/apps/earth | 3D 空间漫游将地理对象作为可操纵学习载体 | 保留可手动旋转/缩放/回正以及稳定相机入口 | 不做全球高保真地球与复杂工具栏，教学焦点仍为赤道剖面 |
| earth.nullschool.net，https://earth.nullschool.net/ 与 https://earth.nullschool.net/about.html | 风场流向+色彩场分层编码、持续运动、层选择的清晰视觉原则 | 风场箭头（方向）、海温颜色（冷热）、透明层（剖面）相互分离 | 不接实时气象 API，不复制无边界的操作密度，不把模拟箭头冒称测量值 |
| NASA Earth Observatory “World of Change: El Niño, La Niña, and Rainfall”，https://science.nasa.gov/earth/earth-observatory/world-of-change/enso/ | 把 SST 变化与降雨变化配对，使远程影响可以观察 | 第二幕交代海气耦合；第三幕成组呈现降水迁移与地域影响 | 不把长期历史循环硬编码成“每次都一样”的确定结论 |

科学对照权威入口（不是第五个 UI 标杆）：NOAA https://www.noaa.gov/jetstream/tropical/enso/enso-patterns；NOAA https://www.noaa.gov/understanding-el-nino；NOAA CPC https://cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/enso_schem.shtml；NOAA https://www.weather.gov/fwd/basics；NASA https://science.nasa.gov/earth/explore/el-nino/；中国冬季概率表述参考政务转载气象专家解读 https://www.szlhq.gov.cn/gkmlpt/content/12/12971/post_12971044.html 。这些入口支持正常态东西向温差与倾斜温跃层、信风减弱后东部温跃层加深、上升流削弱、对流迁移及全球遥相关。不同 ENSO 事件的强度、位置和影响并不完全相同。

### 2.2 设计系统、技术与方法
| 实际参照 | 确认事实 | 落地决策 |
|---|---|---|
| IBM Carbon 色彩无障碍 https://www.carbondesignsystem.com/building-blocks/foundations/accessibility/color | 普通文字 4.5:1、大文字 3:1、非文字 UI 3:1 | 令牌色对实际验算，禁用态仍至少 2:1，不能靠橙蓝单独辨认 |
| IBM Carbon 间距 https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview | 小步进与规则化组件间距 | 本项目硬锁 4px 基线；不用自由间距 |
| IBM Carbon Motion https://www.carbondesignsystem.com/building-blocks/foundations/motion | 小反馈与长距离叙事变化分时长，productive/expressive 分开 | 120ms UI 反馈、240ms 组件转场、1000ms 海洋机制过渡，后者为叙事动画不是布局动画 |
| W3C WCAG 2.2 https://www.w3.org/TR/WCAG22/ | 焦点、键盘、可替代拖动、指针目标、减弱动效 | 核心可键盘操作；项目提高移动目标到 44×44px |
| Three.js OrbitControls https://threejs.org/docs/pages/OrbitControls | 支持轨道旋转、缩放、阻尼，阻尼开启时需更新 | 原生 addons/controls/OrbitControls.js，不用自行模拟触摸手势 |
| Three.js BufferGeometry https://threejs.org/docs/pages/BufferGeometry.html 与 WebGLRenderer https://threejs.org/docs/pages/WebGLRenderer | 顶点数据与 DPR 控制可用 | 复用缓冲，不逐帧 new Mesh；DPR 封顶 |
| Vite CLI https://vite.dev/guide/cli | CLI 支持 --host、--port、--strictPort | package dev 脚本仅 vite，宿主参数直接透传 |
| Three.js ocean 示例 https://threejs.org/examples/webgl_shaders_ocean.html | 官方提供高级水面光照/材质效果 | 借鉴平面反射层次，但不使用重水面/天空/后处理组件；平稳 60FPS 优先 |

### 2.3 对 2026 品类水准的判断
经上述案例与官方规范对照，采用“科学语义先于炫技”的可操纵剖面 + 递进故事 + 直接编码图例 + 不确定性说明 + 完整无障碍替代。淘汰的做法：粒子堆满画面、红蓝无单位误导、固定 autoplay 无暂停、全屏 3D 遮蔽正文、移动端缩小桌面控件、只做视觉不做可读解释。“最高水准”是本项目的设计目标和参照判断，不是经第三方评比得到的客观排名。

**完成定义：非气象专业用户在 90 秒内通过三次点击，能够正确讲出“信风弱化→暖水东移/温跃层变平→东部上升流减弱/雨带移动→跨区域影响概率改变”，且能从画面核验每一环。**

## 3. 设计语言（可判定规格）

### 3.1 设计令牌，唯一真源：src/styles/tokens.css；JS 三维配色仅从 src/scene/theme.js 导出的语义映射读取 CSS token（初始化时 getComputedStyle 一次）

#### 颜色与对比度
主方案仅暗色，不提供伪装的浅色模式。所有 UI 颜色 CSS 变量命名以 --c- 为前缀；主题值只在 tokens.css 定义。下表对比依据 sRGB WCAG 算法，说明的比值只对列明的背景组合有效，其他搭配须实测。

| 类别/令牌 | HEX | 用途及最低可读组合 |
|---|---|---|
| --c-page | #071522 | 页面外底 |
| --c-panel | #0D2335 | 卡片/步骤区底 |
| --c-elevated | #143147 | 非当前按钮/悬浮层底 |
| --c-active | #1A3950 | 活跃步骤深色底 |
| --c-text | #F5FAFD | 主文字；panel 上约 15.26:1 |
| --c-secondary | #C6DCE7 | 解释性文字；panel 上约 11.30:1 |
| --c-tertiary | #93B3C6 | 辅助文字；active 上约 5.45:1 |
| --c-on-accent | #071522 | 亮色按钮的反白替代“深色前景”；accent 上约 12.11:1 |
| --c-border-subtle | #6D90A6 | 静态线；active 上约 3.55:1；用于必须辨认的控件也达 ≥3 |
| --c-border-strong | #78E1EE | 焦点 2px 实线、当前幕指示，不与 hover 重合 |
| --c-accent | #78E1EE | 控件强调、冷色科技提示；panel 上约 10.55:1 |
| --c-warm | #FFBC7C | 暖海温/高亮信息；panel 上约 9.73:1 |
| --c-success | #80E5B0 | 成功说明文字；panel 上约 10.51:1 |
| --c-warning | #FFDE86 | 教学告诫文字；panel 上约 12.26:1 |
| --c-danger | #FF6B6B | 错误文字；panel 上约 5.78:1 |
| --c-info | #93B3C6 | 科学范围注记；panel 上约 7.26:1 |
| --c-ocean-cold | #26AEC5 | 3D 相对冷海水（不直接放白色细字） |
| --c-ocean-mid | #F1C16E | 3D 过渡温层 |
| --c-ocean-warm | #EF8559 | 3D 相对暖海水 |
| --c-deep-sea | #0A5C78 | 3D 深海 |
| --c-thermocline | #FCE4A7 | 3D 温跃层描边 |
| --c-wind | #E8F8FF | 3D 风箭头 |
| --c-rain | #78E1EE | 3D 降雨点划线 |
| --c-disabled | #6D90A6 | 禁用文字，仅放在 page/panel 底上且 ≥2:1 |
| --c-overlay | #071522 | 模态/状态遮罩采用 rgba(7,21,34,0.88)；仅 token 内允许透明值 |

3D 分类的颜色不等于海温实测数值；每类均同时提供文字“偏暖／偏冷”、流向箭头、线型与位置编码，用户可关闭颜色认知负担。禁用态判读不能只靠变灰，还需 aria-disabled 和禁用指示；布局中的文字对比按最差实际底色检验。不要把 --c-tertiary 放在海温渐变正上方。

#### 字体与字号
中文栈：'PingFang SC','Noto Sans CJK SC','Microsoft YaHei','Source Han Sans SC',sans-serif；西文/数字栈：'Avenir Next','Helvetica Neue','Inter',Arial,sans-serif。显式 font-family，不依赖浏览器默认设置；本机无需下载外部字体，故 font-display:swap/字体 preload 对系统字体不适用。如下载自托管开源字体须核实许可证，使用本地 @font-face font-display:swap 并仅预加载首屏字重，否则保持上述栈。font-feature-settings: 'kern' 1, 'palt' 1；font-variant-numeric:tabular-nums。标题字阶倍率 1.25，六级以上，全部 CSS rem 随浏览器缩放：

| 令牌 | px @16px root / rem | 行高、字重、字距 | 用途 / 最大宽度 |
|---|---|---|---|
| --fs-0 | 12px / .75rem | 18px, 500, .02em | legend 字签，仅装饰注记；限 30ch |
| --fs-1 | 14px / .875rem | 21px, 500, .01em | 表头、状态说明；限 40 个中文字符 |
| --fs-2 | 16px / 1rem | 26px, 400, 0 | 正文及按钮；段落最长 38 个中文字符 |
| --fs-3 | 20px / 1.25rem | 27px, 600, -.01em | 卡片标题；限 28ch |
| --fs-4 | 25px / 1.5625rem | 31px, 650, -.015em | 幕标题；限 22ch |
| --fs-5 | 31.25px / 1.953125rem | 39px, 700, -.02em | 首页主标题移动端 |
| --fs-6 | 39.06px / 2.44140625rem | 47px, 700, -.025em | 首页主标题桌面 |
| --fs-7 | 48.83px / 3.0517578125rem | 59px, 700, -.03em | 仅大型视觉屏幕可选，本轮不用 |

正文行高 1.625、主标题约 1.2、控件约 1.35，长中文正文 width: min(100%, 38em)；不首行缩进；段落 margin-block:0 16px。移动端正文字号不得低于 16px，图例 12px 仅为非独立承载信息的辅助标签。

#### 几何、深度与动效令牌
| 分组 | 完整定义 |
|---|---|
| --s-1..9 | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px；页面模块距 48；组件群距 24；卡内 24；控件水平 16、垂直 12；标签与说明 8 |
| 容器 | max-width:1200px；desktop-inline:32px；tablet-inline:24px；mobile-inline:16px；2 栏 8/4 网格（12 列，gap 24）；390 下单列 gap 16 |
| 圆角 | --r-xs:4px，--r-sm:8px，--r-md:12px，--r-lg:16px，--r-pill:999px；按钮 8，卡 16，状态横幅 12，单选步 12 |
| 描边 | 控件 1px --c-border-subtle；焦点环 2px --c-border-strong + offset 3px；区块优先间距分组，不叠加阴影+描边+底色 |
| 阴影 | elevation0:none；e1:0 4px 16px rgba(0,0,0,.16) 卡；e2:0 8px 24px rgba(0,0,0,.22) 浮动；e3:0 16px 48px rgba(0,0,0,.30) 错误浮层；e4:0 24px 64px rgba(0,0,0,.36) 模态；仅在 tokens.css 定义 |
| z-index | base:0、scene:1、hud:2、controls:3、dropdown:20、modal:30、toast:40。集中 tokens.css 不准 magic number |
| 缓动 | --ease-ui:cubic-bezier(.2,0,.2,1)；--ease-narrative:cubic-bezier(.22,1,.36,1)；--ease-out:cubic-bezier(.16,1,.3,1) |
| 时间 | --t-tap:120ms；--t-toggle:240ms；--t-enter:420ms；--t-physical:1000ms；相机重置 700ms；prefers-reduced-motion 则全部 0ms；风箭头自动流动在 reduced motion 关闭 |
| 图标 | 唯一风格：原生 SVG 24×24 viewBox，2px stroke，round cap/join；来自手工维护的 src/ui/icons.js 同一组 path：ChevronLeft、ChevronRight、RotateCcw、Pause、Play、Info、AlertCircle、ExternalLink、Waves；24/20/16px；不使用 emoji 或引入多套图标 |
| 大断点 | ≥1280 max1200 两栏（主舞台 8 栏、文案 4 栏）；1024–1279 max960 两栏 7/5；768–1023 单栏文案跟随画布；481–767 单列；≤480 单列紧凑 |
| 抗跳动 | canvas 容器有确定 min-height/aspect-ratio，所有图标 width/height 定值；截图及图片如果新增要有尺寸、alt |

#### 3D 色彩和空间编码规则
画面恒为左西（印度尼西亚）右东（南美洲）；标题“西太平洋 ← ｜ → 东太平洋”、实际 x 轴从 -6 到 +6。表层暖色 ≠ 真实 ℃；图例明确标记“海表相对暖冷示意（不是温度实测）”。温跃层黄色实体实线，信风白色实箭头，沃克回流白色空心/点线箭头，东岸冷水上升流青蓝虚线；不可仅用颜色区分线。场景下方全程显示“概念模型｜纵向夸张｜非实时数据｜阶段非等间隔时间”。

### 3.2 组件规格（编号 C01–C10）
公共交互状态协议 S：默认背景与字色取令牌；仅在 hover:hover 且 pointer:fine 下出现 120ms 背景升一级与 translateY(-1px)；按下 120ms transform:scale(.98)、亮度 +4%；focus-visible 2px 高亮外环 offset3，不裁剪；aria-disabled=true 时取消 hover/点击，opacity:.72 并附解释 label；加载时左侧等尺寸 SVG 转圈且 aria-busy=true（reduced-motion 静态）；错误时就地 14px --c-danger 文案+AlertCircle+重新操作动词；空时用明确引导+占用空间；成功时 14px --c-success 的确认不超 3s，关键场景选择的成功信息长期保留在当前态。所有 interactive hitbox ≥44×44px，Tab 与 DOM 顺序一致，Space/Enter 激活 button。被动组件 hover/按下/focus/disabled 不适用（本来就非可操作），但四种数据状态仍须按下述明确。

| 组件 | 结构、尺寸、样式与交互 | 四态 + 状态细化与 ARIA |
|---|---|---|
| C01 顶部标题/页内导航 | header > logo SVG Wave 24 + 小字“海洋与气候”、h1“厄尔尼诺，从海面到全球”；容器高 auto、上/下 24；logo 距题 12。桌面 h1 fs6，移动 fs5；顶部短引“如果信风变弱，海洋和天空会怎样？” fs2 | 默认永远渲染，空时“探索赤道太平洋的三次变化”，加载时标题仍显示，错误时页内状态横幅 C08，成功显示当前幕计数 01/03。非交互元素不设置 tabIndex。 |
| C02 步骤选择器 | nav aria-label=“厄尔尼诺演示阶段”；3 个 button：① 正常年份／② 暖水东移／③ 全球影响；外容器 gap8，按钮 min-height48、padding 12×16、radius12、border1；选中 --c-active 底 + 左侧 3px --c-accent 线、aria-current=step；文字 fs2 | 默认未选底 elevated；hover/press/focus/S 完整；切换时立即更新选中（<100ms），动画中按钮仍可选，最新操作中断上次 tween；不可用 WebGL 时仍可切换文字，aria-disabled=false；异常时 C08 提示并切文字模式；已选择同一步重按不重启 tween；选中态 aria-current='step'，不伪用 tab role。 |
| C03 步进控制 | “上一步”“下一步”2 个 button；44px 高、min-width100、radius8、SVG 箭头 20，gap8；桌面置右侧叙事底，移动在画布下 | 第一幕上一步 aria-disabled=true 且截断动作；末幕下一步同理；加载 3D 期间按钮依然控制文案；异常改为纯文本步进；切换完成在 live region 写“已切换至第 N 幕”；不触发自动聚焦。 |
| C04 3D 舞台 | figure > canvas-frame > canvas + overlay west/east label + legend + 底栏；desktop 高 550px，tablet 480，mobile 340（375px 下 320）；radius16；背景 panel；canvas role=img、aria-label 描述当前情境，并提供可读 figcaption 和下方完整 text alternative；OrbitControls 阻尼 .08、禁止平移 | loading: 固定画幅内提示“正在建立赤道太平洋模型…”+进度阶段 text；空: WebGL 无支持即透明度为 0 的 canvas 隐藏，显示纯文本变量表；错误: WebGL context lost 显示“图形绘制已中断，仍可阅读三个阶段。点击重试 3D。”；成功: 去掉遮罩，保留“可拖动旋转，滚轮/双指缩放”提示；舞台不是键盘操作唯一入口，C05 提供等价控制。 |
| C05 视角/动态工具 | 舞台底栏：button“重置视角”（Rotate 20）、button“暂停流动/继续流动”（Pause/Play 20），各高44、padding 12 16；主操作 1 个，次操作描边；工具栏 role=group aria-label=“三维视角工具” | 默认、hover、press、focus 走 S；无法 3D 时 aria-disabled=true，标签补“此浏览器不支持三维”；加载不可使用且显示忙态；报错由 C08 提供重试；重置后短暂 live text“视角已复原”；播放状态 aria-pressed 反映暂停开关，低动效偏好时默认暂停并提供显式“继续流动”。 |
| C06 物理图例 | 2 行 CSS grid：相对暖/冷、温跃层、信风、环流、上升流；每项 SVG 短线或箭头 20 + 中文 14，间距 12；容器 padding16，上边以 24px 间距与画布隔开，不加重复阴影 | 默认文字/纹理不依赖色；数据空时固定五个静态图例；加载仍显示；错误状态说明“图例仍表示科学机制，画面暂不可用”；成功显示所有项；被动无 hover/press/focus/disabled。 |
| C07 解释主卡 | article 内序号 01/02/03、h2、正文 2–3 句、关键变量 3 行；panel radius16 padding24；h2 fs4，body fs2，行长 ≤38 个汉字 | 默认配当前幕；空永远退回 NORMAL；加载文字先行不做骨架遮蔽；错误仍展示当前文案；成功显示对应物理变化列表；被动状态 n/a；aria-labelledby 对应 h2。 |
| C08 状态横幅 | role=status、aria-live=polite；出现错误时内部 role=alert；宽100%、min-height44、padding12 16、radius12，文字 14 图标20；重试按钮 44 | 空：不占视觉高度、单独 sr-only 描述“等待您选择阶段”；加载：显示当前工作“正在绘制…”；错误：原因类别+操作“重试三维绘制”，不显示堆栈；成功：显示“已进入正常年份/厄尔尼诺/全球影响”2s 后隐藏但 aria-current 长存。 |
| C09 全球影响卡组 | section h2“影响不是预言”+四张 div.card，桌面2×2、移动1列；每卡 16px 内边距、r12、左细标尺；标题 fs3、文案 fs2、来源标注 12px；地域按逻辑为秘鲁/厄瓜多尔、秘鲁近岸渔业、印尼/澳大利亚、中国 | 非 IMPACT 时以低权重显示 4 卡摘要标题、不隐藏事实；进入 IMPACT 展开解释并逐卡 240ms opacity+transform，reduced 为 0；空时显示“先选第三幕，查看四类典型影响”；加载和图形错误照常文本可读；成功显示完整影响和概率提示；不设假交互。 |
| C10 科学说明与来源 | footer 中“为什么不是天气预报？”段落 + 3–5 个外链，链接 fs1、44px 高、ExternalLink SVG 16；引用网址保留可复制 | 默认与三幕共享；外链 hover underline、pressed 稍降透明、focus S；离线点击交由浏览器处理、正文不受影响；空时至少 NOAA 与 NASA 两个本地文本链接；错误显示“链接需要联网打开，但当前演示不受影响”，成功浏览器新标签打开，rel=noopener noreferrer；不伪造 API 数据获取状态。 |

组件共性规则：无提交/删除/弹窗/排序/筛选/输入框，所以相应“破坏性操作确认”“表单 aria-invalid”不适用，执行报告逐条标明 N/A；所有链接和按钮仍满足完整状态链。若未来确需新增控件，先复制 S 协议与令牌再实现，不新造颜色。

## 4. 体验设计：完整用户旅程

### 4.1 信息架构与阅读顺序
单页三层：标题引导 → 主要交互区（C02 步骤 → C04 舞台及 C05/C06 → C07 当前解释）→ C09 影响 → C10 科学边界和参考。最大深度 3。无全站菜单、无侧滑抽屉、无路由跳转。浏览器刷新回到第一幕；不改写浏览器历史栈、不持久化阶段选择。

桌面 1440px、页面总容器 1200px，头部 h1 + intro 高度按内容；其下步骤栏横跨 1200；主要内容 grid 8/4 栏、gap24，左 3D/图例，右幕文案/操作；impact 四卡在下方宽容器；资料 footer。首屏 900px 高视口：能看到标题、三幕切换和画布主体，不用滚动即可完成切换；画布下缘允许随视口高度落在首屏之外，但三幕点击始终在画布上方。辅助文本无需依赖 canvas 辨认方向。

文本线框：
  HEADER：海洋与气候 | 厄尔尼诺，从海面到全球
  LEAD：当赤道上的信风减弱，海洋怎样改变天空？
  NAV： [01 正常年份] [02 暖水东移] [03 全球影响]
  ┌─────────────────── 3D SCENE (8) ─────────────────┐  ┌── NARRATIVE (4) ──┐
  │ 西太平洋 ←  暖池/风/环流/温跃层  → 东太平洋       │  │ 01 / 03           │
  │ orbit / zoom / reset; temperature legend            │  │ 正常年份的海洋    │
  └───────────────────────────────────────────────────┘  │ 因果分解         │
  legend / source note                                  │ 上一步/下一步     │
                                                        └───────────────────┘
  GLOBAL IMPACT / SCIENTIFIC CAUTION
  SOURCES

### 4.2 第一轮体验：首屏 → 机制 → 影响
1. 打开 URL，200ms 内先显示已完成排版的标题、三步导航、文字解释与尺寸固定的 canvas 区；C08 文案“正在建立赤道太平洋模型…”；初始化成功解除遮罩，场景默认 NORMAL；如果 WebGL 禁用，自动在同一画幅以 HTML 变量表替代。
2. 第一幕：画面西侧暖池、东侧冷色和东岸蓝色上升流明显；信风箭头向左，高空环流向右、西端上升、东端下沉；温跃层在西部深、东部浅。文案：“在通常状态下，赤道信风由东向西吹，把表层暖水推向西太平洋。东部较浅的温跃层让较冷、富营养的海水容易上涌。暖湿空气在西太平洋附近上升，构成沃克环流的一部分。”
3. 点击“02 暖水东移”：选中态 100ms 内切换，3D 1000ms 从 NORMAL 过渡到 EL_NINO；东部温跃层向深处平缓延伸、暖色延伸到中央与东部、风箭头缩短/变淡、雨带移动到中东部。文案：“当信风持续减弱，原先被推往西部的暖水向中东太平洋扩展。东太平洋温跃层加深，冷水上涌受到抑制；暖海水也改变上方对流和降雨的位置。海洋与大气相互反馈，这就是厄尔尼诺发展中的关键链条。”注：“信风有时会短暂反转，但不是每次都发生；本示意只表现典型减弱。”
4. 点击“03 全球影响”：海洋仍处于 EL_NINO 并有 700ms 降雨/对流高亮、从风场到东部暖区的联系弧线；右侧改为“海洋的变化会远距离影响天气概率”，下方 4 卡变详细：A 秘鲁及厄瓜多尔部分沿岸降水/洪涝风险可上升；B 秘鲁近海上升流与营养盐供应减弱，渔业资源的分布和渔获可能受冲击；C 印尼/澳大利亚部分地区偏旱风险可增加；D 中国某些厄尔尼诺成熟期冬季总体偏暖概率增加，但寒潮、区域差异仍然存在。每卡都写“典型倾向，并非每次必然”。同时避免声称影响在全球同步发生。
5. 用户返回第一幕：现有 tween 从当前渲染进度连续转到 NORMAL，无骤跳；“重置视角”仅回正镜头，不改当前幕；“暂停流动”只停止循环风/雨粒子，不冻结场景切换。

### 4.3 次要路径与异常路径
- 想理解温跃层：读 legend“温跃层：上层暖水与下方冷水的快速过渡界面”，旋转 ±34° 内可看到顶面与前切面；如果用户不旋转，默认构图已经露出黄色界面与切面，不将知识点藏在拖拽后。
- 误把图当实测：舞台固定说明“概念模型 · 不是当前海温或天气预报”；点击来源外链自行查 NOAA/NASA，链接失效不影响本地页。
- WebGL 创建失败：完整 C07 文案先显示，C04 改成带 west/east 示意条的纯 HTML 状态矩阵；3 幕依然可操作；重试按钮可再次创建渲染器，不无限循环。
- 失焦/页面被遮挡：document.visibilitychange 暂停 RAF；恢复时以最新 performance.now() 重新计算，丢弃上一帧巨大 dt，平滑恢复，不发生跃迁。

### 4.4 每个断点的明确规则
| 宽度 | 布局 | 画布与控件 |
|---|---|---|
| ≥1280px | max1200、水平 32 padding、8/4 栏、gap24 | canvas 高550；C02 三步一排；C09 2×2 |
| 1024–1279px | max960、7/5 栏、gap24、水平24 | canvas 高480；标题 fs6；C09 2×2 |
| 768–1023px | 一栏、水平24、解释下移 | canvas 高460；C02 横排；C05 底栏 |
| 481–767px | 一栏、水平16、标题 fs5、步骤三等宽 | canvas 高400；控制按钮可换行；四影响卡1列 |
| ≤480px | 一栏、水平16、标题 fs5，主卡 padding16、段间24 | canvas 375–390 宽时高340，≤375时高320；步骤按钮改为三行堆叠、各44+；C05 两列平分；图例分两列；页面禁横溢 |

移动端 390 宽度下舞台 100% 画幅宽、按钮均可点；每个纯文本标签可换行不截断，最多二行标题、其他正文完整自然换行。用户字体 200% 时取消固定 height 改 min-height，说明卡自然增长；canvas 高度不强行扩张、可滚动但不横溢。任何移动设备不靠 hover 发现操作。

### 4.5 状态完整文案
- 初始载入：**“正在建立三维海洋剖面…”**；若 >1s：**“图形模型需要一点时间，文字讲解已可以阅读。”**；若 >10s：**“图形仍未就绪。继续阅读，或取消绘制并使用文字示意。”**（出现可点击“使用文字示意”）。
- 加载成功：**“模型已就绪。拖动旋转，双指或滚轮缩放。”**
- WebGL 不支持：**“此浏览器无法绘制三维模型。您仍可通过下面的变量表完成三阶段学习。”** 按钮：“重试三维绘制”。
- context lost：**“三维绘制被中断。可能是浏览器暂时回收了图形资源。点击‘重试三维绘制’，或继续阅读文字示意。”**
- 纯逻辑空态：**“请先选择一个阶段。默认从‘正常年份’开始。”**；程序直接回落 NORMAL，不出现无意义空白页。
- 切换成功：**“已进入第 2 幕：暖水东移。”**、第三幕同理，数秒后只保留已选步骤标题。
- 科学边界：**“本页是概念示意。箭头速度、温跃层高度和颜色均不按实际比例；厄尔尼诺改变的是区域天气概率，不决定某天是否下雨。”**

## 5. 技术实现细节与边界处理

### 5.1 固定栈与文件落位
- Vite + 原生 HTML/CSS/ES Modules + npm three，Node 内置 node:test/strict assert。禁止 React/R3F、GSAP、外链字体/图片、外部服务。
- 文件树：index.html；package.json；package-lock.json；src/main.js（启动/事件接线）；src/content/chapters.js（中文文案和来源）；src/core/state.js（状态机/分段）与 physics.js（纯物理参数函数）；src/scene/createScene.js（scene、camera、renderer、controls 生命周期）；src/scene/geometry.js（海洋/温跃层/箭头模型）；src/scene/animation.js（统一 RAF/tween）；src/scene/theme.js（token 到 three Color）；src/ui/dom.js（生成 DOM/内容更新）；src/ui/icons.js（SVG 原始 path）；src/styles/tokens.css 和 app.css；tests/physics.test.js、tests/state.test.js、tests/content.test.js；README.md；reports/latest.md；reports/evidence/（截图）。保持每文件一项职责。
- index.html 设置 lang=zh-CN、title、description、viewport meta，div#app 与 noscript 中文提示。

### 5.2 精确接口与状态（可直接抄写的模块契约）
- chapters.js：导出 CHAPTERS 数组，3 项只读，各项 {id:'normal'|'el-nino'|'impact', number:'01'|'02'|'03', title:string, body:string[], facts:{label:string,value:string}[], srSummary:string, impactHighlights:string[]}。另导出 IMPACT_CARDS 数组，四项 {id, region, headline, detail, caveat, sourceUrl}；SOURCES 数组 {label,url,purpose}；禁止无出处数字。
- state.js：导出 INITIAL_STATE = {chapterId:'normal', targetProgress:0, progress:0, impactWeight:0, motionPaused:false, reducedMotion:false, sceneStatus:'loading', errorCode:null, cameraResetNonce:0}；sceneStatus ∈ 'loading'|'ready'|'fallback'|'error'。导出 getChapterIndex(id):0|1|2；nextChapter(id):id；previousChapter(id):id；setChapter(state,id):newState（纯函数；非法 id 返回原 state）；getTargetState(chapterId):{ocean:number,impact:number}（normal 0/0, el-nino 1/0, impact 1/1）。
- physics.js：导出 clamp01(x):number；smoothstep01(x):number；sampleThermocline(u,ocean):number；sampleSurfaceWarmth(u,ocean):number；samplePhysics(ocean,impact):{tradeStrength:number,walkerStrength:number,rainX:number,upwellingStrength:number,impactOpacity:number}。u 在[0,1]从西至东；越界先 clamp，非有限数回归 0；所有纯函数可 node --test。
- geometry.js：export createOceanSystem(THREE,theme):{group,update(ocean,impact,elapsed),dispose()}，渲染资源创建一次，状态只更新 buffer、位置和 opacity，不在 RAF 中新建几何/材质。
- createScene.js：export mountScene(container,{onReady,onError,onContextLost,reducedMotion}):{setPhysicalState(ocean,impact),setFlowPaused(boolean),resetCamera({instant}),resize(),destroy()}；若 WebGL2 不可用，抛 {code:'WEBGL_UNAVAILABLE'} 类型稳定错误码，不向用户裸露堆栈。
- animation.js：export createAnimator({onFrame,onSettled,reducedMotion}):{transitionTo({ocean,impact},durationMs),setPaused(bool),start(),stop(),dispose()}；始终只有一个 RAF；两个 tween 通道 ocean/impact 共享一个起点时间，后来的切换以当前渲染值为新起点，禁止队列积压。
- ui/dom.js：export mountUI(root,{onSelect,onPrevious,onNext,onResetCamera,onToggleFlow,onRetry}):{render(state),setBusy(bool),destroy()}；DOM 更新只修改有关节点的 textContent/attributes/class，禁止 innerHTML 注入用户数据；静态可信 SVG path 由 icons.js 输出。
- main.js：依次 mountUI→检查 reducedMotion→mountScene→start animator→监听 buttons。state 唯一真源 main 的变量，UI 读 state，3D 只接收插值 numeric state；不引入 localStorage 持久化。

### 5.3 可复现实验空间坐标（全部“模型单位”，不是经纬或米）
- x ∈ [-6,+6]；-x=西/印度尼西亚，+x=东/南美；y=向上；z 为海盆宽度。海面 y=0，深部最低 y=-2.3；z∈[-2.2,+2.2]，前切面 z=+2.21。海盆以一个开放上表面的半透明棱柱+前切面层为核心。
- 可见水面用 128×32 的 PlaneGeometry 几何网格，水平 x-z，y=0.04；顶点/纹理颜色由 sampleSurfaceWarmth(u,ocean) 提供。不要把温度的单次观测或 +℃ 数字写到色标。颜色带平滑三段：cold #26AEC5 → mid #F1C16E → warm #EF8559，输出 sRGB；为了色盲兼容在画布外附 “西部暖区 / 东部冷水及上升流 / 暖色向东移动”的文字状态。
- 温跃层深度 d（模型单位）：
  dNeutral(u)=1.70 - 1.25*u；dElNino(u)=1.15 - 0.12*u；
  d(u,ocean) = (1-ocean)*dNeutral(u)+ocean*dElNino(u)；
  mesh y=-d，前切面可见曲线绘制为 96 段黄色实线；顶部暖水区域与其下面深蓝水分界采用半透明色分层；这仅示范“正常西深东浅，事件期间坡度变小、西边相对变浅而东边变深”，数值无物理单位；不得显示为米。
- 相对表面暖指数（无单位）：
  warmNeutral(u)=0.75-0.55*u；
  warmEvent(u)=clamp01(warmNeutral(u)+0.65*exp(-pow((u-0.74)/0.30,2)))；
  warmth=(1-ocean)*warmNeutral+ocean*warmEvent；
  西端始终相对暖，中央东部事件期明显转暖；对所有 u clamp01。
- 信风：y=0.65 的 12 个同向箭头，流向 -X（东向西）；NORMAL 强度 1，EL_NINO 0.35（长度、流速与 opacity 联动），不以通常反向表示 El Niño。高空回流：y=3.3，方向 +X；西端上升、东端下沉形成 4 条可见 3D 轨线；NORMAL 权重 1，EL_NINO 权重 0.40，并随雨带向东移动，禁止画成整套气流正常反转。
- 上升流：东端 x=+5.25、z=0.2 和 z=1.4，蓝色虚线水流向 +Y，NORMAL 权重 1、EL_NINO 0.27；气泡/箭头起点 y=-1.2，顶端 y=-0.08。不要用深度比例说明“水来自准确的几百米”。
- 雨带与对流：西端 x=-4.4（NORMAL），中部 x=+1.0（EL_NINO），以 1 到 3 个低面数云状曲线/蓝色竖线示意，非实时降水；动画模式 impact=1 时在 700ms 内亮起“降雨区偏东”的虚线导向，C09 同步展开。地理影响位置仅在 HTML 卡中解释，不把中国/澳洲强行贴在海盆剖面坐标上。
- 侧标：西端“印度尼西亚附近”、东端“南美洲沿岸”，受小视角变化也不能反转。面前剖面可见，摄影机 PerspectiveCamera fov=38、near=.1、far=100，初始 position=(0,7.6,16.5)、target=(0,0.65,0)；OrbitControls.enablePan=false、enableDamping=true、dampingFactor=.08、minDistance=10、maxDistance=22、minPolarAngle=.60、maxPolarAngle=1.32、minAzimuthAngle=-.58、maxAzimuthAngle=.58；不允许旋转到标签西东反向。
- Three.js 透明对象排序可能产生误读：水盒下层不透明蓝；顶层半透明单层；前切面用 depthWrite=false 并设 renderOrder 有序；温跃层高亮 line renderOrder 高于水层；控制半透明重叠不超过 2 层。若 WebGL blending 失真，切换为前切面不透明双色材质+黄色曲线，保留物理含义。

### 5.4 单帧流程与性能
- 初始化顺序：DOMContentLoaded → UI 同步可读 → 加载 Three 静态模块 → 探测 WebGL2 → 创建渲染器 → 创建所有几何/材质与场景 → 首次 render → 切换 C08 ready → 运行按需 RAF。
- resize：ResizeObserver 只在 canvas 容器 CSS 宽/高实际变化时更新 renderer.setSize(w,h,false)、camera.aspect、camera.updateProjectionMatrix；w/h 0 或 NaN 则跳过；window.devicePixelRatio clamp [1,1.75]，若小屏且性能下降至 <30 FPS 则降为 1.0。
- 尺寸预算：可见三角形 <25k，绘制调用 <70，粒子/箭头 <50 组，主包 build 后 gzip JS 目标 <250KB（若 three 打包实际超过则以 ≤450KB 作为容错并记报告），CSS gzip <20KB；首屏 2.5 秒（离线本机浏览器实测）；稳定交互目标桌面 ≥55FPS、中档手机 ≥30FPS（无真机只可声明模拟宽度未验证实际手机）。避免复杂阴影贴图、后处理和超高细分的海浪，不用 CDN。
- 无需维持 60 FPS 的纯静帧：motionPaused=true、document.hidden 或 prefers-reduced-motion 时停连续 RAF，只在转场/相机有输入/重置/Resize 时申请一帧；OrbitControls damping 若开启仍需衰减至静止，然后停止。每帧对象分配尽量为 0；更新 BufferAttribute 标 needsUpdate，不每帧 new BufferGeometry。
- 操作开始同步设 state 并 render DOM；canvas tween 可延后一帧但不得超过 100ms 用户无反馈。reduced motion 时 transitionTo 立刻设终态并 render 一帧。
- 生命周期：WebGL context lost 事件 preventDefault、stop RAF/通知 UI；context restored 后完整安全重建 geometry/material，旧对象 dispose，观察器/事件只绑一次；连续两次失败保持纯 HTML fallback，不无限 retry。
- 页面没有数据表和长列表（只有 3 幕、4 卡、≤5 来源），分页与虚拟化不适用。
- 非法 chapterId→normal；无 document/WebGL→完整 HTML；无法联网→外链失败但主体离线使用；频繁点击→“最新目标胜出”可中断插值且保持连续；多触控→OrbitControls 默认；键盘操作→原生按钮；200% 文字缩放→容器自然换行；屏幕宽度不足→按钮垂直叠放；颜色不可辨→文字/线型双编码。

### 5.5 禁止事项
禁止视频/静图冒充 3D、用真实数字标注模型示意、展示具体 2026 预测、把 ENSO 视为单独风暴/必然洪灾、信风在典型厄尔尼诺下永远反向、依赖 Google 字体在线加载、使用 emoji 为正式图标、CSS 裸 hex、用 CSS top/left 动画进行叙事、canvas 强撑 width 导致布局抖动、在 RAF 中反复 new geometry、无 aria 按钮、交互只能拖动不可键盘、console.log 错误堆栈面向用户、绕开 Vite CLI 参数、删除失败证据后报 PASS。

## 6. 任务拆解（严格依赖顺序；每项七要素俱全）

**T01 工程骨架（依赖：无；对应 A1/E、C01）**
- 前置条件：读取本规划；Node/npm 与简报约束成立。
- 操作步骤：根目录创建 package.json/scripts、index.html、src/main.js、README.md 空骨架；非交互安装 npm i three、npm i -D vite；npm 版本写 lock；dev 仅为 vite、不硬编码 host/port；设置 zh-CN 和 noscript；从零建 src 目录。
- 相关位置：package.json scripts、index.html head/#app、src/main.js bootstrap。
- 产物：可启动 Vite 的空白排版框架及锁文件。
- 自查：npm run dev -- --host 127.0.0.1 --port 7100 --strictPort，浏览器有中文标题；检查 npm ls three vite。
- 测试：curl -I http://127.0.0.1:7100/ 得 200；npm run build 为 0。
- 完成条件：两命令均成功，参数透传有效、无脚手架互动提问。

**T02 设计令牌与基础 DOM（依赖 T01；对应 A1–A5/E、C01/C02/C06/C07/C10）**
- 前置条件：Vite 能加载 CSS 与 ES Module。
- 操作步骤：创建 tokens.css 唯一令牌表与 app.css reset/grid/typography；实现 src/ui/icons.js 单套 SVG；dom.js 渲染 header、nav、figure 容器、aside、impact、footer；所有 HTML 文案和占位都设确定尺寸。
- 相关位置：src/styles/tokens.css :root；src/styles/app.css layout；src/ui/dom.js mountUI；src/ui/icons.js。
- 产物：稳定双栏版式、三步导航外观、图例/影响卡/来源结构。
- 自查：无默认 h1/button、页面 max1200 居中，HEX 只存在 tokens.css 和场景主题映射源值，标题行长符合规格。
- 测试：npm run build；浏览器 1440 截图；检查主文本/边框使用 CSS tokens。
- 完成条件：完成令牌/字阶/栅格/圆角/阴影/焦点/图标的统一实现，无视觉占位灰框。

**T03 科学文案与纯状态机（依赖 T02；对应 B3/B4/E、C02/C07/C09/C10）**
- 前置条件：DOM 模板可展示文本。
- 操作步骤：实现 chapters.js 的三幕全文、影响四卡、NOAA/NASA/中国来源和免责声明；实现 state.js 三 ID、previous/next/setChapter，主界面文案绑定 chapterId。
- 相关位置：src/content/chapters.js CHAPTERS/IMPACT_CARDS/SOURCES；src/core/state.js；src/ui/dom.js render。
- 产物：不用 3D 也能读懂的三步交互网页。
- 自查：反复点 01→02→03→01，标题/文案/卡片内容对应；没有“会必然造成某地洪灾”表述。
- 测试：tests/state.test.js 检查三幕边界及非法 ID；tests/content.test.js 检查每幕正文不空、四卡与 sourceUrl 存在、警示语出现。
- 完成条件：中文叙事完整，三幕可纯键盘切换、程序状态唯一真源。

**T04 科学曲线与测试（依赖 T03；对应 E/AC03/AC04、C04/C06）**
- 前置条件：stage ID 和字段定义稳定。
- 操作步骤：创建 physics.js 的 clamp/sampleThermocline/sampleSurfaceWarmth/samplePhysics；定义 West/East 物理方向常量；所有公式中值做范围限制；为每个曲线采样 0、.25、.5、.75、1 做数值测试。
- 相关位置：src/core/physics.js sampleThermocline、sampleSurfaceWarmth、samplePhysics；tests/physics.test.js。
- 产物：无需 WebGL 的可检测因果模型。
- 自查：normal 西深东浅，nino 东部更深且坡度较缓；nino 东部 warmer；风与上升流更弱；雨带位置向右移动。
- 测试：npm test；测试所有 sampled 值 finite/clamped，western d 1.70→1.15，eastern d .45→1.03，斜率幅度 1.25→.12，非法输入不崩。
- 完成条件：纯逻辑测试全通过，不能用反向温跃层作弊追求视觉。

**T05 3D 静态海盆与照相机（依赖 T02/T04；对应 A5/D/E、C04）**
- 前置条件：theme tokens 可读、physics 函数可调用。
- 操作步骤：createScene.js 初始化 renderer/scene/camera/OrbitControls/ResizeObserver；geometry.js 创建半透明海盆、表面顶点颜色、双端地理侧标、海下分界与固定剖面，setPhysicalState(normal) 首次绘制；失败为 fallback。
- 相关位置：src/scene/createScene.js mountScene/resize/destroy；src/scene/geometry.js createOceanSystem/update/dispose；src/scene/theme.js。
- 产物：可真实拖动/缩放且默认西暖东冷、西深东浅的 3D 剖面。
- 自查：手动旋转视差变化、物体厚度/温跃层可见；页面与 caption 左西右东一致。
- 测试：本机 dev 浏览器三维帧检查；故意阻止 WebGL 看 C04 文本 fallback；npm run build。
- 完成条件：没有 canvas 白屏，WebGL 与 fallback 都有解释内容，可重置相机。

**T06 风、沃克环流、上升流、雨带（依赖 T05；对应 A5/AC03、C04/C06）**
- 前置条件：坐标与主 scene update API 固定。
- 操作步骤：在 geometry.js 建 12 个向西箭头、循环四个上升/回流/下沉路径、东岸两条向上虚线、雨带粒子；为每种线型添加一致图例；把长度/透明度/速度连接到 samplePhysics。
- 相关位置：src/scene/geometry.js createWind/createWalker/createUpwelling/createRain、update；src/ui/dom.js legend。
- 产物：NORMAL 完整海气系统，不把图层变成无法判读的装饰。
- 自查：信风始终指左，顶部空气回流指右，水下冷流东端向上；切换初步状态可改变强弱和雨带中心。
- 测试：tests/physics.test.js 方向与强弱断言；手动镜头±.58 弧度确认无遮挡和不反向。
- 完成条件：四类流体语义一眼识别且与图例一致，截图记录。

**T07 时间轴切换与高亮联动（依赖 T03/T04/T06；对应 B1/B2/B3/D、C02/C03/C04/C07/C09）**
- 前置条件：scene.setPhysicalState 可接受连续浮点量。
- 操作步骤：实现 animation.js 单 RAF 和可中断双通道 tween；main.js 连接 C02/C03；normal→el-nino 1000ms，el-nino→impact 700ms；DOM 立即切换，第三幕显示因果/雨带高亮并展开影响卡；切换完成 C08 polite 告知。
- 相关位置：src/scene/animation.js transitionTo；src/main.js onSelect；src/ui/dom.js render。
- 产物：三个步骤与 3D/文案精确联动，点击多次也不跳帧。
- 自查：快速 1→2→3→1 十次无错，最后物理形态回第一幕，影响提示关闭，镜头不重置。
- 测试：state.test.js 目标值映射；浏览器记录每次 100ms 内 DOM 变化和过渡中 3D 连续性。
- 完成条件：阶段联动四要素都变（风/海温/温跃层/雨区）；impact 态额外 3D 高亮，不只是换卡片。

**T08 四态、失败与边界（依赖 T07；对应 B1/B2/B4/D、C04/C05/C08）**
- 前置条件：基本机制可播放。
- 操作步骤：UI 加载/成功/空/错误状态、scene context lost/restored 事件、>1s 状态说明、>10s 取消按钮与纯文字模式；重试与双重错误 fallback；处理隐藏页 RAF、快速点击 tween、非法输入。
- 相关位置：src/main.js bootstrap/Error handling；src/scene/createScene.js onContextLost；src/ui/dom.js setBusy。
- 产物：失败时仍可学习的降级体验，不无限转圈。
- 自查：DevTools 模拟 WebGL context lost、关 WebGL，证实三幕可读；快速重试不叠 DOM/动画。
- 测试：state.test.js 错误状态和重试幂等测试；人工检查每种明确错误文案与按钮。
- 完成条件：无等待黑洞，无用户可见堆栈，无重复 RAF/监听，存在可操作重试。

**T09 响应式、键盘和减弱动效（依赖 T08；对应 A1–A5/B1/B5/C/D、C01–C10）**
- 前置条件：所有组件及状态齐备。
- 操作步骤：app.css 实施全部 5 个断点、移动等宽/纵向按钮、自然换行、min-height 舞台、focus-visible；JS detect matchMedia reduced motion/变化监听；给 canvas srSummary、figure caption、nav aria-label 和 live region；重置和暂停可键盘调用。
- 相关位置：src/styles/app.css @media；src/ui/dom.js aria；src/main.js media query；src/scene/animation.js motion mode。
- 产物：375/390/768/1024/1440 下布局与可访问操作一致。
- 自查：完全不摸鼠标，用 Tab Enter Space 完成三幕/重置/暂停；200% 字体不重叠；reduced motion 没粒子连续移动。
- 测试：每尺寸截图、键盘录屏或逐步记录；对比度工具检测四种色对与焦点，全部达要求。
- 完成条件：无横向溢出、可读/可点、>=44px，焦点可见且不被裁断。

**T10 性能、视觉校准与测试修整（依赖 T09；对应 A–G/D/E、全部组件）**
- 前置条件：完整业务流程及边界可操作。
- 操作步骤：用 Performance 面板观察 drawCalls/三角面/FPS/JS 堆分配；小屏 DPR cap；必要时缩减粒子与网格；查色板核验；逐条执行设计质量线 A–G 并标记证据；运行 npm test 与 npm run build。
- 相关位置：src/scene/createScene.js DPR/RAF；src/scene/geometry.js 网格细分；src/styles/*；tests/*。
- 产物：达预算的稳定 build、完整回归测试、截图集与质量线对照表。
- 自查：用 browser Performance/Lighthouse 或等价工具，记录实际设备/CPU/是否受工具影响，不伪造性能结果。
- 测试：npm test、npm run build、npm run dev -- --host 127.0.0.1 --port 7100 --strictPort，运行核心完整路径、无控制台异常。
- 完成条件：AC01–AC10 全满足；性能超标需修复或依 §8 标“不通过”，不得偷偷放宽门槛。

**T11 文档与闭环交付（依赖 T10；对应 E/F/G、全部组件）**
- 前置条件：实际测试与截图完成。
- 操作步骤：README.md 写明安装/开发/宿主端口/构建/故障降级/物理非定量说明/来源；reports/latest.md 按 §9 写完整证据和不适用项；截图存 reports/evidence/；移除死 TODO、清理控制台 debug。
- 相关位置：README.md；reports/latest.md；reports/evidence/；package.json。
- 产物：可复现项目根目录与真实执行报告。
- 自查：按 README 在全新终端从 npm install 开始重放；核对所有截图与本轮源码 SHA。
- 测试：最终运行 npm test、npm run build 和完整浏览器走查，把 stdout/stderr 原文保存在报告。
- 完成条件：首次交付全部产物在仓库，报告包含真实通过数/失败数/未验证数，无“待后续问用户”事项。

## 7. 未知信息的调查入口与确定性分支

### 7.0 未知索引
| ID | 类型 | 不确定事实 |
|---|---|---|
| U01 | 有入口 | 执行时 npm 公开 three/vite 版本与 Node24 兼容性 |
| U02 | 有入口 | OrbitControls import 与 BufferGeometry API 是否随安装版本变化 |
| U03 | 有入口 | Vite --host/--port 参数与 no-TTY 下启动细节 |
| U04 | 有入口 | ENSO 中文机制和中国影响措辞是否仍符合气象机构表述 |
| U05 | 无入口 | 本机目标浏览器 WebGL2 是否可用、context restore 能否复现 |
| U06 | 无入口 | 本机是否含首选中文字体以及字宽是否导致局部换行 |
| U07 | 无入口 | 本机实际运行速度、帧率与首屏时延能否达 D 指标 |
| U08 | 无入口 | Kimi Work 宿主反向映射后的真实预览地址是否与逻辑 localhost:7100 不同 |

### 7.1 有真实入口的项目
**U01** 问题：当前 npm 包 API/engine 是否满足 Node 24。入口：npm view three version；npm view vite version engines；https://www.npmjs.com/package/three；https://www.npmjs.com/package/vite 。判据：命令返回非空 semver 与 engines Node 范围包含 v24.21.0。分支：若兼容，npm i three && npm i -D vite、提交 lock；若不兼容，npm view vite versions --json 选最后一个明确包含 Node24 的稳定版本，锁定并在报告写版本。上限：10 分钟；若 npm registry 无法访问，检视本地 npm cache，不能安装且无已缓存可用包则标阻塞，不允许引入 CDN 假装完成。

**U02** 问题：three 当前插件与顶点 buffer 的精确导入是否匹配。入口：https://threejs.org/docs/pages/OrbitControls 、https://threejs.org/docs/pages/BufferGeometry.html 、node_modules/three/package.json。判据：node -e "import('three/addons/controls/OrbitControls.js').then(x=>console.log(!!x.OrbitControls))" 输出 true，构建通过。分支：true 用文档路径；否则按安装版本包内 addons/controls 实际导出调整 import（不使用不明 CDN），确认 BufferGeometry.setAttribute 函数存在。上限 10 分钟；默认使用文档所列 addons 路径。

**U03** 问题：CLI 端口/host 参数是否原样透传。入口：https://vite.dev/guide/cli、npm run dev -- --host 127.0.0.1 --port 7100 --strictPort。判据：终端输出 http://127.0.0.1:7100/ 且 curl 得 200。分支：成功保留 dev=vite；若参数异常检查 package.json 的 dev script 是否吞参数，把脚本恢复为纯 vite 后重试。上限 5 分钟；默认纯 vite。

**U04** 问题：中国冬季“暖冬”表述的确定性是否过高。入口：https://www.noaa.gov/understanding-el-nino、https://www.noaa.gov/jetstream/tropical/enso/enso-patterns、中国气象专家解读 https://www.szlhq.gov.cn/gkmlpt/content/12/12971/post_12971044.html。判据：官方使用“典型”“易”“概率”“总体”且强调地区/季节差异。分支：一致则写“某些成熟期冬季偏暖概率上升，寒潮仍会出现”；若公开解读不再支持该倾向，则缩成“ENSO 会改变中国部分季节的气候概率，具体影响受其他环流共同作用”。上限 10 分钟；默认使用谨慎表述且不可放“今年必暖”。

### 7.2 无公开预知入口；本机调查 + 影响决策 + 默认
**U05** 待查：本机预览浏览器是否支持 WebGL2，模拟 context lost/restored 是否可恢复。怎么查：实际浏览器加载、DevTools console 查看 getContext('webgl2')，使用 WEBGL_lose_context 扩展手动触发；无需向用户追问。受影响决策：3D 是否显示及 retry 次数。若支持则 3D；不支持则 C04 全文字 fallback；若 restore 两次失败不再自动 retry。默认：纯文字降级可完成全部学习；报告写“U05 用默认 fallback/或实测通过”。

**U06** 待查：本机是否安装 PingFang SC/Noto Sans CJK SC 等字体，200% 缩放是否破版。怎么查：document.fonts.check、浏览器 computed font、375/390/1440 与 zoom=200% 实测。受影响决策：首选字体链与标题换行。若 PingFang 可用按首选；否则按栈的 Noto/Microsoft YaHei/Source Han Sans SC 命中；全缺仍落最后 sans-serif，报告标退化并保证字高。默认：给定字体栈、标题两行自然换行，不下载远程字体。

**U07** 待查：实际首屏耗时和 3D 帧率是否满足 2.5 秒、55/30FPS 目标。怎么查：开发浏览器 Performance、performance.mark、renderer.info.render，连续 10 秒记录稳定帧；本机有浏览器自动化则同时抓 performance entries。受影响决策：DPR（1.75/1.0）、几何细分（128×32/64×16）、雨点数量（32/12）。若达标用高档；若掉到 <30FPS 先 DPR=1、再减格网到64×16、最后粒子12；若仍失败保持文本 fallback 作为可学习保障、性能 AC 标失败不得判可交付。默认：DPR1、小网格64×16、粒子12 的保守质量级并写“U07 使用默认值”；不虚报手机真机成绩。

**U08** 待查：宿主真实转发 URL 与逻辑端口是否一致。怎么查：本机启动后读取宿主展示的预览入口/代理日志（仅本机运行信息，不读取仓库其他源文件），curl localhost:7100；受影响决策：用户交付 URL 与 host 参数。若宿主重映射，则以宿主展示链接为最终入口但 dev CLI 仍可监听 7100；若无重映射，默认本地 http://localhost:7100/；若出现端口占用，按宿主要求通过 --port 参数选择另一端口，README 明写。默认：localhost:7100 逻辑端口；不写 file://。

收尾自检：8 个未知都映射到可测试决策，4 个有真实文档/命令入口，4 个明确说明本机调查与兜底；没有让执行方自行决定设计方向。任何未查明项在 reports/latest.md “未知项调查结果”说明默认值被采用。

## 8. 验收要求：真实命令、核心流程、回归和视觉

### 8.1 必须真实运行并保存完整输出
1. node --version（预期 v24.21.0；不同版本记录并检查 engines，不自行假称一致）。
2. npm --version（预期 11.12.1）。
3. npm install（退出 0，产生 package-lock.json；严禁只写“应该成功”）。
4. npm test（退出 0；测试数量/失败数由 Node 测试汇总行读取，禁止手填预期数）。
5. npm run build（退出 0、dist/index.html 存在，静态文件无 CDN 依赖）。
6. npm run dev -- --host 127.0.0.1 --port 7100 --strictPort（进程保持运行；命令行可见地址）。
7. curl -I http://127.0.0.1:7100/（HTTP 200）。
8. 可追加 npm run dev -- --host 0.0.0.0 --port 7100 --strictPort 在未占用时校验 host 真透传，关闭后恢复本机默认；不要同时占用同一个端口。

### 8.2 浏览器必须实际操作并取证
- 正常第一次打开：确认标题/画布/图例同时可读、首屏不是动画占位；浏览器控制台未处理错误数 0。
- 三幕：1→2→3，场景风力/温跃层/颜色/雨带改变；第三幕影响四卡展开；3→1 回滚；动作快速连点十次且最后状态正确。
- 拖动 3D、滚轮/触控双指缩放、重置；从最大最小相机边界不能绕到标签方向相反；三维剖体必须随拖动改变透视。
- 模拟浏览器不支持 WebGL；WebGL context lost；分别截图空/加载/错误/成功/降级，以及使用文字路径完成三幕。
- 375、390、768、1024、1440px 逐个真实设定 CSS 视口截图；375 与 1440 是不能省的必检；200% 字体缩放验证页面 scrollWidth ≤ clientWidth。
- 完整键盘：Tab 到 01，Enter/Space 选 02，Tab 到“下一步”选 03，Tab 到重置并 Space 执行，Tab 到暂停执行，再 Tab 到来源并回车；Shift+Tab 逆走；无焦点陷阱；Esc 没有弹窗时不更改阶段。
- reduced motion：在 DevTools emulate prefers-reduced-motion:reduce，验证阶段状态即时变更、粒子停止、无长 tween。
- 科学审核：文字与画面中西方向一致，东部温跃层确实加深、信风确实减弱、雨带向东、不把 SST 色条写 ℃ 或假数据；查看“中国暖冬概率”边界措辞。

### 8.3 可自动回归检查
- R01 state 三态次序、最后/第一步禁用，非法 id 不改状态。
- R02 physics 温跃层 u=0 与 u=1 的端点、曲线斜率变小、海温 east warming、tradeStrength 下降且 >0。
- R03 chapter 文案每幕正文字数>0、impact 卡数=4、至少 NOAA/NASA 来源可匹配、含“概率/可能/不是必然”。
- R04 tween 快速打断：手动测试连续状态起点无跳变；若提取 pure tween 函数则加 Node 单测。
- R05 context lost → fallback → retry，不重复 event listener。
- R06 1440/375 改宽后 3D canvas 实像素与 aspect 正确、无水平溢出。
- R07 npm run dev 的 host/port 参数不因脚本改动退化。

### 8.4 A–G 质量线逐条签署（全部硬约束）
| 质量线 | 必须亲眼/工具证明的内容 |
|---|---|
| A1 | 指定中西文字体栈；≥6 字阶；正文 ≤40 中文字/行；行高、数字等宽、混排无破版 |
| A2 | 主/次/边框/禁用态至少各抽一对报告对比度（例：#C6DCE7 on #0D2335≈11.3:1，#6D90A6 on #1A3950≈3.55:1），颜色与线型双编码 |
| A3 | 4px 栅格、主容器居中限宽、层级间距分组正确 |
| A4 | 圆角/阴影/层级同类一致，焦点未被卡片 overflow 裁切 |
| A5 | 一套 SVG 图标、所有图像 alt/尺寸，canvas 对照 figcaption，CLS ≤.1 |
| B1–B4 | C01–C10 四态、操作反馈 <100ms、进度/错误可处理、按钮文案明确、阶段可辨 |
| B5 | 375/390/768/1024/1440，无水平滚动、每个移动 hitbox≥44×44 |
| C | 全键盘、aria-live、可见焦点、200% 放大、低动态 |
| D | 页面首屏≤2.5s、FPS 与性能预算、自适应 DPR、无布局动画（只 transform/opacity） |
| E | token 唯一真源、无散落 magic HEX/z-index、代码职责一致、无死 TODO |
| F | 报告明确“每项怎么测、看到了什么”，不只写“已检查” |
| G | 任一默认按钮/emoji/移动破版/缺失焦点/布局动画/无失败恢复=不合格 |

判断：上述任一硬性门槛不通过，结论必须 NEEDS_IMPROVEMENT；若环境缺少可测试浏览器，则对浏览器项标 NOT_TESTED、结论 EVIDENCE_INSUFFICIENT，而不能写 READY_FOR_DELIVERY。只有全部 AC、A–G 适用项 PASS，并有真实测试/截图支持才写 READY_FOR_DELIVERY。不适用 N/A 必须说明结构上为何不存在。

## 9. 首次交付要提交的产物

### 9.1 交付目录核对
- 根目录：index.html、package.json、package-lock.json、README.md。
- src：main.js、content/chapters.js、core/state.js、core/physics.js、scene/createScene.js、scene/geometry.js、scene/animation.js、scene/theme.js、ui/dom.js、ui/icons.js、styles/tokens.css、styles/app.css。
- tests：state.test.js、physics.test.js、content.test.js（允许额外测试，但不可省纯逻辑测试）。
- reports/latest.md、reports/evidence/desktop-1440.png、mobile-390.png、mobile-375.png、state-normal.png、state-el-nino.png、state-impact.png、loading.png、fallback.png、error.png、focus.png；若截图不可能生成，报告必须标没有并判证据不足，不可写伪占位图。
- 不提交 node_modules/、dist/、临时录屏/含机器隐私路径；提供 .gitignore 并确认依赖可从 lock 文件安装。

### 9.2 reports/latest.md 必含逐项章节
(1) 任务与被测源码 SHA、测试环境（OS/Node/npm/browser 版本与设备类型）；(2) 实现摘要与逐文件变更清单；(3) AC01–AC10 对照事实/证据链接/PASS-FAIL-NOT_TESTED；(4) npm 命令及原始退出码/完整 stdout-stderr、测试通过/失败/跳过数直接来自唯一真实运行输出；(5) 使用浏览器复现步骤和实际截图路径、各截图对应浏览器宽高；(6) 科学一致性检查清单与引用页面；(7) 设计质量线 A1–G 的一行一项证据/不适用原因；(8) 性能指标及采样方法、DPR/FPS/资源预算，无法测标 NOT_TESTED；(9) U01–U08 每条调查结果、执行过的命令/来源、取值/默认值；(10) 已知限制（示意不定量、非天气预报、不连真实数据、未测真机等）；(11) 判定 READY_FOR_DELIVERY / NEEDS_IMPROVEMENT / EVIDENCE_INSUFFICIENT 与原因。

### 9.3 证据保真与首次完成
所有截图必须来自实际跑起的该项目和浏览器，保留原尺寸，不用效果图冒充实测。原始测试输出复制自终端，不编造“x tests passed”。用户真正打开的项目是本机根目录 npm run dev，不把 dist、file://、私有临时工作目录链接当交付入口。首次交付给本机执行方留下可独立使用的 README、可查原因的报告和科学来源；只有 READY_FOR_DELIVERY 才被当作终点信号。

## 10. 执行 Agent 遇困时的自主处置规则

1. **零提问**：收到本计划后不联系用户、不回头请求网页版 ChatGPT 审核或补充，不引入额外决策角色；执行者在本机依本计划独立完成实现、测试、提交。
2. **冲突优先级**：实际可运行/科学准确/用户简报硬约束 > design-quality-bar A–G > 本计划接口细节 > 个别装饰；如官方 Three.js 当前 API 与本文不同，以本机真实安装版本能运行的实现为准，保持物理与交互语义。
3. **未知项先查后选**：只按 §7 指定入口与限时调查；结果属于 A 分支则用 A，否则用 B/默认值。没有公开入口的优先用本机自证，不因某一项未能证明而发明数据。用保守默认须在报告精确记录 U ID、默认取值与受影响结论。
4. **新增问题也能闭环**：若本计划未覆盖，按同类组件令牌 C/S、公认科学来源和 A–G 质量线自行给出唯一实现，再在报告的“偏离规划”注明条目、触发事实、替代策略、验证证据；不要空留“后续再决定”。
5. **性能降级顺序写死**：DPR 1.75→1→网格64×16→粒子12→保留完整文字 fallback；禁止删掉温跃层或方向标签以换性能。动画降级不能损害科学信息。
6. **端口或预览异常**：首先核对 Vite CLI、宿主传入 host/port 与端口占用；不改成 file://、不使用静态截图或外链替代。修复后从 AC01 完整回归。
7. **失败如实报告**：缺少浏览器/截图或无法完成任何硬验收时，报告判 NEEDS_IMPROVEMENT 或 EVIDENCE_INSUFFICIENT；严禁以“看起来正常”给 PASS。不要声称自动化测了没有实际运行的操作。
8. **交付准则**：所有强制项 PASS → commit/push 产品与报告并写 READY_FOR_DELIVERY；任何未达项先在本机修复再复测；确实无法修复则明确失败、限制、复现步骤与下一动作，不冒充完成。

---

**最终审稿清单**：十节齐全；明确了 5 个真正检索到的标杆、设计规范及科学来源；固定三幕文案/曲线参数/方向/镜头/配色/字阶/布局/组件/异常路径/测试/报告；T01–T11 每项含依赖、前置、步骤、路径、产物、自查、测试、完成条件；U01–U08 两类都闭环；不引入真实数据、用户追问或假测量。本文件开头五行指纹为唯一交接依据。