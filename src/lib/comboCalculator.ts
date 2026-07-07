export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Suit = 's' | 'h' | 'd' | 'c';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

export const SUIT_SYMBOL: Record<Suit, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

export function cardToString(card: Card): string {
  return `${card.rank}${SUIT_SYMBOL[card.suit]}`;
}

// C(n,2) = n*(n-1)/2。n<2 のときは組み合わせ不成立なので 0
function comb2(n: number): number {
  return n >= 2 ? (n * (n - 1)) / 2 : 0;
}

// デッドカードを除いた残りスーツ数から C(残り,2) を計算
export function pairCombos(rank: Rank, deadCards: Card[]): number {
  const deadCount = deadCards.filter(c => c.rank === rank).length;
  return comb2(4 - deadCount);
}

// 両ランクのカードが同一スーツで両方生きているスーツ数 = スーテッドコンボ数
export function suitedCombos(rank1: Rank, rank2: Rank, deadCards: Card[]): number {
  let count = 0;
  for (const suit of SUITS) {
    const r1Dead = deadCards.some(c => c.rank === rank1 && c.suit === suit);
    const r2Dead = deadCards.some(c => c.rank === rank2 && c.suit === suit);
    if (!r1Dead && !r2Dead) count++;
  }
  return count;
}

// 全体（残り rank1 × 残り rank2）からスーテッドを引いてオフスートを導出
export function offsuitCombos(rank1: Rank, rank2: Rank, deadCards: Card[]): number {
  const r1Left = 4 - deadCards.filter(c => c.rank === rank1).length;
  const r2Left = 4 - deadCards.filter(c => c.rank === rank2).length;
  return r1Left * r2Left - suitedCombos(rank1, rank2, deadCards);
}
