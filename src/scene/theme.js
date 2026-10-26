/* 将 CSS token 读取为场景语义配色（初始化时 getComputedStyle 一次）。 */

const TOKEN_NAMES = [
  'oceanCold',
  'oceanMid',
  'oceanWarm',
  'deepSea',
  'thermocline',
  'wind',
  'rain',
  'accent',
  'panel',
  'text',
];

const TOKEN_VARS = {
  oceanCold: '--c-ocean-cold',
  oceanMid: '--c-ocean-mid',
  oceanWarm: '--c-ocean-warm',
  deepSea: '--c-deep-sea',
  thermocline: '--c-thermocline',
  wind: '--c-wind',
  rain: '--c-rain',
  accent: '--c-accent',
  panel: '--c-panel',
  text: '--c-text',
};

/** 读取一次 computed style，返回语义名 → CSS 颜色字符串。 */
export function readTheme(root = document.documentElement) {
  const style = getComputedStyle(root);
  const theme = {};
  for (const name of TOKEN_NAMES) {
    theme[name] = style.getPropertyValue(TOKEN_VARS[name]).trim();
  }
  return theme;
}
