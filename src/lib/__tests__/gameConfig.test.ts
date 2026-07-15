import { describe, it, expect } from 'vitest';
import {
  ADVANCED_CHOICE_BUCKETS, advancedBucketIndex,
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

describe('上級バケット: 境界値からの帯の導出と判定', () => {
  it('初期値 [10, 40, 80] から4帯（0〜10 / 11〜40 / 41〜80 / 81以上）を導出する', () => {
    expect(ADVANCED_CHOICE_BUCKETS).toEqual([
      { min: 0, max: 10, label: '0〜10' },
      { min: 11, max: 40, label: '11〜40' },
      { min: 41, max: 80, label: '41〜80' },
      { min: 81, max: null, label: '81以上' },
    ]);
  });

  it('帯は重複せず、任意の負けコンボ数がちょうど1つの帯に属する', () => {
    for (let count = 0; count <= 200; count++) {
      const hits = ADVANCED_CHOICE_BUCKETS.filter(
        b => count >= b.min && (b.max === null || count <= b.max)
      );
      expect(hits).toHaveLength(1);
      expect(ADVANCED_CHOICE_BUCKETS[advancedBucketIndex(count)]).toBe(hits[0]);
    }
  });

  it('境界値ちょうどは下の帯・境界値+1 は上の帯に属する', () => {
    expect(advancedBucketIndex(0)).toBe(0);
    expect(advancedBucketIndex(10)).toBe(0);
    expect(advancedBucketIndex(11)).toBe(1);
    expect(advancedBucketIndex(40)).toBe(1);
    expect(advancedBucketIndex(41)).toBe(2);
    expect(advancedBucketIndex(80)).toBe(2);
    expect(advancedBucketIndex(81)).toBe(3);
    expect(advancedBucketIndex(1000)).toBe(3);
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
