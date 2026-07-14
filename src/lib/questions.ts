import type { Card, Rank, Suit } from './comboCalculator';
import {
  RANKS, SUITS, SUIT_SYMBOL, cardToString,
  pairCombos, suitedCombos, offsuitCombos,
} from './comboCalculator';
import type { Difficulty, QuestionType, Street } from '../config/gameConfig';
import {
  ADVANCED_ANSWER_MIN, ADVANCED_ANSWER_MAX, ADVANCED_RETRY_LIMIT,
  INTERMEDIATE_RANGE_ID, INTERMEDIATE_RETRY_LIMIT,
} from '../config/gameConfig';
import type { RangeCell, RangePattern } from './rangeQuestions';
import {
  buildRangeQuestionData, pickRangePattern, pickSingleHandPattern, HAND_TYPE_ANSWERS,
} from './rangeQuestions';
import type { PresetRange } from './presetRanges';
import {
  pickPresetRange, getPresetRange, presetToGridTest, expandPresetCombos,
  expandHandCombos, parseHand,
} from './presetRanges';
import { evaluateBest, handCategoryName } from './handEvaluator';

export interface Question {
  type: QuestionType;
  // リザルト画面用の問題文全文（プレイ画面は下の構造化フィールドから描画する）
  text: string;
  answer: number;
  choices: number[]; // 正解を含む4値（シャッフル済み）
  explanation: string;
  // --- 3要素の出し分け（存在する要素だけをプレイ画面が描画する） ---
  rangeCells?: RangeCell[]; // レンジ表: 169セル（行優先）
  rangeLabel?: string; // レンジパネルの見出し（「レンジ表」/「相手のレンジ」）
  board?: Card[]; // ボード
  hero?: Card[]; // 自分のハンド（2枚）
  street?: Street; // ボードあり問題のストリート（制限時間の加算に使う）
  // --- プレイ画面の問題文描画用 ---
  handLabel?: string; // 中級: 出題対象のハンド表記（例: AA, AKs, AKo）
  advancedKind?: 'lose' | 'win'; // 上級: 負けている / 勝っているコンボを問う
}

// ---- 共通ユーティリティ ----

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const STREETS: Street[] = ['flop', 'turn', 'river'];

function pickStreet(): Street {
  return STREETS[Math.floor(Math.random() * STREETS.length)];
}

function boardSize(street: Street): 3 | 4 | 5 {
  return street === 'flop' ? 3 : street === 'turn' ? 4 : 5;
}

// シャッフルしたデッキからボードと自分のハンド（2枚）を配る
function dealCards(street: Street): { board: Card[]; hero: Card[] } {
  const size = boardSize(street);
  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({ rank, suit });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return { board: deck.slice(0, size), hero: deck.slice(size, size + 2) };
}

function cardsString(cards: Card[]): string {
  return cards.map(cardToString).join(' ');
}

// ---- 誤答候補の生成 ----

function generateDistractors(answer: number, ...hints: number[]): number[] {
  const used = new Set<number>([answer]);
  const candidates: number[] = [];

  for (const h of hints) {
    if (h >= 1 && !used.has(h)) {
      candidates.push(h);
      used.add(h);
    }
  }
  for (const delta of [-3, -2, -1, 1, 2, 3]) {
    const v = answer + delta;
    if (v >= 1 && !used.has(v)) {
      candidates.push(v);
      used.add(v);
    }
  }
  // シャッフルして順序をランダム化
  const shuffled = shuffle(candidates);
  // 候補が3つ未満の場合は正解+10から順に補充
  let filler = answer + 10;
  while (shuffled.length < 3) {
    if (!used.has(filler)) { shuffled.push(filler); used.add(filler); }
    filler++;
  }
  return shuffled.slice(0, 3);
}

// 答えの粒度に合わせた間隔で誤答を作る（レンジ表・上級問題用）
function generateSteppedDistractors(answer: number, step: number): number[] {
  const used = new Set<number>([answer]);
  const candidates: number[] = [];
  for (const d of shuffle([-4, -3, -2, -1, 1, 2, 3, 4])) {
    if (candidates.length >= 3) break;
    const v = answer + d * step;
    if (v >= 1 && !used.has(v)) {
      candidates.push(v);
      used.add(v);
    }
  }
  let pad = 1;
  while (candidates.length < 3) {
    const v = answer + step * (4 + pad);
    if (!used.has(v)) { candidates.push(v); used.add(v); }
    pad++;
  }
  return candidates;
}

// レンジ表問題は答えの桁が大きいので、コンボ数の粒度に合わせた間隔にする
function generateRangeDistractors(answer: number): number[] {
  const step = answer < 20 ? 1 : answer <= 100 ? 4 : 12;
  return generateSteppedDistractors(answer, step);
}

// ---- 初級問題（レンジ表 + 文章） ----

// 単一ハンド問題（答えが 4 / 6 / 12 / 16）の誤答は、他のハンドタイプとの取り違えを優先する
function generateBeginnerDistractors(answer: number): number[] {
  if (HAND_TYPE_ANSWERS.includes(answer)) {
    return shuffle(HAND_TYPE_ANSWERS.filter(v => v !== answer));
  }
  return generateRangeDistractors(answer);
}

function makeRangePatternQuestion(pattern: RangePattern, rangeLabel: string): Question {
  const data = buildRangeQuestionData(pattern);
  return {
    type: 'beginner-range',
    text: data.pattern.label,
    answer: data.answer,
    choices: shuffle([data.answer, ...generateBeginnerDistractors(data.answer)]),
    explanation: data.explanation,
    rangeCells: data.cells,
    rangeLabel,
  };
}

// プリセットレンジの合計コンボ数を問う
function makePresetRangeQuestion(): Question {
  const preset = pickPresetRange();
  const pattern: RangePattern = {
    id: `preset-${preset.id}`,
    label: `相手のレンジがレンジ表の通りだとします。\n相手が持ちうるハンドは全部で何コンボ？`,
    test: presetToGridTest(preset),
  };
  return makeRangePatternQuestion(pattern, '相手のレンジ');
}

function makeBeginnerQuestion(): Question {
  const roll = Math.random();
  // 単一ハンド 40% / エリアパターン 40% / プリセットレンジ 20%
  if (roll < 0.4) return makeRangePatternQuestion(pickSingleHandPattern(), 'レンジ表');
  if (roll < 0.8) return makeRangePatternQuestion(pickRangePattern(), 'レンジ表');
  return makePresetRangeQuestion();
}

// ---- 中級問題（ボード + 文章）: デッドカードを考慮したコンボ数カウント ----
// 自分のハンドと出題対象ハンドはプリセットレンジ（初期値: オープンレンジ）から選ぶ。
// 出題対象ハンドは必ずデッドカードとランクが重なるものに限定し、
// 「デッドカードを数えないと解けない問題」だけを出題する。

// レンジ内ハンドタイプを具体カード2枚に展開し、残りデッキからボードを配る
function dealFromRange(preset: PresetRange, street: Street): { board: Card[]; hero: Card[] } {
  const heroHand = preset.hands[Math.floor(Math.random() * preset.hands.length)];
  const combos = expandHandCombos(heroHand, []);
  const hero = [...combos[Math.floor(Math.random() * combos.length)]];

  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      if (!hero.some(c => c.rank === rank && c.suit === suit)) {
        deck.push({ rank, suit });
      }
    }
  }
  return { board: shuffle(deck).slice(0, boardSize(street)), hero };
}

// ハンドタイプの残りコンボ数（デッドカード考慮）
function handComboCount(hand: string, dead: Card[]): number {
  const { high, low, kind } = parseHand(hand);
  if (kind === 'pair') return pairCombos(high, dead);
  if (kind === 'suited') return suitedCombos(high, low, dead);
  return offsuitCombos(high, low, dead);
}

// 出題対象ハンドの候補: レンジ内 かつ 残り1コンボ以上。
// requireDeadRank が true のときは、デッドカードにそのハンドのランクが1枚以上含まれる
// （＝答えが素の 6 / 4 / 12 から必ず減る）ハンドに限定する
function queryHandCandidates(preset: PresetRange, dead: Card[], requireDeadRank: boolean): string[] {
  return preset.hands.filter(hand => {
    const { high, low } = parseHand(hand);
    if (requireDeadRank && !dead.some(c => c.rank === high || c.rank === low)) return false;
    return handComboCount(hand, dead) >= 1;
  });
}

type HandCategory = 'pair' | 'suited' | 'offsuit';

// 候補からカテゴリ重み付きで出題対象ハンドを選ぶ。
// オフスートは引き算の導出練習として最重要なので出題頻度を高くしている
function pickQueryHand(candidates: string[]): string {
  const byCategory: Record<HandCategory, string[]> = { pair: [], suited: [], offsuit: [] };
  for (const hand of candidates) {
    byCategory[parseHand(hand).kind].push(hand);
  }
  // 現行の重み（pair 1 : suited 1 : offsuit 2）を、候補が空でないカテゴリの中で維持する
  const weighted: HandCategory[] = [];
  if (byCategory.pair.length > 0) weighted.push('pair');
  if (byCategory.suited.length > 0) weighted.push('suited');
  if (byCategory.offsuit.length > 0) weighted.push('offsuit', 'offsuit');
  const category = weighted[Math.floor(Math.random() * weighted.length)];
  const pool = byCategory[category];
  return pool[Math.floor(Math.random() * pool.length)];
}

function boardQuestionText(board: Card[], hero: Card[], handLabel: string): string {
  return `ボード: ${cardsString(board)}\nあなたのハンド: ${cardsString(hero)}\n\n相手が ${handLabel} を持っているコンボ数は？`;
}

function makePairQuestion(board: Card[], hero: Card[], street: Street, rank: Rank): Question {
  const dead = [...board, ...hero];
  const answer = pairCombos(rank, dead);
  const deadCount = dead.filter(c => c.rank === rank).length;
  const remaining = 4 - deadCount;

  const distractors = generateDistractors(answer, 6 /* デッドカード考慮漏れの答え */);

  const explanation =
    deadCount === 0
      ? `見えているカードに ${rank} はなし。C(4,2) = ${answer} コンボ`
      : `見えている ${rank} は ${deadCount} 枚。残り ${remaining} 枚から\nC(${remaining},2) = ${answer} コンボ`;

  return {
    type: 'board-count',
    text: boardQuestionText(board, hero, `${rank}${rank}`),
    answer,
    choices: shuffle([answer, ...distractors]),
    explanation,
    board,
    hero,
    street,
    handLabel: `${rank}${rank}`,
  };
}

function makeSuitedQuestion(board: Card[], hero: Card[], street: Street, rank1: Rank, rank2: Rank): Question {
  const dead = [...board, ...hero];
  const answer = suitedCombos(rank1, rank2, dead);

  const aliveSuits: Suit[] = SUITS.filter(s => {
    const r1Dead = dead.some(c => c.rank === rank1 && c.suit === s);
    const r2Dead = dead.some(c => c.rank === rank2 && c.suit === s);
    return !r1Dead && !r2Dead;
  });

  const suitSymbols = aliveSuits.map(s => SUIT_SYMBOL[s]).join('');
  const distractors = generateDistractors(answer, 4 /* デッドカード考慮漏れ */);

  const explanation =
    `両方残っているスーツ: ${suitSymbols || 'なし'} = ${answer} コンボ`;

  return {
    type: 'board-count',
    text: boardQuestionText(board, hero, `${rank1}${rank2}s`),
    answer,
    choices: shuffle([answer, ...distractors]),
    explanation,
    board,
    hero,
    street,
    handLabel: `${rank1}${rank2}s`,
  };
}

function makeOffsuitQuestion(board: Card[], hero: Card[], street: Street, rank1: Rank, rank2: Rank): Question {
  const dead = [...board, ...hero];
  const r1Left = 4 - dead.filter(c => c.rank === rank1).length;
  const r2Left = 4 - dead.filter(c => c.rank === rank2).length;
  const total = r1Left * r2Left;
  const suited = suitedCombos(rank1, rank2, dead);
  const answer = offsuitCombos(rank1, rank2, dead);

  const distractors = generateDistractors(answer, 12 /* デッドカード考慮漏れ */, total, suited);

  // 全体 → スーテッド → オフスート（引き算）の導出順で示す
  const explanation =
    `残り ${rank1}: ${r1Left}枚 × 残り ${rank2}: ${r2Left}枚 = ${total}（全体）\n` +
    `${rank1}${rank2}s = ${suited} コンボ\n` +
    `${rank1}${rank2}o = ${total} − ${suited} = ${answer} コンボ`;

  return {
    type: 'board-count',
    text: boardQuestionText(board, hero, `${rank1}${rank2}o`),
    answer,
    choices: shuffle([answer, ...distractors]),
    explanation,
    board,
    hero,
    street,
    handLabel: `${rank1}${rank2}o`,
  };
}

// 出題対象ハンドの表記からカテゴリに応じた問題を組み立てる
function makeBoardCountQuestion(board: Card[], hero: Card[], street: Street, hand: string): Question {
  const { high, low, kind } = parseHand(hand);
  if (kind === 'pair') return makePairQuestion(board, hero, street, high);
  if (kind === 'suited') return makeSuitedQuestion(board, hero, street, high, low);
  return makeOffsuitQuestion(board, hero, street, high, low);
}

function makeIntermediateQuestion(): Question {
  const preset = getPresetRange(INTERMEDIATE_RANGE_ID);
  let last: { board: Card[]; hero: Card[]; street: Street } | null = null;

  for (let attempt = 0; attempt < INTERMEDIATE_RETRY_LIMIT; attempt++) {
    const street = pickStreet();
    const { board, hero } = dealFromRange(preset, street);
    const candidates = queryHandCandidates(preset, [...board, ...hero], true);
    if (candidates.length > 0) {
      return makeBoardCountQuestion(board, hero, street, pickQueryHand(candidates));
    }
    last = { board, hero, street };
  }

  // 打ち切り（理論上ほぼ到達しない）: デッド関連性の条件を外し、レンジ内で残っている
  // ハンドから出題する。デッドカードは最大7枚でレンジ内のペアを2ランクまでしか
  // 潰せないため、候補は必ず存在する
  const { board, hero, street } = last!;
  const candidates = queryHandCandidates(preset, [...board, ...hero], false);
  return makeBoardCountQuestion(board, hero, street, pickQueryHand(candidates));
}

// ---- 上級問題（レンジ表 + ボード + 文章）: レンジに対する勝敗カウント ----

export interface RangeVsHeroCount {
  lose: number; // 自分より強いコンボ数
  win: number; // 自分より弱いコンボ数
  chop: number; // 引き分け（勝ち負けに数えない）
  total: number; // デッドカード除外後のレンジ内総コンボ数
  heroScore: number;
}

// レンジ内の全コンボと自分の役を比較して数える（上級問題の正解計算の中核。テスト対象）
export function countRangeVsHero(preset: PresetRange, board: Card[], hero: Card[]): RangeVsHeroCount {
  const dead = [...board, ...hero];
  const heroScore = evaluateBest([...board, ...hero]);
  let lose = 0;
  let win = 0;
  let chop = 0;
  for (const combo of expandPresetCombos(preset, dead)) {
    const score = evaluateBest([...board, ...combo]);
    if (score > heroScore) lose++;
    else if (score < heroScore) win++;
    else chop++;
  }
  return { lose, win, chop, total: lose + win + chop, heroScore };
}

function generateAdvancedDistractors(answer: number): number[] {
  const step = answer <= 12 ? 1 : answer <= 30 ? 2 : 4;
  return generateSteppedDistractors(answer, step);
}

interface AdvancedCandidate {
  preset: PresetRange;
  board: Card[];
  hero: Card[];
  street: Street;
  counts: RangeVsHeroCount;
}

function buildAdvancedQuestion(c: AdvancedCandidate, kind: 'lose' | 'win'): Question {
  const answer = kind === 'lose' ? c.counts.lose : c.counts.win;
  const verb = kind === 'lose' ? '負けている' : '勝っている';

  const text =
    `ボード: ${cardsString(c.board)}\nあなたのハンド: ${cardsString(c.hero)}\n` +
    `相手のレンジ: ${c.preset.name}\n\n相手のレンジのうち、あなたが${verb}のは何コンボ？`;

  const explanation =
    `あなたの役: ${handCategoryName(c.counts.heroScore)}\n` +
    `相手のレンジはデッドカードを除いて ${c.counts.total} コンボ。\n` +
    `うち、あなたより強い ${c.counts.lose} / 弱い ${c.counts.win}` +
    (c.counts.chop > 0 ? ` / 引き分け ${c.counts.chop}` : '') +
    ` コンボ`;

  const cells = buildRangeQuestionData({
    id: `preset-${c.preset.id}`,
    label: '',
    test: presetToGridTest(c.preset),
  }).cells;

  return {
    type: 'range-vs-board',
    text,
    answer,
    choices: shuffle([answer, ...generateAdvancedDistractors(answer)]),
    explanation,
    rangeCells: cells,
    rangeLabel: '相手のレンジ',
    board: c.board,
    hero: c.hero,
    street: c.street,
    advancedKind: kind,
  };
}

function inAdvancedRange(answer: number): boolean {
  return answer >= ADVANCED_ANSWER_MIN && answer <= ADVANCED_ANSWER_MAX;
}

function makeAdvancedQuestion(): Question {
  let fallback: AdvancedCandidate | null = null;

  for (let attempt = 0; attempt < ADVANCED_RETRY_LIMIT; attempt++) {
    const street = pickStreet();
    const { board, hero } = dealCards(street);
    const preset = pickPresetRange();
    const counts = countRangeVsHero(preset, board, hero);
    const candidate: AdvancedCandidate = { preset, board, hero, street, counts };

    // 負け/勝ちをランダムに選び、答えが許容範囲内ならそれを採用。
    // 域外でも反対側が範囲内ならそちらを採用して再抽選を減らす
    const kind: 'lose' | 'win' = Math.random() < 0.5 ? 'lose' : 'win';
    const other: 'lose' | 'win' = kind === 'lose' ? 'win' : 'lose';
    if (inAdvancedRange(counts[kind])) return buildAdvancedQuestion(candidate, kind);
    if (inAdvancedRange(counts[other])) return buildAdvancedQuestion(candidate, other);

    fallback = candidate;
  }

  // 打ち切り: 最後の候補から答えが1以上になりやすい側を採用する
  const c = fallback!;
  return buildAdvancedQuestion(c, Math.min(c.counts.lose, c.counts.win) >= 1
    ? (c.counts.lose <= c.counts.win ? 'lose' : 'win')
    : (c.counts.lose >= c.counts.win ? 'lose' : 'win'));
}

// ---- 公開 API ----

// 難易度に対応した問題を1問生成する
export function generateQuestion(difficulty: Difficulty): Question {
  if (difficulty === 'beginner') return makeBeginnerQuestion();
  if (difficulty === 'intermediate') return makeIntermediateQuestion();
  return makeAdvancedQuestion();
}
