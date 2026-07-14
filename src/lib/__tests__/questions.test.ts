import { describe, it, expect } from 'vitest';
import type { Card } from '../comboCalculator';
import { RANKS } from '../comboCalculator';
import type { PresetRange } from '../presetRanges';
import { PRESET_RANGES, getPresetRange, expandHandCombos } from '../presetRanges';
import { HERO_RANGE_ID } from '../../config/gameConfig';
import { countRangeVsHero, generateQuestion } from '../questions';

function cards(spec: string): Card[] {
  return spec.split(' ').map(s => ({ rank: s[0], suit: s[1] }) as Card);
}

// カード2枚をハンドタイプ表記（AA / AKs / AKo。高いランクが先）に直す
function toHandLabel(hand: Card[]): string {
  const [a, b] = [...hand].sort((x, y) => RANKS.indexOf(y.rank) - RANKS.indexOf(x.rank));
  if (a.rank === b.rank) return `${a.rank}${b.rank}`;
  return `${a.rank}${b.rank}${a.suit === b.suit ? 's' : 'o'}`;
}

describe('countRangeVsHero: 勝敗カウント（手計算と照合）', () => {
  it('ボード A♠K♥2♦・ハンド K♠9♥ vs {AA, AKs, AKo, QQ}', () => {
    // 自分: Kのワンペア（K♠ + ボードK♥）
    // AA: 残りA 3枚 → C(3,2)=3 コンボ、すべてトリップス → 負け3
    // AKs: A♦K♦・A♣K♣ の2コンボ、ツーペア → 負け2
    // AKo: 残りA3 × 残りK2 = 6 − スーテッド2 = 4 コンボ、ツーペア → 負け4
    // QQ: 6コンボ、Qのワンペア → 勝ち6
    const range: PresetRange = { id: 'test', name: 'テスト', hands: ['AA', 'AKs', 'AKo', 'QQ'] };
    const result = countRangeVsHero(range, cards('As Kh 2d'), cards('Ks 9h'));
    expect(result.lose).toBe(9);
    expect(result.win).toBe(6);
    expect(result.chop).toBe(0);
    expect(result.total).toBe(15);
  });

  it('デッドカードの除外: 自分が A を持っていると AA のコンボが減る', () => {
    // dead: A♠(ボード) A♥(ハンド) → 残りA 2枚 → C(2,2)=1 コンボのみ
    const range: PresetRange = { id: 'test', name: 'テスト', hands: ['AA'] };
    const result = countRangeVsHero(range, cards('As Kh 2d'), cards('Ah 5c'));
    expect(result.total).toBe(1);
    // 相手AAはトリップス、自分はAのワンペア → 負け1
    expect(result.lose).toBe(1);
  });

  it('チョップは勝ち負けどちらにも数えない（ボードプレイ）', () => {
    // ボードがロイヤルフラッシュ → 全コンボがボードプレイで引き分け
    const range: PresetRange = { id: 'test', name: 'テスト', hands: ['22'] };
    const result = countRangeVsHero(range, cards('As Ks Qs Js Ts'), cards('2h 3h'));
    expect(result.lose).toBe(0);
    expect(result.win).toBe(0);
    expect(result.chop).toBe(3); // 2♥がデッドなので残り3枚から C(3,2)=3
  });

  it('リバー（7枚評価）でも正しく比較される', () => {
    // ボード: 9♠8♠7♦6♣2♥、自分: T♥T♦（Tのオーバーペア...ではなくT-9-8-7-6のストレート）
    // 相手 55: 9-8-7-6-5 のストレート（5ハイ側）→ 自分のTハイストレートが勝つ
    const range: PresetRange = { id: 'test', name: 'テスト', hands: ['55'] };
    const result = countRangeVsHero(range, cards('9s 8s 7d 6c 2h'), cards('Th Td'));
    expect(result.total).toBe(6);
    expect(result.win).toBe(6);
    expect(result.lose).toBe(0);
  });
});

describe('generateQuestion: 難易度ごとの3要素構成', () => {
  it('初級: レンジ表と文章を持ち、ボードは持たない', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('beginner');
      expect(q.type).toBe('beginner-range');
      expect(q.rangeCells).toHaveLength(169);
      expect(q.text.length).toBeGreaterThan(0);
      expect(q.board).toBeUndefined();
    }
  });

  it('中級: ボード・自分のハンド・文章を持ち、レンジ表は持たない', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('intermediate');
      expect(q.type).toBe('board-count');
      expect([3, 4, 5]).toContain(q.board!.length);
      expect(q.hero).toHaveLength(2);
      expect(q.street).toBeDefined();
      expect(q.rangeCells).toBeUndefined();
    }
  });

  it('上級: レンジ表・ボード・自分のハンド・文章のすべてを持つ', () => {
    for (let i = 0; i < 10; i++) {
      const q = generateQuestion('advanced');
      expect(q.type).toBe('range-vs-board');
      expect(q.rangeCells).toHaveLength(169);
      expect(q.rangeLabel).toBe('相手のレンジ');
      expect([3, 4, 5]).toContain(q.board!.length);
      expect(q.hero).toHaveLength(2);
    }
  });

  it('中級のハンド表記は高いランクが先（例: A8o であって 8Ao ではない）', () => {
    const order = 'AKQJT98765432'; // 強い順
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion('intermediate');
      const label = q.handLabel!;
      if (label[0] !== label[1]) {
        expect(order.indexOf(label[0])).toBeLessThan(order.indexOf(label[1]));
      }
    }
  });

  it('4択は重複なしで正解を含む', () => {
    for (const difficulty of ['beginner', 'intermediate', 'advanced'] as const) {
      for (let i = 0; i < 10; i++) {
        const q = generateQuestion(difficulty);
        expect(q.choices).toHaveLength(4);
        expect(new Set(q.choices).size).toBe(4);
        expect(q.choices).toContain(q.answer);
      }
    }
  });
});

describe('generateQuestion: 上級は負けコンボ数を問い、自分のハンドはオープンレンジから選ぶ', () => {
  const heroRange = getPresetRange(HERO_RANGE_ID);

  // 問題文の「相手のレンジ: <名前>」からプリセットを逆引きする
  function opponentPreset(text: string): PresetRange {
    const name = text.match(/相手のレンジ: (.+)/)![1];
    return PRESET_RANGES.find(p => p.name === name)!;
  }

  it('出題文は「何コンボに負けていますか？」に統一される', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion('advanced');
      expect(q.text).toContain('あなたは何コンボに負けていますか？');
      expect(q.text).not.toContain('勝って');
    }
  });

  it('自分のハンドはオープンレンジ内のハンドタイプに該当する', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion('advanced');
      expect(heroRange.hands).toContain(toHandLabel(q.hero!));
    }
  });

  it('答えは自分の役より強いレンジ内コンボ数と一致する（検算）', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion('advanced');
      const counts = countRangeVsHero(opponentPreset(q.text), q.board!, q.hero!);
      expect(q.answer).toBe(counts.lose);
    }
  });

  it('答えは許容範囲（1〜60）に収まる', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion('advanced');
      expect(q.answer).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBeLessThanOrEqual(60);
    }
  });
});

describe('generateQuestion: 中級はレンジ選出とデッドカード関連性を保証する', () => {
  const preset = getPresetRange(HERO_RANGE_ID);

  it('自分のハンドと出題対象ハンドはどちらもレンジに含まれる', () => {
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion('intermediate');
      expect(preset.hands).toContain(toHandLabel(q.hero!));
      expect(preset.hands).toContain(q.handLabel!);
    }
  });

  it('出題対象ハンドのランクがデッドカードに含まれ、答えは素のコンボ数（6/4/12）より小さい', () => {
    const fullCount = { pair: 6, suited: 4, offsuit: 12 };
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion('intermediate');
      const dead = [...q.board!, ...q.hero!];
      const label = q.handLabel!;
      const deadRankCount = dead.filter(c => c.rank === label[0] || c.rank === label[1]).length;
      expect(deadRankCount).toBeGreaterThanOrEqual(1);
      const kind = label.length === 2 ? 'pair' : label[2] === 's' ? 'suited' : 'offsuit';
      expect(q.answer).toBeLessThan(fullCount[kind]);
    }
  });

  it('答えは常に1以上で、デッドカード除外のコンボ展開数と一致する（検算）', () => {
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion('intermediate');
      const dead = [...q.board!, ...q.hero!];
      expect(q.answer).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBe(expandHandCombos(q.handLabel!, dead).length);
    }
  });

  it('ボード・自分のハンドに重複カードはない', () => {
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion('intermediate');
      const all = [...q.board!, ...q.hero!].map(c => `${c.rank}${c.suit}`);
      expect(new Set(all).size).toBe(all.length);
    }
  });
});
