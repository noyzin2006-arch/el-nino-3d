import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp01,
  smoothstep01,
  sampleThermocline,
  sampleSurfaceWarmth,
  samplePhysics,
} from '../src/core/physics.js';

test('clamp01 边界与非有限数', () => {
  assert.equal(clamp01(0), 0);
  assert.equal(clamp01(1), 1);
  assert.equal(clamp01(0.4), 0.4);
  assert.equal(clamp01(-2), 0);
  assert.equal(clamp01(3), 1);
  assert.equal(clamp01(NaN), 0);
  assert.equal(clamp01(Infinity), 0);
  assert.equal(clamp01('x'), 0);
});

test('smoothstep01 单调且端点为 0/1', () => {
  assert.equal(smoothstep01(0), 0);
  assert.equal(smoothstep01(1), 1);
  assert.ok(smoothstep01(0.75) > smoothstep01(0.25));
  assert.equal(smoothstep01(NaN), 0);
});

test('温跃层：正常态西深东浅，厄尔尼诺态坡度变缓且东部加深', () => {
  // 端点（规划 5.3）：西 1.70→1.15，东 0.45→1.03
  assert.ok(Math.abs(sampleThermocline(0, 0) - 1.7) < 1e-9);
  assert.ok(Math.abs(sampleThermocline(1, 0) - 0.45) < 1e-9);
  assert.ok(Math.abs(sampleThermocline(0, 1) - 1.15) < 1e-9);
  assert.ok(Math.abs(sampleThermocline(1, 1) - 1.03) < 1e-9);
  // 斜率幅度 1.25 → 0.12
  const slopeNeutral = sampleThermocline(1, 0) - sampleThermocline(0, 0);
  const slopeNino = sampleThermocline(1, 1) - sampleThermocline(0, 1);
  assert.ok(Math.abs(Math.abs(slopeNeutral) - 1.25) < 1e-9);
  assert.ok(Math.abs(Math.abs(slopeNino) - 0.12) < 1e-9);
  assert.ok(Math.abs(slopeNino) < Math.abs(slopeNeutral));
  // 厄尔尼诺态东部更深
  assert.ok(sampleThermocline(1, 1) > sampleThermocline(1, 0));
});

test('温跃层采样值有限且在合理范围', () => {
  for (const u of [0, 0.25, 0.5, 0.75, 1]) {
    for (const o of [0, 0.3, 0.7, 1]) {
      const d = sampleThermocline(u, o);
      assert.ok(Number.isFinite(d));
      assert.ok(d > 0 && d < 2);
    }
  }
  // 非法输入不崩
  assert.ok(Number.isFinite(sampleThermocline(NaN, NaN)));
});

test('表层暖指数：西端恒暖，事件期中东部明显转暖且全部 clamp01', () => {
  for (const u of [0, 0.25, 0.5, 0.75, 1]) {
    const w0 = sampleSurfaceWarmth(u, 0);
    const w1 = sampleSurfaceWarmth(u, 1);
    assert.ok(w0 >= 0 && w0 <= 1);
    assert.ok(w1 >= 0 && w1 <= 1);
    assert.ok(Number.isFinite(w1));
  }
  assert.ok(sampleSurfaceWarmth(0, 1) >= sampleSurfaceWarmth(0, 0) - 1e-9);
  // 东部事件期转暖
  assert.ok(sampleSurfaceWarmth(0.85, 1) > sampleSurfaceWarmth(0.85, 0));
  assert.equal(sampleSurfaceWarmth(NaN, NaN), 0.75);
});

test('samplePhysics：风与上升流减弱但 >0，雨带东移，impact 透传', () => {
  const n = samplePhysics(0, 0);
  const e = samplePhysics(1, 0);
  const i = samplePhysics(1, 1);

  assert.equal(n.tradeStrength, 1);
  assert.ok(e.tradeStrength < n.tradeStrength && e.tradeStrength > 0);
  assert.ok(Math.abs(e.tradeStrength - 0.35) < 1e-9);

  assert.equal(n.walkerStrength, 1);
  assert.ok(Math.abs(e.walkerStrength - 0.4) < 1e-9);

  assert.equal(n.upwellingStrength, 1);
  assert.ok(Math.abs(e.upwellingStrength - 0.27) < 1e-9);

  assert.ok(Math.abs(n.rainX - -4.4) < 1e-9);
  assert.ok(Math.abs(e.rainX - 1.0) < 1e-9);
  assert.ok(e.rainX > n.rainX);

  assert.equal(i.impactOpacity, 1);
  assert.equal(e.impactOpacity, 0);

  // 非有限输入回归安全值
  const bad = samplePhysics(NaN, NaN);
  assert.ok(Number.isFinite(bad.tradeStrength));
});
