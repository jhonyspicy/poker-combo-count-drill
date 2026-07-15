// レンジ表（13×13グリッド）問題のパターン定義と計算ロジック。
// 答えは必ずロジックで計算する（問題データに答えをハードコードしない）。

// レンジ表のランク並び（左上が A）。comboCalculator の RANKS とは逆順なので注意
export const GRID_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export interface RangeCell {
  label: string; // ハンド表記（AA / AKs / AKo など）
  hit: boolean; // 出題エリアに含まれるか
  // 上級問題の序盤ヒント用: 自分より強いコンボを1つ以上含むか（レンジ内セルのみ）
  lose?: boolean;
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
    id: 'ace-hands',
    label: 'Aを含むハンドは全部で何コンボ？\n（AA・AKs・AKo など）',
    test: (i, j) => i === 0 || j === 0,
  },
  {
    id: 'all',
    label: '全ハンドの合計（総コンボ数）は\nいくつ？',
    test: () => true,
  },
];

// ---- 単一ハンド問題（ランクをランダムに選んで1〜2セルを問う） ----

// 単一ハンド問題の答えは 4 / 6 / 12 / 16 のいずれかになるため、
// 誤答は近傍値ではなくこれらの取り違えから作る（questions.ts 側で参照）
export const HAND_TYPE_ANSWERS = [4, 6, 12, 16];

function randomInt(n: number): number {
  return Math.floor(Math.random() * n);
}

// ペア / スーテッド / オフスート / 合計（s+o）のいずれかをランダムなランクで生成する
export function pickSingleHandPattern(): RangePattern {
  const kind = (['pair', 'suited', 'offsuit', 'combined'] as const)[randomInt(4)];

  if (kind === 'pair') {
    const i = randomInt(13);
    const r = GRID_RANKS[i];
    return {
      id: `single-pair-${r}`,
      label: `${r}${r} は何コンボ？`,
      test: (a, b) => a === i && b === i,
    };
  }

  // 非ペア: i < j となる2ランクを選ぶ（i が高いランク）
  const i = randomInt(12);
  const j = i + 1 + randomInt(12 - i);
  const r1 = GRID_RANKS[i];
  const r2 = GRID_RANKS[j];

  if (kind === 'suited') {
    return {
      id: `single-suited-${r1}${r2}`,
      label: `${r1}${r2}s は何コンボ？`,
      test: (a, b) => a === i && b === j,
    };
  }
  if (kind === 'offsuit') {
    return {
      id: `single-offsuit-${r1}${r2}`,
      label: `${r1}${r2}o は何コンボ？`,
      test: (a, b) => a === j && b === i,
    };
  }
  return {
    id: `single-combined-${r1}${r2}`,
    label: `${r1}${r2}（スーテッド＋オフスート合計）は\n何コンボ？`,
    test: (a, b) => (a === i && b === j) || (a === j && b === i),
  };
}

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
