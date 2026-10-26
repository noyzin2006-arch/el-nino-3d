/* 场景生命周期：renderer / camera / OrbitControls / resize / context lost。 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createOceanSystem } from './geometry.js';
import { readTheme } from './theme.js';

const CAMERA_HOME = { position: [0, 7.6, 16.5], target: [0, 0.65, 0] };

export function isWebGL2Available() {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

export function mountScene(container, callbacks) {
  const { onReady, onError, onContextLost } = callbacks;

  if (!isWebGL2Available()) {
    const err = new Error('WebGL2 unavailable');
    err.code = 'WEBGL_UNAVAILABLE';
    onError(err);
    return null;
  }

  const canvas = container.querySelector('canvas');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch (e) {
    e.code = 'WEBGL_UNAVAILABLE';
    onError(e);
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--c-panel').trim() || '#0d2335');

  const camera = new THREE.PerspectiveCamera(38, 16 / 10, 0.1, 100);
  camera.position.set(...CAMERA_HOME.position);

  const theme = readTheme();
  const ocean = createOceanSystem(THREE, theme, { w: 800, h: 600 });
  scene.add(ocean.group);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(...CAMERA_HOME.target);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 10;
  controls.maxDistance = 22;
  controls.minPolarAngle = 0.6;
  controls.maxPolarAngle = 1.32;
  controls.minAzimuthAngle = -0.58;
  controls.maxAzimuthAngle = 0.58;
  controls.update();

  let destroyed = false;
  let contextLost = false;

  canvas.addEventListener(
    'webglcontextlost',
    (e) => {
      e.preventDefault();
      contextLost = true;
      onContextLost();
    },
    false,
  );

  canvas.addEventListener(
    'webglcontextrestored',
    () => {
      contextLost = false;
    },
    false,
  );

  function resize() {
    if (destroyed) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h || Number.isNaN(w) || Number.isNaN(h)) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    ocean.setResolution(w, h);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  function setPhysicalState(oceanT, impactT) {
    if (destroyed || contextLost) return;
    ocean.update(oceanT, impactT, performance.now() / 1000);
    renderer.render(scene, camera);
  }

  function renderFrame(oceanT, impactT, elapsed) {
    if (destroyed || contextLost) return;
    ocean.update(oceanT, impactT, elapsed);
    renderer.render(scene, camera);
  }

  let camTween = null;

  function resetCamera({ instant } = { instant: false }) {
    if (camTween) cancelAnimationFrame(camTween.raf);
    if (instant || destroyed || contextLost) {
      camera.position.set(...CAMERA_HOME.position);
      controls.target.set(...CAMERA_HOME.target);
      controls.update();
      renderer.render(scene, camera);
      return;
    }
    // 700ms 回正（有界短 tween，不与物理插值 RAF 并发叙事动画）
    const fromPos = camera.position.clone();
    const fromTarget = controls.target.clone();
    const toPos = new THREE.Vector3(...CAMERA_HOME.position);
    const toTarget = new THREE.Vector3(...CAMERA_HOME.target);
    const start = performance.now();
    const step = () => {
      if (destroyed || contextLost) return;
      const t = Math.min(1, (performance.now() - start) / 700);
      const k = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(fromPos, toPos, k);
      controls.target.lerpVectors(fromTarget, toTarget, k);
      controls.update();
      renderer.render(scene, camera);
      if (t < 1) camTween = { raf: requestAnimationFrame(step) };
      else camTween = null;
    };
    camTween = { raf: requestAnimationFrame(step) };
  }

  onReady();

  function destroy() {
    destroyed = true;
    if (camTween) cancelAnimationFrame(camTween.raf);
    ro.disconnect();
    controls.dispose();
    ocean.dispose();
    renderer.dispose();
  }

  return {
    setPhysicalState,
    renderFrame,
    resetCamera,
    resize,
    destroy,
    isContextLost: () => contextLost,
    controls,
  };
}
