import { describe, it, expect } from 'vitest';
import { DIFFICULTIES, DIFFICULTY_CONFIG, getTimeLimitSec, isDifficulty } from '../../config/gameConfig';

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

describe('isDifficulty: ルートパラメータの検証', () => {
  it('正当な難易度のみ真を返す', () => {
    expect(isDifficulty('beginner')).toBe(true);
    expect(isDifficulty('intermediate')).toBe(true);
    expect(isDifficulty('advanced')).toBe(true);
    expect(isDifficulty('unknown')).toBe(false);
    expect(isDifficulty(undefined)).toBe(false);
  });
});
