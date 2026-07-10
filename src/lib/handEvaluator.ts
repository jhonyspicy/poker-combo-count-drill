// ポーカーの役評価。上級問題（レンジ×ボードの勝敗カウント）の正解計算の根幹。
// 5枚の役を単一の数値スコアにエンコードし、数値の大小だけで勝敗を比較できるようにする。

import type { Card, Rank } from './comboCalculator';

const RANK_VALUE: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  T: 10, J: 11, Q: 12, K: 13, A: 14,
};

// 役カテゴリ（大きいほど強い）
export const HAND_CATEGORY_NAMES = [
  'ハイカード',
  'ワンペア',
  'ツーペア',
  'スリーカード',
  'ストレート',
  'フラッシュ',
  'フルハウス',
  'フォーカード',
  'ストレートフラッシュ',
] as const;

// タイブレーク5枠を15進で詰めるためのオフセット
const TIE_BASE = 15 ** 5;

// スコアから役カテゴリ名を取り出す（解説文用）
export function handCategoryName(score: number): string {
  return HAND_CATEGORY_NAMES[Math.floor(score / TIE_BASE)];
}

// 5枚の役を評価して数値スコアを返す。
// スコア = カテゴリ × 15^5 + タイブレーク（最大5値を15進で連結）
export function evaluate5(cards: Card[]): number {
  const values = cards.map(c => RANK_VALUE[c.rank]).sort((a, b) => b - a);
  const isFlush = cards.every(c => c.suit === cards[0].suit);

  // ストレート判定（A-2-3-4-5 のホイールは 5 ハイとして扱う）
  const uniq = [...new Set(values)];
  let straightHigh = 0;
  if (uniq.length === 5) {
    if (uniq[0] - uniq[4] === 4) straightHigh = uniq[0];
    else if (uniq[0] === 14 && uniq[1] === 5 && uniq[4] === 2) straightHigh = 5;
  }

  // ランクごとの枚数を数え、枚数 → ランクの順で並べる
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const groups = [...counts.entries()]
    .map(([r, c]) => ({ r, c }))
    .sort((a, b) => b.c - a.c || b.r - a.r);

  let category: number;
  let tie: number[];
  if (straightHigh && isFlush) {
    category = 8;
    tie = [straightHigh];
  } else if (groups[0].c === 4) {
    category = 7;
    tie = [groups[0].r, groups[1].r];
  } else if (groups[0].c === 3 && groups[1].c === 2) {
    category = 6;
    tie = [groups[0].r, groups[1].r];
  } else if (isFlush) {
    category = 5;
    tie = values;
  } else if (straightHigh) {
    category = 4;
    tie = [straightHigh];
  } else if (groups[0].c === 3) {
    category = 3;
    tie = [groups[0].r, ...values.filter(v => v !== groups[0].r)];
  } else if (groups[0].c === 2 && groups[1].c === 2) {
    category = 2;
    tie = [groups[0].r, groups[1].r, groups[2].r];
  } else if (groups[0].c === 2) {
    category = 1;
    tie = [groups[0].r, ...values.filter(v => v !== groups[0].r)];
  } else {
    category = 0;
    tie = values;
  }

  let enc = 0;
  for (let i = 0; i < 5; i++) enc = enc * 15 + (tie[i] ?? 0);
  return category * TIE_BASE + enc;
}

// 5〜7枚から5枚の組み合わせを全列挙し、最強の役スコアを返す。
// 7枚でも C(7,5) = 21 通りなので全列挙で十分速い
export function evaluateBest(cards: Card[]): number {
  if (cards.length === 5) return evaluate5(cards);

  let best = 0;
  const chosen: Card[] = [];
  const pick = (start: number) => {
    if (chosen.length === 5) {
      const score = evaluate5(chosen);
      if (score > best) best = score;
      return;
    }
    // 残り枚数が足りなくなる手前まで走査する
    for (let i = start; i <= cards.length - (5 - chosen.length); i++) {
      chosen.push(cards[i]);
      pick(i + 1);
      chosen.pop();
    }
  };
  pick(0);
  return best;
}
