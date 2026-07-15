import { describe, it, expect } from 'vitest';
import type { Card } from '../comboCalculator';
import { RANKS } from '../comboCalculator';
import type { PresetRange } from '../presetRanges';
import { PRESET_RANGES, getPresetRange, expandHandCombos } from '../presetRanges';
import {
  advancedChoiceZones, advancedZoneIndex, HERO_RANGE_ID,
} from '../../config/gameConfig';
import { advancedChoices, countRangeVsHero, generateQuestion } from '../questions';

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
    // 負けコンボを含むハンドタイプ: AA/AKs/AKo（QQ は全コンボ勝ち）
    expect(result.loseHands).toEqual(new Set(['AA', 'AKs', 'AKo']));
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

  it('4択はラベル重複なしで正解フラグがちょうど1つ', () => {
    for (const difficulty of ['beginner', 'intermediate', 'advanced'] as const) {
      for (let i = 0; i < 10; i++) {
        const q = generateQuestion(difficulty);
        expect(q.choices).toHaveLength(4);
        expect(new Set(q.choices.map(c => c.label)).size).toBe(4);
        expect(q.choices.filter(c => c.correct)).toHaveLength(1);
      }
    }
  });

  it('初級・中級の正解ラベルは answer の数値と一致する', () => {
    for (const difficulty of ['beginner', 'intermediate'] as const) {
      for (let i = 0; i < 10; i++) {
        const q = generateQuestion(difficulty);
        expect(q.choices.find(c => c.correct)!.label).toBe(String(q.answer));
      }
    }
  });
});

// 問題文の「相手のレンジ: <名前>」からプリセットを逆引きする
function opponentPreset(text: string): PresetRange {
  const name = text.match(/相手のレンジ: (.+)/)![1];
  return PRESET_RANGES.find(p => p.name === name)!;
}

describe('generateQuestion: 上級は負けコンボ数を問い、自分のハンドはオープンレンジから選ぶ', () => {
  const heroRange = getPresetRange(HERO_RANGE_ID);

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

});

describe('advancedChoices: 総コンボ数に応じて分散させた数値4択', () => {
  it('4値は相異なり昇順で、正解 = 実際の負けコンボ数が含まれる', () => {
    for (let i = 0; i < 100; i++) {
      const total = 20 + Math.floor(Math.random() * 400);
      const answer = Math.floor(Math.random() * (total + 1));
      const choices = advancedChoices(answer, total);
      const values = choices.map(c => Number(c.label));
      expect(values).toHaveLength(4);
      expect(new Set(values).size).toBe(4);
      expect([...values].sort((a, b) => a - b)).toEqual(values);
      const correct = choices.filter(c => c.correct);
      expect(correct).toHaveLength(1);
      expect(Number(correct[0].label)).toBe(answer);
    }
  });

  it('誤答3つは正解が属さない3ゾーンに1つずつ属する', () => {
    for (let i = 0; i < 100; i++) {
      const total = 20 + Math.floor(Math.random() * 400);
      const answer = Math.floor(Math.random() * (total + 1));
      const choices = advancedChoices(answer, total);
      const wrongZones = choices
        .filter(c => !c.correct)
        .map(c => advancedZoneIndex(Number(c.label), total));
      const answerZone = advancedZoneIndex(answer, total);
      expect(new Set(wrongZones).size).toBe(3);
      expect(wrongZones).not.toContain(answerZone);
    }
  });

  it('総コンボ数 150 では選択肢が 0〜150 の全域（4ゾーン）に分散する', () => {
    const zones = advancedChoiceZones(150);
    for (let i = 0; i < 20; i++) {
      const choices = advancedChoices(27, 150);
      const values = choices.map(c => Number(c.label));
      // 4ゾーンそれぞれに1値ずつ落ちる（例: 3 / 27 / 67 / 129 のような分散）
      zones.forEach((zone, zi) => {
        expect(values.filter(v => v >= zone.min && v <= zone.max)).toHaveLength(1);
        expect(advancedZoneIndex(values[zi], 150)).toBe(zi);
      });
    }
  });

  it('負けコンボ数 0 でも正解 0 を含む4択として成立する', () => {
    for (let i = 0; i < 20; i++) {
      const choices = advancedChoices(0, 150);
      const values = choices.map(c => Number(c.label));
      expect(values[0]).toBe(0);
      expect(choices[0].correct).toBe(true);
      expect(new Set(values).size).toBe(4);
    }
  });
});

describe('generateQuestion: 上級の数値4択', () => {
  it('選択肢は昇順の数値4つで、正解フラグは答えの数値にのみ立つ', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('advanced');
      const values = q.choices.map(c => Number(c.label));
      expect(new Set(values).size).toBe(4);
      expect([...values].sort((a, b) => a - b)).toEqual(values);
      q.choices.forEach(c => {
        expect(c.correct).toBe(Number(c.label) === q.answer);
      });
    }
  });

  it('正解のゾーンは特定のゾーンに固定されない（目標ゾーン再抽選の検証）', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 60 && seen.size < 2; i++) {
      const q = generateQuestion('advanced');
      const counts = countRangeVsHero(opponentPreset(q.text), q.board!, q.hero!);
      seen.add(advancedZoneIndex(q.answer, counts.total));
    }
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });
});

describe('generateQuestion: 上級の負けセルフラグ（序盤ヒント用）', () => {
  it('負けセルはすべてレンジ内で、フラグの有無がハンドタイプごとの負け判定と一致する', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion('advanced');
      for (const cell of q.rangeCells!) {
        if (cell.lose) expect(cell.hit).toBe(true);
        if (!cell.hit) continue;
        // セル単体で勝敗を数え直し、負けコンボの有無とフラグを照合する
        const single: PresetRange = { id: 'cell', name: 'セル', hands: [cell.label] };
        const counts = countRangeVsHero(single, q.board!, q.hero!);
        expect(!!cell.lose).toBe(counts.lose > 0);
      }
    }
  });

  it('負けセルごとの負けコンボ数の合計が答えと一致する（検算）', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion('advanced');
      let sum = 0;
      for (const cell of q.rangeCells!) {
        if (!cell.lose) continue;
        const single: PresetRange = { id: 'cell', name: 'セル', hands: [cell.label] };
        sum += countRangeVsHero(single, q.board!, q.hero!).lose;
      }
      expect(sum).toBe(q.answer);
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
