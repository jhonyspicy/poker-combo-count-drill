import { describe, it, expect } from 'vitest';
import type { Card } from '../comboCalculator';
import {
  PRESET_RANGES, parseHand, handToGridCoord, presetToGridTest,
  expandHandCombos, presetComboCount,
} from '../presetRanges';

function card(rank: string, suit: string): Card {
  return { rank, suit } as Card;
}

describe('プリセット定義の妥当性', () => {
  it('全プリセットの全ハンド表記がパースできる（正当な表記）', () => {
    for (const preset of PRESET_RANGES) {
      for (const hand of preset.hands) {
        expect(() => parseHand(hand)).not.toThrow();
      }
    }
  });

  it('プリセット内にハンドの重複がない', () => {
    for (const preset of PRESET_RANGES) {
      expect(new Set(preset.hands).size).toBe(preset.hands.length);
    }
  });

  it('プリセット id に重複がない', () => {
    const ids = PRESET_RANGES.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('不正な表記は例外になる', () => {
    expect(() => parseHand('KAs')).toThrow(); // 低いランクが先
    expect(() => parseHand('AK')).toThrow(); // 非ペアに s/o がない
    expect(() => parseHand('AKx')).toThrow(); // 不正なサフィックス
    expect(() => parseHand('1Ks')).toThrow(); // 不正なランク
  });
});

describe('グリッド座標への展開', () => {
  it('ペアは対角セルにマップされる', () => {
    expect(handToGridCoord('AA')).toEqual({ i: 0, j: 0 });
    expect(handToGridCoord('22')).toEqual({ i: 12, j: 12 });
  });

  it('スーテッドは右上（i < j）にマップされる', () => {
    expect(handToGridCoord('AKs')).toEqual({ i: 0, j: 1 });
    expect(handToGridCoord('54s')).toEqual({ i: 9, j: 10 });
  });

  it('オフスートは左下（i > j）にマップされる', () => {
    expect(handToGridCoord('AKo')).toEqual({ i: 1, j: 0 });
  });

  it('presetToGridTest はレンジ内のセルだけ真を返す', () => {
    const test = presetToGridTest(PRESET_RANGES[0]); // open-range
    expect(test(0, 0)).toBe(true); // AA
    expect(test(0, 12)).toBe(true); // A2s
    expect(test(12, 0)).toBe(false); // A2o はレンジ外
    expect(test(12, 12)).toBe(false); // 22 はレンジ外
  });

  it('コールレンジの境界セルの in/out が画像のレンジと一致する', () => {
    const preset = PRESET_RANGES.find(p => p.id === 'call-range')!;
    const test = presetToGridTest(preset);
    // GRID_RANKS: A=0, K=1, Q=2, J=3, T=4, 9=5, 8=6, 7=7, 6=8, 5=9, 4=10, 3=11, 2=12
    expect(test(0, 0)).toBe(false); // AA はレンジ外
    expect(test(3, 3)).toBe(false); // JJ はレンジ外
    expect(test(4, 4)).toBe(true); // TT
    expect(test(10, 10)).toBe(true); // 44
    expect(test(11, 11)).toBe(false); // 33 はレンジ外
    expect(test(0, 1)).toBe(false); // AKs はレンジ外
    expect(test(0, 2)).toBe(true); // AQs
    expect(test(0, 7)).toBe(true); // A7s
    expect(test(0, 8)).toBe(false); // A6s はレンジ外
    expect(test(0, 9)).toBe(true); // A5s
    expect(test(0, 10)).toBe(true); // A4s
    expect(test(0, 11)).toBe(false); // A3s はレンジ外
    expect(test(1, 5)).toBe(true); // K9s
    expect(test(1, 6)).toBe(false); // K8s はレンジ外
    expect(test(2, 4)).toBe(true); // QTs
    expect(test(2, 5)).toBe(false); // Q9s はレンジ外
    expect(test(4, 5)).toBe(true); // T9s
    expect(test(4, 6)).toBe(false); // T8s はレンジ外
    expect(test(5, 6)).toBe(false); // 98s はレンジ外
    expect(test(3, 0)).toBe(true); // AJo
    expect(test(2, 0)).toBe(false); // AQo はレンジ外
    expect(test(4, 0)).toBe(false); // ATo はレンジ外
    expect(test(3, 1)).toBe(false); // KJo はレンジ外
  });

  it('境界セルの in/out が画像のレンジと一致する', () => {
    const test = presetToGridTest(PRESET_RANGES[0]); // open-range
    // GRID_RANKS: A=0, K=1, Q=2, J=3, T=4, 9=5, 8=6, 7=7, 6=8, 5=9, 4=10
    expect(test(1, 9)).toBe(true); // K5s
    expect(test(1, 10)).toBe(false); // K4s はレンジ外
    expect(test(2, 5)).toBe(true); // Q9s
    expect(test(2, 6)).toBe(false); // Q8s はレンジ外
    expect(test(3, 4)).toBe(true); // JTs
    expect(test(3, 5)).toBe(false); // J9s はレンジ外
    expect(test(4, 0)).toBe(true); // ATo
    expect(test(4, 1)).toBe(false); // KTo はレンジ外
    expect(test(3, 1)).toBe(true); // KJo
    expect(test(3, 2)).toBe(false); // QJo はレンジ外
    expect(test(7, 7)).toBe(true); // 77
    expect(test(8, 8)).toBe(false); // 66 はレンジ外
  });
});

describe('コンボ数計算（デッドカードなし）', () => {
  it('合計はタイプごとのコンボ数（ペア6 / スーテッド4 / オフスート12）の合計と一致する', () => {
    for (const preset of PRESET_RANGES) {
      const expected = preset.hands.reduce((acc, hand) => {
        const { kind } = parseHand(hand);
        return acc + (kind === 'pair' ? 6 : kind === 'suited' ? 4 : 12);
      }, 0);
      expect(presetComboCount(preset, [])).toBe(expected);
    }
  });

  it('オープンレンジは 216 コンボ', () => {
    // ペア8×6 + スーテッド24×4 + オフスート6×12 = 216
    expect(presetComboCount(PRESET_RANGES[0], [])).toBe(216);
  });

  it('コールレンジは 118 コンボ', () => {
    // ペア7×6 + スーテッド16×4 + オフスート1×12 = 118
    const preset = PRESET_RANGES.find(p => p.id === 'call-range')!;
    expect(presetComboCount(preset, [])).toBe(118);
  });
});

describe('コンボ数計算（デッドカードあり）', () => {
  it('ペア: A♠ が死んでいると AA は C(3,2) = 3', () => {
    expect(expandHandCombos('AA', [card('A', 's')])).toHaveLength(3);
  });

  it('スーテッド: A♠ が死んでいると AKs は 3', () => {
    expect(expandHandCombos('AKs', [card('A', 's')])).toHaveLength(3);
  });

  it('オフスート: ボード A♠ K♥ 2♦ のとき AKo は 7（CLAUDE.md の基準例）', () => {
    const dead = [card('A', 's'), card('K', 'h'), card('2', 'd')];
    expect(expandHandCombos('AKo', dead)).toHaveLength(7);
  });

  it('展開されたコンボにデッドカードが含まれない', () => {
    const dead = [card('A', 's'), card('K', 'h')];
    for (const preset of PRESET_RANGES) {
      for (const hand of preset.hands) {
        for (const combo of expandHandCombos(hand, dead)) {
          for (const c of combo) {
            expect(dead.some(d => d.rank === c.rank && d.suit === c.suit)).toBe(false);
          }
        }
      }
    }
  });
});
