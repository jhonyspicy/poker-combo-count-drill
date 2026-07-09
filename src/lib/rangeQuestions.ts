// レンジ表（13×13グリッド）問題のパターン定義と計算ロジック。
// 答えは必ずロジックで計算する（問題データに答えをハードコードしない）。

// レンジ表のランク並び（左上が A）。comboCalculator の RANKS とは逆順なので注意
export const GRID_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export interface RangeCell {
  label: string; // ハンド表記（AA / AKs / AKo など）
  hit: boolean; // 出題エリアに含まれるか
}

export interface RangePattern {
  id: string;
  label: string; // 問題文
  // グリッド座標 (i=行, j=列) が出題エリアに含まれるか。
  // i === j: ペア / i < j: スーテッド（右上） / i > j: オフスート（左下）
  test: (i: number, j: number) => boolean;
}

export const RANGE_PATTERNS: RangePattern[] = [
  {
    id: 'suited',
    label: 'スーテッドハンドは全部で何コンボ？\n（AKs〜32s など）',
    test: (i, j) => i < j,
  },
  {
    id: 'offsuit',
    label: 'オフスートハンドは全部で何コンボ？\n（AKo〜32o など）',
    test: (i, j) => i > j,
  },
  {
    id: 'pairs',
    label: 'ポケットペアは全部で何コンボ？\n（AA〜22）',
    test: (i, j) => i === j,
  },
  {
    id: 'broadway-pairs',
    label: 'ブロードウェイペアは何コンボ？\n（AA・KK・QQ・JJ・TT）',
    test: (i, j) => i === j && i <= 4,
  },
  {
    id: 'adjacent-suited',
    label: '隣接ランクのスーテッドは何コンボ？\n（AKs・KQs・QJs…32s）',
    test: (i, j) => j === i + 1,
  },
  {
    id: 'ace-hands',
    label: 'Aを含むハンドは全部で何コンボ？\n（AA・AKs・AKo など）',
    test: (i, j) => i === 0 || j === 0,
  },
  {
    id: 'suited-connectors',
    label: 'スーテッドコネクター（98s〜54s）は\n何コンボ？',
    test: (i, j) => j === i + 1 && i >= 5 && i <= 9,
  },
];

// セル1マスのコンボ数（対角=ペア6 / 右上=スーテッド4 / 左下=オフスート12）
export function cellCombos(i: number, j: number): number {
  if (i === j) return 6;
  return i < j ? 4 : 12;
}

// セルのハンド表記。右上（i<j）は s、左下（i>j）は o
export function cellLabel(i: number, j: number): string {
  if (i === j) return GRID_RANKS[i] + GRID_RANKS[i];
  return i < j
    ? GRID_RANKS[i] + GRID_RANKS[j] + 's'
    : GRID_RANKS[j] + GRID_RANKS[i] + 'o';
}

export interface RangeQuestionData {
  pattern: RangePattern;
  cells: RangeCell[]; // 169セル（行優先）
  answer: number;
  explanation: string;
}

// パターンを評価して、グリッドのセル一覧・答え・解説を作る
export function buildRangeQuestionData(pattern: RangePattern): RangeQuestionData {
  let pairTypes = 0;
  let suitedTypes = 0;
  let offsuitTypes = 0;
  const cells: RangeCell[] = [];

  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      const hit = pattern.test(i, j);
      if (hit) {
        if (i === j) pairTypes++;
        else if (i < j) suitedTypes++;
        else offsuitTypes++;
      }
      cells.push({ label: cellLabel(i, j), hit });
    }
  }

  const answer = pairTypes * 6 + suitedTypes * 4 + offsuitTypes * 12;

  // エリア内のタイプ数 × タイプごとのコンボ数で解説を組み立てる
  const parts: string[] = [];
  if (pairTypes > 0) parts.push(`ペア ${pairTypes}タイプ × 6`);
  if (suitedTypes > 0) parts.push(`スーテッド ${suitedTypes}タイプ × 4`);
  if (offsuitTypes > 0) parts.push(`オフスート ${offsuitTypes}タイプ × 12`);
  const explanation = `${parts.join(' + ')} = ${answer} コンボ`;

  return { pattern, cells, answer, explanation };
}

export function pickRangePattern(): RangePattern {
  return RANGE_PATTERNS[Math.floor(Math.random() * RANGE_PATTERNS.length)];
}
