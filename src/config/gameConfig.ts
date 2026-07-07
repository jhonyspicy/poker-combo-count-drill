export type QuestionType = 'simple' | 'flop' | 'turn' | 'river';

export const QUESTIONS_PER_LEVEL = 5;

export const BASE_TIME_SEC: Record<QuestionType, number> = {
  simple: 16,
  flop: 30,
  turn: 36,
  river: 40,
};

export const TIME_SCALE_FACTOR = 0.92;
export const TIME_FLOOR_RATIO = 0.5;

// Index = level - 1. Levels beyond the array use the last entry.
export const LEVEL_TYPE_WEIGHTS: Record<QuestionType, number>[] = [
  { simple: 1, flop: 0, turn: 0, river: 0 }, // Lv1
  { simple: 1, flop: 1, turn: 0, river: 0 }, // Lv2
  { simple: 1, flop: 1, turn: 1, river: 0 }, // Lv3
  { simple: 1, flop: 2, turn: 2, river: 2 }, // Lv4+
];

export function getTimeLimitSec(type: QuestionType, level: number): number {
  const base = BASE_TIME_SEC[type];
  const scaled = base * Math.pow(TIME_SCALE_FACTOR, level - 1);
  return Math.max(base * TIME_FLOOR_RATIO, scaled);
}

export function getTypeWeights(level: number): Record<QuestionType, number> {
  const idx = Math.min(level - 1, LEVEL_TYPE_WEIGHTS.length - 1);
  return LEVEL_TYPE_WEIGHTS[idx];
}

export function pickRandomType(level: number): QuestionType {
  const weights = getTypeWeights(level);
  const pool: QuestionType[] = [];
  for (const [type, weight] of Object.entries(weights) as [QuestionType, number][]) {
    for (let i = 0; i < weight; i++) pool.push(type);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
