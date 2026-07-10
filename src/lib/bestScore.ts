import type { Difficulty } from '../config/gameConfig';
import { DIFFICULTIES } from '../config/gameConfig';

// 難易度別の自己ベスト。レベル概念の廃止に伴いキーを v2 に変更し、旧データは引き継がない
const STORAGE_KEY = 'poker-drill-best-v2';
// 旧形式（score/level/date の単一記録）のキー。読み込まず、保存時に削除する
const LEGACY_STORAGE_KEY = 'poker-drill-best';

export interface BestEntry {
  score: number;
  date: string; // ISO 8601
}

export type BestScores = Partial<Record<Difficulty, BestEntry>>;

function isValidEntry(value: unknown): value is BestEntry {
  const entry = value as BestEntry | null;
  return typeof entry?.score === 'number' && typeof entry?.date === 'string';
}

export function loadBestScores(): BestScores {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result: BestScores = {};
    for (const difficulty of DIFFICULTIES) {
      if (isValidEntry(parsed?.[difficulty])) {
        result[difficulty] = parsed[difficulty] as BestEntry;
      }
    }
    return result;
  } catch {
    // 破損・不正な形式は記録なしとして扱う
    return {};
  }
}

// 指定難易度の自己ベストを上回る場合のみ更新し true を返す
export function tryUpdateBestScore(difficulty: Difficulty, score: number): boolean {
  const all = loadBestScores();
  const current = all[difficulty];
  if (current && current.score >= score) return false;

  all[difficulty] = { score, date: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  return true;
}
