import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, IMPACT_CARDS, SOURCES } from '../src/content/chapters.js';

test('三幕齐全且字段完整', () => {
  assert.equal(CHAPTERS.length, 3);
  for (const c of CHAPTERS) {
    assert.ok(['normal', 'el-nino', 'impact'].includes(c.id));
    assert.ok(['01', '02', '03'].includes(c.number));
    assert.ok(c.title.length > 0);
    assert.ok(c.body.length >= 2);
    for (const p of c.body) assert.ok(p.length > 10);
    assert.ok(c.facts.length >= 3);
    assert.ok(c.srSummary.length > 10);
  }
});

test('影响卡恰好 4 张，每张含来源与“非必然”限定', () => {
  assert.equal(IMPACT_CARDS.length, 4);
  const regions = IMPACT_CARDS.map((c) => c.region).join('|');
  assert.ok(regions.includes('秘鲁'));
  assert.ok(regions.includes('印度尼西亚'));
  assert.ok(regions.includes('中国'));
  for (const card of IMPACT_CARDS) {
    assert.ok(card.headline.length > 0);
    assert.ok(card.detail.length > 20);
    assert.ok(card.caveat.length > 10);
    assert.ok(/^https:\/\//.test(card.sourceUrl));
  }
});

test('概率表述谨慎：含“可能/概率/倾向”，无“必然/一定”断言', () => {
  const all = JSON.stringify([...CHAPTERS, ...IMPACT_CARDS]);
  assert.ok(/可能|概率|倾向/.test(all));
  const stripped = all.replaceAll('并非每次必然发生', '').replaceAll('不是必然结果', '');
  assert.ok(!/一定会|必然发生|肯定/.test(stripped));
  assert.ok(all.includes('并非每次必然'));
});

test('来源至少含 NOAA 与 NASA', () => {
  const joined = SOURCES.map((s) => s.url).join('\n');
  assert.ok(joined.includes('noaa.gov'));
  assert.ok(joined.includes('nasa.gov'));
  for (const s of SOURCES) {
    assert.ok(s.label.length > 0);
    assert.ok(/^https:\/\//.test(s.url));
    assert.ok(s.purpose.length > 0);
  }
});

test('不出现伪造的定量数据（℃、mm、百分比数值）', () => {
  const all = JSON.stringify([...CHAPTERS, ...IMPACT_CARDS, ...SOURCES]);
  assert.ok(!/℃|°C|\d+\s?mm|\d+(\.\d+)?%/.test(all));
});
