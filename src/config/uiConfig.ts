import type { Suit } from '../lib/comboCalculator';

// 4色デッキ（true: スートごとに4色 / false: 赤黒の2色）
export const FOUR_COLOR_DECK = true;

// スートの表示色（4色デッキ）
const SUIT_COLORS_FOUR: Record<Suit, string> = {
  s: '#1c2430',
  h: '#c92a3b',
  d: '#1f66d0',
  c: '#1e8a4c',
};

// スートの表示色（2色デッキ）
const SUIT_COLORS_TWO: Record<Suit, string> = {
  s: '#1c2430',
  h: '#c92a3b',
  d: '#c92a3b',
  c: '#1c2430',
};

export const SUIT_COLORS: Record<Suit, string> =
  FOUR_COLOR_DECK ? SUIT_COLORS_FOUR : SUIT_COLORS_TWO;

// テーブルフェルトの配色（明→暗のグラデーション用3段階）
export const FELT_COLORS = {
  light: '#28855a',
  base: '#1d6b45',
  dark: '#134a31',
};

// レンジ表パネルの配色
export const RANGE_GRID_COLORS = {
  highlightBg: '#f5b83d', // 出題エリアのセル
  highlightFg: '#241a04',
  cellBg: '#1a2338', // エリア外のセル
  cellFg: '#5a668a',
  panelBg: '#111a2e', // パネルの背景
  panelBorder: '#263252', // パネルの枠線
  headerFg: '#7d8aa8', // 見出し・凡例の文字色
};
