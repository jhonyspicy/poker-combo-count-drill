import type { Card, Rank, Suit } from './comboCalculator';
import {
  RANKS, SUITS, SUIT_SYMBOL, cardToString,
  pairCombos, suitedCombos, offsuitCombos,
} from './comboCalculator';
import type { QuestionType } from '../config/gameConfig';
import { getLevelType } from '../config/gameConfig';
import type { RangeCell } from './rangeQuestions';
import { buildRangeQuestionData, pickRangePattern } from './rangeQuestions';

export interface Question {
  text: string;
  answer: number;
  choices: number[]; // 4 values including answer, shuffled
  explanation: string;
  type: QuestionType;
  // 以下はデッドカード問題のみ。プレイ画面でカードを描画するために持つ
  board?: Card[]; // ボードのカード
  hero?: Card[]; // 自分のハンド（2枚）。デッドカードとして計算に含める
  handLabel?: string; // 出題対象のハンド表記（例: AA, AKs, AKo）
  // レンジ表問題のみ。13×13=169セル（行優先）
  rangeCells?: RangeCell[];
}

// ---- 固定問題プール（単純問題） ----

const SIMPLE_POOL: { text: string; answer: number; explanation: string }[] = [
  {
    text: '52枚のデッキで作れる2枚の手札の\n組み合わせ（総コンボ数）はいくつ？',
    answer: 1326,
    explanation: 'C(52,2) = 52×51÷2 = 1326 コンボ',
  },
  {
    text: 'ポケットペアは全部で何コンボ？\n（AA〜22 の13ランク）',
    answer: 78,
    explanation: '各ランク C(4,2)=6 コンボ × 13ランク = 78 コンボ',
  },
  {
    text: 'スーテッドハンドは全部で何コンボ？\n（AKs〜32s など）',
    answer: 312,
    explanation: '各ハンドタイプ 4 コンボ × 78タイプ = 312 コンボ',
  },
  {
    text: 'オフスートハンドは全部で何コンボ？\n（AKo〜32o など）',
    answer: 936,
    explanation: '各ハンドタイプ 12 コンボ × 78タイプ = 936 コンボ',
  },
  {
    text: 'AA（エースのポケットペア）は\n何コンボ？',
    answer: 6,
    explanation: 'C(4,2) = 6 コンボ',
  },
  {
    text: 'AKs（エース・キングのスーテッド）は\n何コンボ？',
    answer: 4,
    explanation: '♠♥♦♣ の4スーツ = 4 コンボ',
  },
  {
    text: 'AKo（エース・キングのオフスート）は\n何コンボ？',
    answer: 12,
    explanation: '4×4 − 4(スーテッド) = 12 コンボ',
  },
  {
    text: 'AK（スーテッド＋オフスートの合計）は\n何コンボ？',
    answer: 16,
    explanation: 'AKs(4) + AKo(12) = 16 コンボ',
  },
];

// ---- ボード・ハンド生成 ----

// シャッフルしたデッキからボードと自分のハンド（2枚）を配る
function dealCards(boardSize: 3 | 4 | 5): { board: Card[]; hero: Card[] } {
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
  return { board: deck.slice(0, boardSize), hero: deck.slice(boardSize, boardSize + 2) };
}

// デッドカード問題で出題対象とするランク（高いランクほどポーカーの実戦で重要）
const QUERY_RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7'];

function pickRank(dead: Card[], exclude?: Rank): Rank {
  const pool = QUERY_RANKS.filter(r => {
    if (r === exclude) return false;
    return dead.filter(c => c.rank === r).length < 4;
  });
  return pool[Math.floor(Math.random() * pool.length)] ?? 'A';
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
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  // 候補が3つ未満の場合は正解+10から順に補充
  let filler = answer + 10;
  while (candidates.length < 3) {
    if (!used.has(filler)) { candidates.push(filler); used.add(filler); }
    filler++;
  }
  return candidates.slice(0, 3);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- デッドカード問題の生成ファクトリ ----

function makePairQuestion(board: Card[], hero: Card[], type: QuestionType): Question {
  const dead = [...board, ...hero];
  const rank = pickRank(dead);
  const answer = pairCombos(rank, dead);
  const deadCount = dead.filter(c => c.rank === rank).length;
  const remaining = 4 - deadCount;

  const distractors = generateDistractors(answer, 6 /* no-dead-card answer */);

  const explanation =
    deadCount === 0
      ? `見えているカードに ${rank} はなし。C(4,2) = ${answer} コンボ`
      : `見えている ${rank} は ${deadCount} 枚。残り ${remaining} 枚から\nC(${remaining},2) = ${answer} コンボ`;

  return {
    text: `ボード: ${cardsString(board)}\nあなたのハンド: ${cardsString(hero)}\n\n相手が ${rank}${rank} を持っているコンボ数は？`,
    answer,
    choices: shuffle([answer, ...distractors]),
    explanation,
    type,
    board,
    hero,
    handLabel: `${rank}${rank}`,
  };
}

function makeSuitedQuestion(board: Card[], hero: Card[], type: QuestionType): Question {
  const dead = [...board, ...hero];
  const rank1 = pickRank(dead);
  const rank2 = pickRank(dead, rank1);
  const answer = suitedCombos(rank1, rank2, dead);

  const aliveSuits: Suit[] = SUITS.filter(s => {
    const r1Dead = dead.some(c => c.rank === rank1 && c.suit === s);
    const r2Dead = dead.some(c => c.rank === rank2 && c.suit === s);
    return !r1Dead && !r2Dead;
  });

  const suitSymbols = aliveSuits.map(s => SUIT_SYMBOL[s]).join('');
  const distractors = generateDistractors(answer, 4 /* no-dead-card */);

  const explanation =
    `両方残っているスーツ: ${suitSymbols || 'なし'} = ${answer} コンボ`;

  return {
    text: `ボード: ${cardsString(board)}\nあなたのハンド: ${cardsString(hero)}\n\n相手が ${rank1}${rank2}s を持っているコンボ数は？`,
    answer,
    choices: shuffle([answer, ...distractors]),
    explanation,
    type,
    board,
    hero,
    handLabel: `${rank1}${rank2}s`,
  };
}

function makeOffsuitQuestion(board: Card[], hero: Card[], type: QuestionType): Question {
  const dead = [...board, ...hero];
  const rank1 = pickRank(dead);
  const rank2 = pickRank(dead, rank1);
  const r1Left = 4 - dead.filter(c => c.rank === rank1).length;
  const r2Left = 4 - dead.filter(c => c.rank === rank2).length;
  const total = r1Left * r2Left;
  const suited = suitedCombos(rank1, rank2, dead);
  const answer = offsuitCombos(rank1, rank2, dead);

  const distractors = generateDistractors(answer, 12 /* no-dead-card */, total, suited);

  const explanation =
    `残り ${rank1}: ${r1Left}枚 × 残り ${rank2}: ${r2Left}枚 = ${total}（全体）\n` +
    `${rank1}${rank2}s = ${suited} コンボ\n` +
    `${rank1}${rank2}o = ${total} − ${suited} = ${answer} コンボ`;

  return {
    text: `ボード: ${cardsString(board)}\nあなたのハンド: ${cardsString(hero)}\n\n相手が ${rank1}${rank2}o を持っているコンボ数は？`,
    answer,
    choices: shuffle([answer, ...distractors]),
    explanation,
    type,
    board,
    hero,
    handLabel: `${rank1}${rank2}o`,
  };
}

type HandCategory = 'pair' | 'suited' | 'offsuit';

function pickHandCategory(): HandCategory {
  // オフスートはポーカーで最も頻出のため出題頻度を高くしている
  const cats: HandCategory[] = ['pair', 'suited', 'offsuit', 'offsuit'];
  return cats[Math.floor(Math.random() * cats.length)];
}

function makeBoardQuestion(type: QuestionType): Question {
  const size = type === 'flop' ? 3 : type === 'turn' ? 4 : 5;

  for (let attempt = 0; attempt < 10; attempt++) {
    const { board, hero } = dealCards(size);
    const category = pickHandCategory();

    let q: Question;
    if (category === 'pair') q = makePairQuestion(board, hero, type);
    else if (category === 'suited') q = makeSuitedQuestion(board, hero, type);
    else q = makeOffsuitQuestion(board, hero, type);

    if (q.answer >= 1) return q;
  }
  // 10回試行してもコンボ数が0になる場合（極めてレアなボード）は単純問題で代替
  return makeSimpleQuestion();
}

// ---- レンジ表問題の生成 ----

// レンジ表問題は答えの桁が大きいので、コンボ数の粒度に合わせた間隔で誤答を作る
function generateRangeDistractors(answer: number): number[] {
  const step = answer < 20 ? 1 : answer <= 100 ? 4 : 12;
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
  return candidates;
}

function makeRangeQuestion(): Question {
  const data = buildRangeQuestionData(pickRangePattern());
  return {
    text: data.pattern.label,
    answer: data.answer,
    choices: shuffle([data.answer, ...generateRangeDistractors(data.answer)]),
    explanation: data.explanation,
    type: 'range',
    rangeCells: data.cells,
  };
}

function makeSimpleQuestion(): Question {
  const q = SIMPLE_POOL[Math.floor(Math.random() * SIMPLE_POOL.length)];
  const distractors = generateDistractors(q.answer);
  return {
    text: q.text,
    answer: q.answer,
    choices: shuffle([q.answer, ...distractors]),
    explanation: q.explanation,
    type: 'simple',
  };
}

// ---- 公開 API ----

// Lv1用: SIMPLE_POOL の全問をシャッフルして Question 配列として返す
export function generateAllSimpleQuestions(): Question[] {
  const questions = SIMPLE_POOL.map(q => {
    const distractors = generateDistractors(q.answer);
    return {
      text: q.text,
      answer: q.answer,
      choices: shuffle([q.answer, ...distractors]),
      explanation: q.explanation,
      type: 'simple' as QuestionType,
    };
  });
  return shuffle(questions);
}

// Lv2以降用: レベルに対応した問題を1問生成する
export function generateQuestion(level: number): Question {
  const type = getLevelType(level);
  if (type === 'range') return makeRangeQuestion();
  return makeBoardQuestion(type);
}
