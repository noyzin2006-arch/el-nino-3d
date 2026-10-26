/* 启动与事件接线。状态唯一真源在本文件；UI 读 state，3D 只接收插值 numeric state。 */
import './styles/tokens.css';
import './styles/app.css';
import { mountUI } from './ui/dom.js';
import {
  INITIAL_STATE,
  setChapter,
  previousChapter,
  nextChapter,
  getTargetState,
} from './core/state.js';
import { createAnimator } from './scene/animation.js';

const app = document.getElementById('app');

let state = { ...INITIAL_STATE };
let sceneHandle = null;
let animator = null;
let sceneAttempts = 0;
let statusTimer = null;

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
state = { ...state, reducedMotion: reducedQuery.matches };

function chapterDuration(id) {
  return id === 'impact' ? 700 : 1000;
}

function updateStatusForChapter() {
  const labels = { normal: '正常年份', 'el-nino': '暖水东移', impact: '全球影响' };
  ui.setBanner('success', `已进入第 ${{ normal: '1', 'el-nino': '2', impact: '3' }[state.chapterId]} 幕：${labels[state.chapterId]}。`);
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    ui.setBanner('info', '');
  }, 2000);
}

function applyChapter(id) {
  const next = setChapter(state, id);
  if (next === state) return;
  state = next;
  ui.render(state);
  updateStatusForChapter();
  const target = getTargetState(state.chapterId);
  if (animator) animator.transitionTo(target, chapterDuration(state.chapterId));
}

function applyState(patch) {
  state = { ...state, ...patch };
  ui.render(state);
}

/* ---------- UI ---------- */
const ui = mountUI(app, {
  onSelect: applyChapter,
  onPrevious: () => applyChapter(previousChapter(state.chapterId)),
  onNext: () => applyChapter(nextChapter(state.chapterId)),
  onResetCamera: () => {
    if (sceneHandle && state.sceneStatus === 'ready') {
      sceneHandle.resetCamera({ instant: false });
      ui.setBanner('info', '视角已复原');
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => ui.setBanner('info', ''), 1500);
    }
  },
  onToggleFlow: () => {
    const paused = !state.motionPaused;
    applyState({ motionPaused: paused });
    if (animator) animator.setPaused(paused);
  },
  onRetry: () => {
    // 重建渲染器最稳妥的方式：换一张全新 canvas（全新上下文），再挂载场景
    const oldCanvas = document.getElementById('scene-canvas');
    if (oldCanvas) {
      const fresh = oldCanvas.cloneNode(false);
      oldCanvas.parentElement.replaceChild(fresh, oldCanvas);
      ui.canvas = fresh;
    }
    mountSceneSafely(true);
  },
  onUseText: () => {
    if (animator) animator.setPaused(true);
    applyState({ sceneStatus: 'fallback', motionPaused: true });
  },
});

ui.render(state);

/* 加载阶段提示（>1s / >10s） */
const slowTimer = setTimeout(() => ui.setLoadingStage('slow'), 1000);
const stuckTimer = setTimeout(() => ui.setLoadingStage('stuck'), 10000);

/* ---------- 3D 场景 ---------- */
async function mountSceneSafely(isRetry = false) {
  if (sceneAttempts >= 2 && isRetry) {
    applyState({ sceneStatus: 'fallback', errorCode: 'WEBGL_UNAVAILABLE' });
    return;
  }
  if (isRetry) {
    applyState({ sceneStatus: 'loading', errorCode: null });
    if (sceneHandle) {
      sceneHandle.destroy();
      sceneHandle = null;
    }
  }
  try {
    const { mountScene } = await import('./scene/createScene.js');
    const frame = containerForScene();
    const handle = mountScene(frame, {
      onReady: () => {
        clearTimeout(slowTimer);
        clearTimeout(stuckTimer);
        applyState({ sceneStatus: 'ready', errorCode: null });
      },
      onError: (err) => {
        clearTimeout(slowTimer);
        clearTimeout(stuckTimer);
        window.__lastError = err && err.code ? err.code : 'WEBGL_UNAVAILABLE';
        applyState({
          sceneStatus: 'fallback',
          errorCode: err && err.code ? err.code : 'WEBGL_UNAVAILABLE',
        });
      },
      onContextLost: () => {
        applyState({ sceneStatus: 'error', errorCode: 'CONTEXT_LOST' });
      },
    });
    if (handle) {
      sceneAttempts += 1;
      sceneHandle = handle;
      handle.controls.addEventListener('change', () => animator && animator.notifyControlsActive());
      wireAnimator(handle);
      // 初始帧
      const t = getTargetState(state.chapterId);
      handle.setPhysicalState(t.ocean, t.impact);
    }
  } catch (err) {
    clearTimeout(slowTimer);
    clearTimeout(stuckTimer);
    applyState({
      sceneStatus: 'fallback',
      errorCode: err && err.code ? err.code : 'WEBGL_UNAVAILABLE',
    });
  }
}

function containerForScene() {
  return ui.canvas.parentElement;
}

function wireAnimator(handle) {
  if (animator) animator.dispose();
  animator = createAnimator({
    reducedMotion: state.reducedMotion,
    onFrame: (ocean, impact, elapsed) => {
      handle.renderFrame(ocean, impact, elapsed);
    },
    onSettled: () => {},
  });
  animator.setPaused(state.motionPaused);
  animator.start();
}

/* ---------- 全局事件 ---------- */
document.addEventListener('visibilitychange', () => {
  if (!animator) return;
  if (document.hidden) animator.stop();
  else animator.start();
});

reducedQuery.addEventListener('change', (e) => {
  applyState({ reducedMotion: e.matches });
  if (animator) animator.setReducedMotion(e.matches);
});

mountSceneSafely(false);
