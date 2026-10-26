/* 统一动画器：单 RAF；ocean/impact 双通道可中断 tween；reduced motion 即时到位。 */

export function createAnimator({ onFrame, onSettled, reducedMotion }) {
  let rafId = null;
  let running = false;
  let flowPaused = false;
  let reduced = !!reducedMotion;

  // 当前渲染值（ tween 起点 = 当前值，保证打断连续）
  const current = { ocean: 0, impact: 0 };
  const tween = { active: false, fromOcean: 0, fromImpact: 0, toOcean: 0, toImpact: 0, start: 0, duration: 0 };

  let lastTime = 0;
  let controlsActive = false;

  function ease(t) {
    // ease-narrative: cubic-bezier(.22,1,.36,1) 的近似（easeOutQuint 族）
    return 1 - Math.pow(1 - t, 5) * 0.999;
  }

  function frame(now) {
    rafId = null;
    const dt = Math.min(0.1, (now - lastTime) / 1000 || 0);
    lastTime = now;
    const elapsed = now / 1000;

    if (tween.active) {
      if (reduced) {
        current.ocean = tween.toOcean;
        current.impact = tween.toImpact;
        tween.active = false;
      } else {
        const t = Math.min(1, (now - tween.start) / tween.duration);
        const k = ease(t);
        current.ocean = tween.fromOcean + (tween.toOcean - tween.fromOcean) * k;
        current.impact = tween.fromImpact + (tween.toImpact - tween.fromImpact) * k;
        if (t >= 1) tween.active = false;
      }
    }

    const moving = tween.active || controlsActive;
    const flowing = !flowPaused && !reduced;

    if (moving || flowing) {
      onFrame(current.ocean, current.impact, elapsed);
    }

    if (!tween.active) {
      controlsActive = false;
      if (onSettled) onSettled(current.ocean, current.impact);
    }

    if (running && (moving || flowing)) {
      rafId = requestAnimationFrame(frame);
    }
  }

  function kick() {
    if (!running) return;
    if (rafId === null) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(frame);
    }
  }

  return {
    /** 目标插值：从当前渲染值出发，打断式。 */
    transitionTo({ ocean, impact }, durationMs = 1000) {
      tween.fromOcean = current.ocean;
      tween.fromImpact = current.impact;
      tween.toOcean = ocean;
      tween.toImpact = impact;
      tween.start = performance.now();
      tween.duration = Math.max(1, durationMs);
      tween.active = true;
      if (reduced) {
        current.ocean = ocean;
        current.impact = impact;
        tween.active = false;
        onFrame(current.ocean, current.impact, performance.now() / 1000);
        if (onSettled) onSettled(current.ocean, current.impact);
        return;
      }
      kick();
    },
    /** 相机/控件活动时保持帧循环（damping 衰减）。 */
    notifyControlsActive() {
      controlsActive = true;
      kick();
    },
    setPaused(p) {
      flowPaused = !!p;
      if (!flowPaused) kick();
    },
    setReducedMotion(r) {
      reduced = !!r;
      if (reduced && tween.active) {
        tween.active = false;
        current.ocean = tween.toOcean;
        current.impact = tween.toImpact;
        onFrame(current.ocean, current.impact, performance.now() / 1000);
      } else {
        kick();
      }
    },
    start() {
      if (running) return;
      running = true;
      kick();
    },
    stop() {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    },
    /** 当前渲染值（用于重绘/resize）。 */
    getCurrent() {
      return { ...current };
    },
    isFlowPaused() {
      return flowPaused;
    },
    dispose() {
      this.stop();
    },
  };
}
