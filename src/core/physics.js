/* 纯物理参数函数：概念示意，模型单位，非实测。全部可 node --test。 */

export function clamp01(x) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export function smoothstep01(x) {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
}

function clampU(u) {
  if (typeof u !== 'number' || !Number.isFinite(u)) return 0;
  if (u < 0) return 0;
  if (u > 1) return 1;
  return u;
}

/** 温跃层深度（模型单位，正值向下）。西端 u=0，东端 u=1。 */
export function sampleThermocline(u, ocean) {
  const x = clampU(u);
  const o = clamp01(ocean);
  const dNeutral = 1.7 - 1.25 * x;
  const dElNino = 1.15 - 0.12 * x;
  return (1 - o) * dNeutral + o * dElNino;
}

/** 表层相对暖指数（0..1，无单位）。 */
export function sampleSurfaceWarmth(u, ocean) {
  const x = clampU(u);
  const o = clamp01(ocean);
  const warmNeutral = 0.75 - 0.55 * x;
  const t = (x - 0.74) / 0.3;
  const warmEvent = clamp01(warmNeutral + 0.65 * Math.exp(-t * t));
  return (1 - o) * warmNeutral + o * warmEvent;
}

/** 由海气耦合状态推出风、环流、雨带、上升流的强弱与位置。 */
export function samplePhysics(ocean, impact) {
  const o = clamp01(ocean);
  const i = clamp01(impact);
  return {
    tradeStrength: 1 - 0.65 * o, // NORMAL 1 → EL_NINO 0.35
    walkerStrength: 1 - 0.6 * o, // NORMAL 1 → EL_NINO 0.40
    rainX: -4.4 + 5.4 * o, // NORMAL -4.4 → EL_NINO +1.0
    upwellingStrength: 1 - 0.73 * o, // NORMAL 1 → EL_NINO 0.27
    impactOpacity: i,
  };
}
