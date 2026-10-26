import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTER_IDS,
  INITIAL_STATE,
  getChapterIndex,
  nextChapter,
  previousChapter,
  setChapter,
  getTargetState,
  isValidChapterId,
} from '../src/core/state.js';

test('三幕次序固定', () => {
  assert.deepEqual(CHAPTER_IDS, ['normal', 'el-nino', 'impact']);
  assert.equal(getChapterIndex('normal'), 0);
  assert.equal(getChapterIndex('el-nino'), 1);
  assert.equal(getChapterIndex('impact'), 2);
  assert.equal(getChapterIndex('bogus'), 0);
});

test('next/previous 在边界截断', () => {
  assert.equal(previousChapter('normal'), 'normal');
  assert.equal(nextChapter('normal'), 'el-nino');
  assert.equal(nextChapter('el-nino'), 'impact');
  assert.equal(nextChapter('impact'), 'impact');
  assert.equal(previousChapter('impact'), 'el-nino');
  assert.equal(previousChapter('el-nino'), 'normal');
});

test('setChapter 纯函数且拒绝非法 id', () => {
  const s0 = { ...INITIAL_STATE };
  const s1 = setChapter(s0, 'el-nino');
  assert.equal(s1.chapterId, 'el-nino');
  assert.equal(s0.chapterId, 'normal');
  assert.equal(setChapter(s0, 'nope'), s0);
});

test('目标状态映射', () => {
  assert.deepEqual(getTargetState('normal'), { ocean: 0, impact: 0 });
  assert.deepEqual(getTargetState('el-nino'), { ocean: 1, impact: 0 });
  assert.deepEqual(getTargetState('impact'), { ocean: 1, impact: 1 });
  assert.deepEqual(getTargetState('garbage'), { ocean: 0, impact: 0 });
});

test('isValidChapterId', () => {
  assert.equal(isValidChapterId('impact'), true);
  assert.equal(isValidChapterId(''), false);
  assert.equal(isValidChapterId(null), false);
});
