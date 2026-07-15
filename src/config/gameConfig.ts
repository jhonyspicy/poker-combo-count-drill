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

// 上級問題: 4択の分散を決めるゾーン比率境界（昇順・0〜1）。
// 相手レンジの総コンボ数（デッドカード除外後）に掛けてゾーン境界を導出し、
// 4択は「正解 + 正解が属さない3ゾーンから1つずつ」で 0〜総コンボ数の全域に分散させる。
// 目的は「自分のハンドが相手レンジに対してどのくらい強いか」の相対感覚を問うことなので、
// 近傍値の誤差ではなくオーダーの違いを問える分散にする（プレイ感を見て調整する前提の初期値）
export const ADVANCED_CHOICE_ZONE_RATIOS = [0.07, 0.27, 0.53];

// 上級問題: 問題として成立する総コンボ数の下限。これ未満だと4ゾーンに分割できない
// 恐れがあるため候補を再抽選する（実プリセットではまず発生しない安全弁）
export const ADVANCED_MIN_RANGE_TOTAL = 20;

export interface ChoiceZone {
  min: number;
  max: number;
}

// 総コンボ数から4択用の4ゾーン（整数区間）を導出する。
// 隣接ゾーンは重複せず、0〜total の全整数がちょうど1つのゾーンに属する。
// total が ADVANCED_MIN_RANGE_TOTAL 以上であることを前提とする
export function advancedChoiceZones(total: number): ChoiceZone[] {
  // 境界は単調増加を強制する（極小 total でもゾーンが空にならないように）
  const bounds: number[] = [];
  for (let i = 0; i < ADVANCED_CHOICE_ZONE_RATIOS.length; i++) {
    const scaled = Math.round(total * ADVANCED_CHOICE_ZONE_RATIOS[i]);
    bounds.push(Math.max(scaled, i === 0 ? 1 : bounds[i - 1] + 1));
  }
  const mins = [0, ...bounds];
  return mins.map((min, i) => ({
    min,
    max: i < bounds.length ? bounds[i] - 1 : total,
  }));
}

// 負けコンボ数（0〜total）が属するゾーンのインデックスを返す
export function advancedZoneIndex(count: number, total: number): number {
  const zones = advancedChoiceZones(total);
  const index = zones.findIndex(z => count >= z.min && count <= z.max);
  // total を超える値は理論上来ないが、来ても最上位ゾーンに落とす
  return index === -1 ? zones.length - 1 : index;
}

// 上級問題: 目標ゾーン狙いの再抽選の上限回数（超えたら最後の候補を採用する）
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
