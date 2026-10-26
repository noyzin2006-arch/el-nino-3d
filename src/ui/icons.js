/* 唯一一套 SVG 图标：24×24 viewBox，2px stroke，round cap/join。 */

const svgWrap = (path) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;

const PATHS = {
  ChevronLeft: '<path d="M15 18l-6-6 6-6"/>',
  ChevronRight: '<path d="M9 18l6-6-6-6"/>',
  RotateCcw: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  Pause: '<path d="M10 5v14"/><path d="M14 5v14"/>',
  Play: '<path d="M7 4l13 8-13 8z"/>',
  Info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M12 11v5"/>',
  AlertCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  ExternalLink: '<path d="M14 4h6v6"/><path d="M20 4L10 14"/><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/>',
  Waves: '<path d="M2 8c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2"/><path d="M2 13c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2"/><path d="M2 18c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2"/>',
};

export function icon(name) {
  const path = PATHS[name];
  if (!path) throw new Error(`unknown icon: ${name}`);
  return svgWrap(path);
}

export const ICON_NAMES = Object.keys(PATHS);
