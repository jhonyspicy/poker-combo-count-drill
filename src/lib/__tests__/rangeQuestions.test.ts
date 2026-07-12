import { describe, it, expect } from 'vitest';
import {
  RANGE_PATTERNS,
  buildRangeQuestionData,
  cellCombos,
  cellLabel,
  pickSingleHandPattern,
} from '../rangeQuestions';

describe('rangeQuestions', () => {
  it('全セルのコンボ数合計は 1326（総コンボ数）', () => {
    let total = 0;
    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < 13; j++) {
        total += cellCombos(i, j);
      }
    }
    expect(total).toBe(1326);
  });

  it('セルのラベルは169個すべてユニーク', () => {
    const labels = new Set<string>();
    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < 13; j++) {
        labels.add(cellLabel(i, j));
      }
    }
    expect(labels.size).toBe(169);
  });

  it('代表セルのラベル（対角=ペア / 右上=s / 左下=o）', () => {
    expect(cellLabel(0, 0)).toBe('AA');
    expect(cellLabel(0, 1)).toBe('AKs');
    expect(cellLabel(1, 0)).toBe('AKo');
    expect(cellLabel(12, 12)).toBe('22');
  });

  // 各パターンの期待コンボ数（ドメイン知識から手計算した値）
  const EXPECTED: Record<string, number> = {
    suited: 312, // 78タイプ × 4
    offsuit: 936, // 78タイプ × 12
    pairs: 78, // 13ランク × 6
    'broadway-pairs': 30, // AA〜TT の5ランク × 6
    'ace-hands': 198, // AA(6) + Axs 12タイプ×4 + Axo 12タイプ×12
    all: 1326, // 全ハンド = 総コンボ数
  };

  it.each(RANGE_PATTERNS.map(p => [p.id, p] as const))(
    'パターン %s の答えが正しい',
    (id, pattern) => {
      const data = buildRangeQuestionData(pattern);
      expect(EXPECTED[id]).toBeDefined();
      expect(data.answer).toBe(EXPECTED[id]);
      expect(data.cells).toHaveLength(169);
      // ハイライトされたセルのコンボ数合計と答えが一致することも検算
      let sum = 0;
      data.cells.forEach((cell, idx) => {
        if (cell.hit) sum += cellCombos(Math.floor(idx / 13), idx % 13);
      });
      expect(sum).toBe(data.answer);
    }
  );

  it('単一ハンドパターンの答えは 4 / 6 / 12 / 16 のいずれか', () => {
    for (let n = 0; n < 50; n++) {
      const data = buildRangeQuestionData(pickSingleHandPattern());
      expect([4, 6, 12, 16]).toContain(data.answer);
      // ハイライトはペア/スーテッド/オフスートで1セル、合計（s+o）で2セル
      const hitCount = data.cells.filter(c => c.hit).length;
      expect([1, 2]).toContain(hitCount);
    }
  });

});
