import { describe, it, expect } from 'vitest';
import {
  advancedChoiceZones, advancedZoneIndex, ADVANCED_MIN_RANGE_TOTAL,
  DIFFICULTIES, DIFFICULTY_CONFIG, getTimeLimitSec, isDifficulty,
} from '../../config/gameConfig';

describe('getTimeLimitSec: 連続正解数に応じた制限時間の短縮', () => {
  it('連続正解数 0 では基準時間そのもの', () => {
    for (const d of DIFFICULTIES) {
      expect(getTimeLimitSec(d, null, 0)).toBe(DIFFICULTY_CONFIG[d].baseTimeSec);
    }
  });

  it('ストリート別加算が基準時間に足される', () => {
    const cfg = DIFFICULTY_CONFIG.intermediate;
    expect(getTimeLimitSec('intermediate', 'river', 0)).toBe(
      cfg.baseTimeSec + cfg.streetTimeBonusSec.river
    );
  });

  it('正解を重ねると単調に短くなる', () => {
    let prev = Infinity;
    for (let streak = 0; streak < 30; streak++) {
      const t = getTimeLimitSec('beginner', null, streak);
      expect(t).toBeLessThanOrEqual(prev);
      prev = t;
    }
  });

  it('下限（基準時間 × 下限比率）でクリップされる', () => {
    const cfg = DIFFICULTY_CONFIG.beginner;
    const floor = cfg.baseTimeSec * cfg.timeFloorRatio;
    expect(getTimeLimitSec('beginner', null, 1000)).toBe(floor);
  });
});

describe('上級ゾーン: 総コンボ数からのゾーン導出と判定', () => {
  it('総コンボ数 150 では比率 [0.07, 0.27, 0.53] に応じたゾーンになる', () => {
    expect(advancedChoiceZones(150)).toEqual([
      { min: 0, max: 10 },
      { min: 11, max: 40 },
      { min: 41, max: 79 },
      { min: 80, max: 150 },
    ]);
  });

  it('ゾーンは4つで、0 から始まり total で終わる連続した整数区間になる', () => {
    for (const total of [ADVANCED_MIN_RANGE_TOTAL, 50, 100, 150, 500, 1326]) {
      const zones = advancedChoiceZones(total);
      expect(zones).toHaveLength(4);
      expect(zones[0].min).toBe(0);
      expect(zones[zones.length - 1].max).toBe(total);
      for (let i = 0; i < zones.length; i++) {
        expect(zones[i].max).toBeGreaterThanOrEqual(zones[i].min);
        if (i > 0) expect(zones[i].min).toBe(zones[i - 1].max + 1);
      }
    }
  });

  it('0〜total の全整数がちょうど1つのゾーンに属し、判定と一致する', () => {
    for (const total of [ADVANCED_MIN_RANGE_TOTAL, 150, 300]) {
      const zones = advancedChoiceZones(total);
      for (let count = 0; count <= total; count++) {
        const hits = zones.filter(z => count >= z.min && count <= z.max);
        expect(hits).toHaveLength(1);
        expect(zones[advancedZoneIndex(count, total)]).toEqual(hits[0]);
      }
    }
  });

  it('総コンボ数が変わればゾーン境界も比例して変わる', () => {
    const small = advancedChoiceZones(50);
    const large = advancedChoiceZones(500);
    for (let i = 0; i < 3; i++) {
      expect(large[i].max).toBeGreaterThan(small[i].max);
    }
  });
});

describe('isDifficulty: ルートパラメータの検証', () => {
  it('正当な難易度のみ真を返す', () => {
    expect(isDifficulty('beginner')).toBe(true);
    expect(isDifficulty('intermediate')).toBe(true);
    expect(isDifficulty('advanced')).toBe(true);
    expect(isDifficulty('unknown')).toBe(false);
    expect(isDifficulty(undefined)).toBe(false);
  });
});
