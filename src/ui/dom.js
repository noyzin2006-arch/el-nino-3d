/* DOM 装配与渲染。只更新 textContent/attributes/class；可信静态 SVG 由 icons.js 注入。 */
import { CHAPTERS, IMPACT_CARDS, SOURCES } from '../content/chapters.js';
import { icon } from './icons.js';
import { previousChapter, nextChapter, getChapterIndex } from '../core/state.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(className, label, html) {
  const b = el('button', className);
  b.type = 'button';
  if (html) b.innerHTML = `${html}<span>${label}</span>`;
  else b.textContent = label;
  return b;
}

export function mountUI(root, callbacks) {
  const { onSelect, onPrevious, onNext, onResetCamera, onToggleFlow, onRetry, onUseText } =
    callbacks;

  const page = el('div', 'page');

  /* C01 头部 */
  const header = el('header', 'site-header');
  const brand = el('p', 'brand');
  brand.innerHTML = `${icon('Waves')}<span>海洋与气候</span>`;
  const h1 = el('h1', '', '厄尔尼诺，从海面到全球');
  const lead = el(
    'p',
    'lead',
    '如果信风变弱，海洋和天空会怎样？拖动三维剖面，用三次点击看清赤道太平洋的海气耦合。',
  );
  header.append(brand, h1, lead);

  /* C02 步骤选择器 */
  const nav = el('nav', 'step-nav');
  nav.setAttribute('aria-label', '厄尔尼诺演示阶段');
  const stepButtons = new Map();
  for (const chapter of CHAPTERS) {
    const b = el('button', 'step-button');
    b.type = 'button';
    b.dataset.chapterId = chapter.id;
    b.setAttribute('aria-label', `第 ${chapter.number} 幕：${chapter.title}`);
    const num = el('span', 'step-number', `${chapter.number} / 03`);
    const title = el('span', 'step-title', chapter.title);
    b.append(num, title);
    b.addEventListener('click', () => onSelect(chapter.id));
    stepButtons.set(chapter.id, b);
    nav.append(b);
  }

  /* C08 状态横幅 */
  const banner = el('div', 'status-banner');
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  const bannerIcon = el('span', 'banner-icon');
  const bannerText = el('span', 'banner-text');
  banner.append(bannerIcon, bannerText);

  function setBanner(kind, text, action) {
    banner.className = 'status-banner';
    banner.hidden = !text;
    if (!text) return;
    if (kind === 'error') banner.classList.add('status-banner--error');
    if (kind === 'success') banner.classList.add('status-banner--success');
    bannerIcon.innerHTML = kind === 'error' ? icon('AlertCircle') : icon('Info');
    bannerText.textContent = text;
    const old = banner.querySelector('.banner-action');
    if (old) old.remove();
    if (action) {
      const b = button('banner-action', action.label);
      b.addEventListener('click', action.onClick);
      banner.append(b);
    }
  }

  /* C04 3D 舞台 */
  const figure = el('figure', 'stage-figure');
  const frame = el('div', 'canvas-frame');
  const canvas = el('canvas');
  canvas.setAttribute('role', 'img');
  canvas.id = 'scene-canvas';
  const labelWest = el('span', 'geo-label geo-label--west', '← 印度尼西亚附近（西太平洋）');
  const labelEast = el('span', 'geo-label geo-label--east', '南美洲沿岸（东太平洋）→');
  const axisCaption = el('span', 'axis-caption', '西太平洋 ←　赤道太平洋剖面　→ 东太平洋');
  const hint = el('span', 'stage-hint', '可拖动旋转，滚轮 / 双指缩放');

  const loading = el('div', 'stage-loading');
  loading.setAttribute('role', 'status');
  loading.innerHTML = `<span>正在建立三维海洋剖面…</span>`;

  const overlay = el('div', 'stage-overlay');
  overlay.hidden = true;
  const overlayInner = el('div', 'overlay-inner');
  const overlayText = el('p');
  overlayInner.append(overlayText);
  overlay.append(overlayInner);

  frame.append(canvas, labelWest, labelEast, axisCaption, hint, loading, overlay);
  const figcaption = el('figcaption', 'visually-hidden');
  figure.append(frame, figcaption);

  /* C05 视角工具 */
  const tools = el('div', 'stage-tools');
  tools.setAttribute('role', 'group');
  tools.setAttribute('aria-label', '三维视角工具');
  const resetButton = button('tool-button tool-button--primary', '重置视角', icon('RotateCcw'));
  resetButton.addEventListener('click', () => onResetCamera());
  const pauseButton = button('tool-button', '暂停流动', icon('Pause'));
  pauseButton.setAttribute('aria-pressed', 'false');
  pauseButton.addEventListener('click', () => onToggleFlow());
  tools.append(resetButton, pauseButton);

  /* C06 物理图例 */
  const legend = el('div', 'legend');
  legend.setAttribute('aria-label', '物理量图例');
  const legendItems = [
    { iconName: 'Waves', colorVar: '--c-ocean-warm', label: '相对暖 / 冷海水（颜色 + 文字双编码）' },
    { iconName: 'Info', colorVar: '--c-thermocline', label: '温跃层：暖水与冷水的快速过渡界面' },
    { iconName: 'ChevronLeft', colorVar: '--c-wind', label: '信风：低空稳定向西（实箭头）' },
    { iconName: 'ChevronRight', colorVar: '--c-wind', label: '沃克环流：高空向东回流（点线）' },
    { iconName: 'Info', colorVar: '--c-rain', label: '上升流：东部冷海水向上（蓝色虚线）' },
    { iconName: 'Info', colorVar: '--c-rain', label: '雨带：对流降雨区（位置随阶段移动）' },
  ];
  for (const item of legendItems) {
    const div = el('div', 'legend-item');
    div.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="var(${item.colorVar})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon(item.iconName).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;
    div.append(el('span', '', item.label));
    legend.append(div);
  }
  const modelNote = el(
    'p',
    'model-note',
    '概念模型｜纵向夸张｜海表颜色为相对暖冷示意（不是温度实测）｜阶段非等间隔时间。',
  );

  const stageColumn = el('div', 'stage-column');
  stageColumn.append(figure, tools, legend, modelNote);

  /* C07 解释主卡 */
  const card = el('article', 'chapter-card');
  card.setAttribute('aria-labelledby', 'chapter-title');
  const chapterIndexEl = el('p', 'chapter-index');
  const chapterTitle = el('h2');
  chapterTitle.id = 'chapter-title';
  const chapterBody = el('div', 'chapter-body');
  const factsList = el('ul', 'chapter-facts');
  const chapterNote = el(
    'p',
    'chapter-note',
    '信风有时会短暂反转，但不是每次都发生；本示意只表现典型减弱。厄尔尼诺改变的是区域天气概率，不决定某天是否下雨。',
  );
  card.append(chapterIndexEl, chapterTitle, chapterBody, factsList, chapterNote);

  /* C03 步进控制 */
  const stepControls = el('div', 'step-controls');
  const prevButton = button('nav-button', '上一步', icon('ChevronLeft'));
  prevButton.addEventListener('click', () => onPrevious());
  const nextButton = button('nav-button', '下一步', icon('ChevronRight'));
  nextButton.addEventListener('click', onNext);
  nextButton.innerHTML = `<span>下一步</span>${icon('ChevronRight')}`;
  stepControls.append(prevButton, nextButton);

  const narrativeColumn = el('div', 'narrative-column');
  narrativeColumn.append(card, stepControls, banner);

  const mainGrid = el('div', 'main-grid');
  mainGrid.append(stageColumn, narrativeColumn);

  /* C09 影响卡组 */
  const impactSection = el('section', 'impact-section');
  impactSection.setAttribute('aria-labelledby', 'impact-heading');
  impactSection.dataset.active = 'false';
  const impactH2 = el('h2', '', '影响不是预言');
  impactH2.id = 'impact-heading';
  const impactLead = el(
    'p',
    'impact-lead',
    '厄尔尼诺通过大气环流把海洋信号传到远方。以下是四类典型影响——它们是概率倾向，不是必然结果，也不在全球同步发生。',
  );
  const impactGrid = el('div', 'impact-grid');
  const impactCardEls = [];
  for (const card of IMPACT_CARDS) {
    const div = el('div', 'impact-card');
    div.dataset.cardId = card.id;
    div.append(el('h3', '', card.headline));
    const region = el('p', 'impact-source', `地区：${card.region}`);
    const detail = el('p', 'impact-detail', card.detail);
    const caveat = el('p', 'impact-caveat', card.caveat);
    const src = el('p', 'impact-source', `来源：${card.sourceUrl}`);
    div.append(region, detail, caveat, src);
    impactCardEls.push(div);
    impactGrid.append(div);
  }
  impactSection.append(impactH2, impactLead, impactGrid);

  /* C10 科学说明与来源 */
  const footer = el('footer', 'site-footer');
  footer.append(el('h2', '', '为什么这不是天气预报？'));
  footer.append(
    el(
      'p',
      'footer-note',
      '本页是概念示意：箭头速度、温跃层高度和海表颜色均不按实际比例，也不展示任何实时监测数据或未来预测。想查当前 ENSO 状况，请访问 NOAA / NASA 的 official 页面。每一次厄尔尼诺事件的强度、位置和具体影响都不完全相同。',
    ),
  );
  const sourceList = el('ul', 'source-list');
  for (const src of SOURCES) {
    const li = el('li');
    const a = el('a', '', src.label);
    a.href = src.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', `${src.label}（${src.purpose}，新标签页打开）`);
    a.innerHTML = `<span>${src.label}</span>${icon('ExternalLink')}`;
    li.append(a);
    sourceList.append(li);
  }
  footer.append(sourceList);

  page.append(header, nav, mainGrid, impactSection, footer);
  root.append(page);

  /* ------- 渲染 ------- */
  function renderChapter(chapterId) {
    const chapter = CHAPTERS[getChapterIndex(chapterId)];
    chapterIndexEl.textContent = `${chapter.number} / 03`;
    chapterTitle.textContent = chapter.title;
    chapterBody.textContent = '';
    for (const para of chapter.body) {
      chapterBody.append(el('p', '', para));
    }
    factsList.textContent = '';
    for (const fact of chapter.facts) {
      const li = el('li');
      li.append(el('span', 'fact-label', fact.label), el('span', 'fact-value', fact.value));
      factsList.append(li);
    }
    canvas.setAttribute('aria-label', chapter.srSummary);
    figcaption.textContent = chapter.srSummary;
  }

  function render(state) {
    renderChapter(state.chapterId);
    for (const [id, b] of stepButtons) {
      if (id === state.chapterId) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    }
    const isFirst = state.chapterId === CHAPTERS[0].id;
    const isLast = state.chapterId === CHAPTERS[CHAPTERS.length - 1].id;
    prevButton.setAttribute('aria-disabled', String(isFirst));
    prevButton.tabIndex = isFirst ? -1 : 0;
    nextButton.setAttribute('aria-disabled', String(isLast));
    nextButton.tabIndex = isLast ? -1 : 0;
    impactSection.dataset.active = String(state.chapterId === 'impact');

    const paused = state.motionPaused;
    pauseButton.innerHTML = paused
      ? `${icon('Play')}<span>继续流动</span>`
      : `${icon('Pause')}<span>暂停流动</span>`;
    pauseButton.setAttribute('aria-pressed', String(paused));

    const sceneReady = state.sceneStatus === 'ready';
    const sceneBroken = state.sceneStatus === 'fallback' || state.sceneStatus === 'error';
    resetButton.setAttribute('aria-disabled', String(!sceneReady));
    resetButton.tabIndex = sceneReady ? 0 : -1;
    pauseButton.setAttribute('aria-disabled', String(!sceneReady));
    pauseButton.tabIndex = sceneReady ? 0 : -1;

    if (state.sceneStatus === 'loading') {
      loading.hidden = false;
      overlay.hidden = true;
      hint.hidden = true;
    } else if (sceneBroken) {
      loading.hidden = true;
      overlay.hidden = false;
      hint.hidden = true;
      overlayText.textContent =
        state.sceneStatus === 'fallback'
          ? '此浏览器无法绘制三维模型。您仍可通过下面的变量表完成三阶段学习。'
          : '三维绘制被中断。可能是浏览器暂时回收了图形资源。您仍可以继续阅读文字讲解。';
      if (!overlayInner.querySelector('.banner-action')) {
        const retry = button('banner-action', '重试三维绘制');
        retry.addEventListener('click', () => onRetry());
        overlayInner.append(retry);
      }
    } else {
      loading.hidden = true;
      overlay.hidden = true;
      hint.hidden = false;
    }
  }

  function setBusy(isBusy) {
    if (isBusy) setBanner('info', '正在绘制…');
  }

  function setLoadingStage(stage) {
    if (stage === 'slow') {
      loading.innerHTML = `<span>图形模型需要一点时间，文字讲解已可以阅读。</span>`;
    } else if (stage === 'stuck') {
      loading.innerHTML = `<span>图形仍未就绪。继续阅读，或取消绘制并使用文字示意。</span>`;
      const b = button('banner-action', '使用文字示意');
      b.addEventListener('click', () => onUseText());
      loading.append(b);
    }
  }

  function destroy() {
    page.remove();
  }

  return {
    render,
    setBusy,
    setBanner,
    setLoadingStage,
    destroy,
    canvas,
    resetButton,
    pauseButton,
  };
}
