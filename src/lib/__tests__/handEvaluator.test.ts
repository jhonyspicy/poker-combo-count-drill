import { describe, it, expect } from 'vitest';
import type { Card } from '../comboCalculator';
import { evaluate5, evaluateBest, handCategoryName } from '../handEvaluator';

// "As Kh ..." 形式の文字列からカード配列を作るヘルパー
function cards(spec: string): Card[] {
  return spec.split(' ').map(s => ({ rank: s[0], suit: s[1] }) as Card);
}

describe('evaluate5: 役カテゴリの順序', () => {
  const handsWeakToStrong: [string, string][] = [
    ['ハイカード', 'As Kh 9d 5c 2s'],
    ['ワンペア', 'As Ah 9d 5c 2s'],
    ['ツーペア', 'As Ah 9d 9c 2s'],
    ['スリーカード', 'As Ah Ad 5c 2s'],
    ['ストレート', '9s 8h 7d 6c 5s'],
    ['フラッシュ', 'As Ks 9s 5s 2s'],
    ['フルハウス', 'As Ah Ad 5c 5s'],
    ['フォーカード', 'As Ah Ad Ac 2s'],
    ['ストレートフラッシュ', '9s 8s 7s 6s 5s'],
  ];

  it('弱い役 → 強い役の順にスコアが単調増加する', () => {
    const scores = handsWeakToStrong.map(([, spec]) => evaluate5(cards(spec)));
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    }
  });

  it('スコアから役カテゴリ名を復元できる', () => {
    for (const [name, spec] of handsWeakToStrong) {
      expect(handCategoryName(evaluate5(cards(spec)))).toBe(name);
    }
  });
});

describe('evaluate5: 同カテゴリのタイブレーク', () => {
  it('ペアのランクが高い方が強い', () => {
    expect(evaluate5(cards('As Ah 9d 5c 2s'))).toBeGreaterThan(
      evaluate5(cards('Ks Kh 9d 5c 2s'))
    );
  });

  it('同じペアならキッカーが高い方が強い', () => {
    expect(evaluate5(cards('Ks Kh Ad 5c 2s'))).toBeGreaterThan(
      evaluate5(cards('Kd Kc Qd 5h 2h'))
    );
  });

  it('ツーペアは上のペア → 下のペア → キッカーの順で比較される', () => {
    // 上のペアが同じ（A）なら下のペアで比較
    expect(evaluate5(cards('As Ah 9d 9c 2s'))).toBeGreaterThan(
      evaluate5(cards('Ad Ac 8d 8c Ks'))
    );
    // 両ペアが同じならキッカーで比較
    expect(evaluate5(cards('As Ah 9d 9c Ks'))).toBeGreaterThan(
      evaluate5(cards('Ad Ac 9h 9s Qs'))
    );
  });

  it('ストレートはハイカードで比較される', () => {
    expect(evaluate5(cards('Ts 9h 8d 7c 6s'))).toBeGreaterThan(
      evaluate5(cards('9s 8h 7d 6c 5s'))
    );
  });

  it('フラッシュは5枚全体で比較される', () => {
    expect(evaluate5(cards('As Ks 9s 5s 2s'))).toBeGreaterThan(
      evaluate5(cards('Ah Kh 8h 5h 2h'))
    );
  });

  it('同じ構成のハンドはスートが違っても同スコア', () => {
    expect(evaluate5(cards('As Ah 9d 5c 2s'))).toBe(evaluate5(cards('Ad Ac 9h 5s 2h')));
  });
});

describe('evaluate5: ホイール（A-2-3-4-5）', () => {
  it('5ハイのストレートとして評価される', () => {
    expect(handCategoryName(evaluate5(cards('As 2h 3d 4c 5s')))).toBe('ストレート');
  });

  it('6ハイのストレートより弱い', () => {
    expect(evaluate5(cards('6s 5h 4d 3c 2s'))).toBeGreaterThan(
      evaluate5(cards('As 2h 3d 4c 5s'))
    );
  });

  it('A-K-Q-J-T はAハイのストレートとして最強', () => {
    expect(evaluate5(cards('As Kh Qd Jc Ts'))).toBeGreaterThan(
      evaluate5(cards('Ks Qh Jd Tc 9s'))
    );
  });

  it('スーテッドのホイールはストレートフラッシュになる', () => {
    expect(handCategoryName(evaluate5(cards('As 2s 3s 4s 5s')))).toBe('ストレートフラッシュ');
  });
});

describe('evaluateBest: 6〜7枚からの最強役', () => {
  it('7枚から最強の5枚役を選ぶ（フラッシュ優先）', () => {
    // ペア（9）もあるがハートのフラッシュが最強
    const score = evaluateBest(cards('Ah Kh 9h 5h 2h 9s Ks'));
    expect(handCategoryName(score)).toBe('フラッシュ');
  });

  it('6枚（ターン相当）からの評価', () => {
    // ボード4枚 + ハンド2枚でストレート
    const score = evaluateBest(cards('9s 8h 7d 6c Ah 5s'));
    expect(handCategoryName(score)).toBe('ストレート');
  });

  it('5枚はそのまま評価される', () => {
    expect(evaluateBest(cards('As Ah 9d 5c 2s'))).toBe(evaluate5(cards('As Ah 9d 5c 2s')));
  });
});

describe('evaluateBest: ボードプレイ（チョップ）', () => {
  it('ボード5枚が最強なら異なるハンドでも同スコアになる', () => {
    const board = cards('As Ks Qs Js Ts'); // ボードでロイヤルフラッシュ
    const hero = cards('2h 3h');
    const villain = cards('9d 9c');
    expect(evaluateBest([...board, ...hero])).toBe(evaluateBest([...board, ...villain]));
  });
});
