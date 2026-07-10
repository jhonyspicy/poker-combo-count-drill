// 相手のプリセットレンジ定義と、レンジのグリッド展開・コンボ数計算。
// レンジは都度生成せず、ここに定義したプリセットから選ぶ（ユーザーがレンジを覚えて練習できるようにするため）。
// 合計コンボ数は必ずロジックで計算し、定義データにハードコードしない。

import type { Card, Rank, Suit } from './comboCalculator';
import { SUITS } from './comboCalculator';
import { GRID_RANKS } from './rangeQuestions';

export interface PresetRange {
  id: string;
  name: string;
  // "AA" / "AKs" / "AKo" 形式のハンド表記（非ペアは高いランクが先）
  hands: string[];
}

export const PRESET_RANGES: PresetRange[] = [
  {
    id: 'tight-open',
    name: 'タイトなオープンレンジ',
    hands: [
      // ペア 55+
      'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55',
      // Ax スーテッド全部
      'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
      // 大きい Ax オフスート
      'AKo', 'AQo', 'AJo', 'ATo',
      // ブロードウェイのスーテッド
      'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs',
      // ブロードウェイのオフスート
      'KQo', 'KJo', 'QJo',
      // スーテッドコネクター
      '98s', '87s', '76s', '65s', '54s',
    ],
  },
  {
    id: 'broadway',
    name: 'ブロードウェイ中心のレンジ',
    hands: [
      // ペア TT+
      'AA', 'KK', 'QQ', 'JJ', 'TT',
      // ブロードウェイ同士のスーテッド
      'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs',
      // ブロードウェイ同士のオフスート
      'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo',
    ],
  },
  {
    id: 'suited-connectors',
    name: 'スーテッド中心のコールレンジ',
    hands: [
      // 中〜小ペア
      '22', '33', '44', '55', '66', '77', '88', '99', 'TT',
      // スーテッドコネクター全部
      'AKs', 'KQs', 'QJs', 'JTs', 'T9s', '98s', '87s', '76s', '65s', '54s', '43s', '32s',
      // スーテッド1ギャッパー全部
      'AQs', 'KJs', 'QTs', 'J9s', 'T8s', '97s', '86s', '75s', '64s', '53s', '42s',
    ],
  },
];

export function pickPresetRange(): PresetRange {
  return PRESET_RANGES[Math.floor(Math.random() * PRESET_RANGES.length)];
}

// ハンド表記をパースする。不正な表記は問題生成のバグなので例外にする
export function parseHand(hand: string): { high: Rank; low: Rank; kind: 'pair' | 'suited' | 'offsuit' } {
  const high = hand[0] as Rank;
  const low = hand[1] as Rank;
  const hi = GRID_RANKS.indexOf(high);
  const lo = GRID_RANKS.indexOf(low);
  if (hi === -1 || lo === -1) throw new Error(`不正なランク: ${hand}`);

  if (hand.length === 2) {
    if (high !== low) throw new Error(`ペア表記が不正: ${hand}`);
    return { high, low, kind: 'pair' };
  }
  if (hand.length === 3 && (hand[2] === 's' || hand[2] === 'o')) {
    // GRID_RANKS は A が先頭（強い順）なので、インデックスが小さい方が高いランク
    if (hi >= lo) throw new Error(`非ペアは高いランクを先に書く: ${hand}`);
    return { high, low, kind: hand[2] === 's' ? 'suited' : 'offsuit' };
  }
  throw new Error(`不正なハンド表記: ${hand}`);
}

// ハンド表記 → 13×13 グリッド座標（i=行, j=列。ペア=対角 / スーテッド=右上 / オフスート=左下）
export function handToGridCoord(hand: string): { i: number; j: number } {
  const { high, low, kind } = parseHand(hand);
  const hi = GRID_RANKS.indexOf(high);
  const lo = GRID_RANKS.indexOf(low);
  if (kind === 'pair') return { i: hi, j: hi };
  return kind === 'suited' ? { i: hi, j: lo } : { i: lo, j: hi };
}

// プリセットを 13×13 の hit 判定関数に展開する
export function presetToGridTest(preset: PresetRange): (i: number, j: number) => boolean {
  const hit = new Set<number>();
  for (const hand of preset.hands) {
    const { i, j } = handToGridCoord(hand);
    hit.add(i * 13 + j);
  }
  return (i, j) => hit.has(i * 13 + j);
}

function isDead(rank: Rank, suit: Suit, dead: Card[]): boolean {
  return dead.some(c => c.rank === rank && c.suit === suit);
}

// ハンド1タイプをデッドカード除外で具体コンボ（カード2枚の組）に展開する
export function expandHandCombos(hand: string, dead: Card[]): [Card, Card][] {
  const { high, low, kind } = parseHand(hand);
  const combos: [Card, Card][] = [];

  if (kind === 'pair') {
    for (let a = 0; a < 4; a++) {
      for (let b = a + 1; b < 4; b++) {
        if (!isDead(high, SUITS[a], dead) && !isDead(high, SUITS[b], dead)) {
          combos.push([{ rank: high, suit: SUITS[a] }, { rank: high, suit: SUITS[b] }]);
        }
      }
    }
  } else if (kind === 'suited') {
    for (const suit of SUITS) {
      if (!isDead(high, suit, dead) && !isDead(low, suit, dead)) {
        combos.push([{ rank: high, suit }, { rank: low, suit }]);
      }
    }
  } else {
    for (const s1 of SUITS) {
      for (const s2 of SUITS) {
        if (s1 === s2) continue;
        if (!isDead(high, s1, dead) && !isDead(low, s2, dead)) {
          combos.push([{ rank: high, suit: s1 }, { rank: low, suit: s2 }]);
        }
      }
    }
  }
  return combos;
}

// プリセット全体をデッドカード除外で具体コンボに展開する
export function expandPresetCombos(preset: PresetRange, dead: Card[]): [Card, Card][] {
  return preset.hands.flatMap(hand => expandHandCombos(hand, dead));
}

// プリセットの合計コンボ数（デッドカード考慮）
export function presetComboCount(preset: PresetRange, dead: Card[]): number {
  return expandPresetCombos(preset, dead).length;
}
