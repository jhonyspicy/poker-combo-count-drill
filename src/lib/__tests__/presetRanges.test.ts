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
    const test = presetToGridTest(PRESET_RANGES[0]); // tight-open
    expect(test(0, 0)).toBe(true); // AA
    expect(test(0, 12)).toBe(true); // A2s
    expect(test(12, 0)).toBe(false); // A2o はレンジ外
    expect(test(12, 12)).toBe(false); // 22 はレンジ外
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

  it('タイトなオープンレンジは 236 コンボ', () => {
    // ペア10×6 + Axs12×4 + Axo4×12 + BWs6×4 + BWo3×12 + SC5×4 = 236
    expect(presetComboCount(PRESET_RANGES[0], [])).toBe(236);
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
