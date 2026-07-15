// 難易度モードと制限時間の設定。
// 難易度に関わる数値はすべてこのファイルに集約する（プレイ感を見て調整する前提の初期値）。

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Street = 'flop' | 'turn' | 'river';

// 問題タイプ（難易度と1対1対応。3要素の組み合わせを表す）
// beginner-range: レンジ表+文章 / board-count: ボード+文章 / range-vs-board: レンジ表+ボード+文章
export type QuestionType = 'beginner-range' | 'board-count' | 'range-vs-board';

export const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export interface DifficultyConfig {
  label: string;
  // トップページのボタンに添える出題内容の一言説明
  description: string;
  baseTimeSec: number;
  // ボードあり問題のストリート別加算秒（枚数が多いほど数えるのに時間がかかる）
  streetTimeBonusSec: Record<Street, number>;
  // 正解1回ごとの制限時間短縮係数
  timeScaleFactor: number;
  // 制限時間の下限（(基準+加算) に対する比率）
  timeFloorRatio: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  beginner: {
    label: '初級編',
    description: 'レンジ表でコンボ数の基礎を鍛える',
    baseTimeSec: 12,
    streetTimeBonusSec: { flop: 0, turn: 0, river: 0 },
    timeScaleFactor: 0.95,
    timeFloorRatio: 0.5,
  },
  intermediate: {
    label: '中級編',
    description: 'ボードのデッドカードを考慮してカウント',
    baseTimeSec: 30,
    streetTimeBonusSec: { flop: 0, turn: 6, river: 10 },
    timeScaleFactor: 0.95,
    timeFloorRatio: 0.5,
  },
  advanced: {
    label: '上級編',
    description: '相手のレンジ×ボードで負けコンボをカウント',
    baseTimeSec: 45,
    streetTimeBonusSec: { flop: 0, turn: 8, river: 12 },
    timeScaleFactor: 0.95,
    timeFloorRatio: 0.5,
  },
};

// 中級・上級問題: 自分のハンド（中級は出題対象ハンドも）を選出するプリセットレンジの id
export const HERO_RANGE_ID = 'open-range';
// 中級問題: 出題条件（デッドカードが絡むハンドが存在する）を満たすまでの再抽選の上限回数
export const INTERMEDIATE_RETRY_LIMIT = 10;

// 上級問題: 4択のコンボ数帯（バケット）の境界値（昇順・上限は各帯に含む）。
// [10, 40, 80] なら「0〜10 / 11〜40 / 41〜80 / 81以上」の4帯になる。
// 実戦では正確なカウントより「負けている可能性のオーダー」を掴むことが重要なので、
// 選択肢は近傍値ではなく大きく離れた帯にする
export const ADVANCED_CHOICE_BUCKET_BOUNDS = [10, 40, 80];

export interface ChoiceBucket {
  min: number;
  max: number | null; // null = 上限なし（最上位帯「N以上」）
  label: string;
}

// 境界値から4択の帯を導出する（ラベル・判定をハードコードしない）
export const ADVANCED_CHOICE_BUCKETS: ChoiceBucket[] = [
  ...ADVANCED_CHOICE_BUCKET_BOUNDS.map((bound, i) => {
    const min = i === 0 ? 0 : ADVANCED_CHOICE_BUCKET_BOUNDS[i - 1] + 1;
    return { min, max: bound, label: `${min}〜${bound}` };
  }),
  {
    min: ADVANCED_CHOICE_BUCKET_BOUNDS[ADVANCED_CHOICE_BUCKET_BOUNDS.length - 1] + 1,
    max: null,
    label: `${ADVANCED_CHOICE_BUCKET_BOUNDS[ADVANCED_CHOICE_BUCKET_BOUNDS.length - 1] + 1}以上`,
  },
];

// 負けコンボ数（0以上）が属する帯のインデックスを返す
export function advancedBucketIndex(count: number): number {
  return ADVANCED_CHOICE_BUCKETS.findIndex(b => b.max === null || count <= b.max);
}

// 上級問題: 目標バケット狙いの再抽選の上限回数（超えたら最後の候補を採用する）
export const ADVANCED_RETRY_LIMIT = 40;
// 上級問題: 序盤ヒント（負けセルの二重ハイライト）を表示する問題数。
// 連続正解数がこの値未満の間だけレンジ表に負けセルが表示される
export const ADVANCED_HINT_QUESTIONS = 10;

// ルートパラメータ等の文字列が難易度として正当かを判定する
export function isDifficulty(value: string | undefined): value is Difficulty {
  return value === 'beginner' || value === 'intermediate' || value === 'advanced';
}

// 制限時間 = (基準時間 + ストリート別加算) × 短縮係数^連続正解数。下限でクリップする
export function getTimeLimitSec(
  difficulty: Difficulty,
  street: Street | null,
  streak: number
): number {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const base = cfg.baseTimeSec + (street ? cfg.streetTimeBonusSec[street] : 0);
  const scaled = base * Math.pow(cfg.timeScaleFactor, streak);
  return Math.max(base * cfg.timeFloorRatio, scaled);
}
