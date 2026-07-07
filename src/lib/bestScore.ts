const STORAGE_KEY = 'poker-drill-best';

export interface BestScore {
  score: number;
  level: number;
  date: string; // ISO 8601
}

export function loadBestScore(): BestScore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.score === 'number' &&
      typeof parsed?.level === 'number' &&
      typeof parsed?.date === 'string'
    ) {
      return parsed as BestScore;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveBestScore(best: BestScore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(best));
}

// Returns true if the new score beats the stored best.
export function tryUpdateBestScore(score: number, level: number): boolean {
  const current = loadBestScore();
  if (current && current.score >= score) return false;
  saveBestScore({ score, level, date: new Date().toISOString() });
  return true;
}
