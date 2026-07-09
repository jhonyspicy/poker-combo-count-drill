export type QuestionType = 'simple' | 'range' | 'flop' | 'turn' | 'river';

// Lv2以降で次のレベルへ進むために必要な連続正解数
export const MASTERY_STREAK = 20;

export const BASE_TIME_SEC: Record<QuestionType, number> = {
  simple: 16,
  range: 24,
  flop: 30,
  turn: 36,
  river: 40,
};

export const TIME_SCALE_FACTOR = 0.92;
export const TIME_FLOOR_RATIO = 0.5;

// 各レベルに対応する問題タイプ（1レベル＝1タイプ）
export function getLevelType(level: number): QuestionType {
  if (level === 1) return 'simple';
  if (level === 2) return 'range';
  if (level === 3) return 'flop';
  if (level === 4) return 'turn';
  return 'river';
}

export function getTimeLimitSec(type: QuestionType, level: number): number {
  const base = BASE_TIME_SEC[type];
  const scaled = base * Math.pow(TIME_SCALE_FACTOR, level - 1);
  return Math.max(base * TIME_FLOOR_RATIO, scaled);
}
