/* 纯状态机：单一真源，可 node --test。 */

export const CHAPTER_IDS = ['normal', 'el-nino', 'impact'];

export const INITIAL_STATE = {
  chapterId: 'normal',
  targetProgress: 0,
  progress: 0,
  impactWeight: 0,
  motionPaused: false,
  reducedMotion: false,
  sceneStatus: 'loading',
  errorCode: null,
  cameraResetNonce: 0,
};

export function getChapterIndex(id) {
  const i = CHAPTER_IDS.indexOf(id);
  return i === -1 ? 0 : i;
}

export function nextChapter(id) {
  const i = getChapterIndex(id);
  return CHAPTER_IDS[Math.min(i + 1, CHAPTER_IDS.length - 1)];
}

export function previousChapter(id) {
  const i = getChapterIndex(id);
  return CHAPTER_IDS[Math.max(i - 1, 0)];
}

export function isValidChapterId(id) {
  return CHAPTER_IDS.includes(id);
}

export function setChapter(state, id) {
  if (!isValidChapterId(id)) return state;
  return { ...state, chapterId: id };
}

export function getTargetState(chapterId) {
  switch (chapterId) {
    case 'el-nino':
      return { ocean: 1, impact: 0 };
    case 'impact':
      return { ocean: 1, impact: 1 };
    case 'normal':
    default:
      return { ocean: 0, impact: 0 };
  }
}
