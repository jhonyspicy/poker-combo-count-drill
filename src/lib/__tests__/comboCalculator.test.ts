import { describe, it, expect } from 'vitest';
import type { Card } from '../comboCalculator';
import { pairCombos, suitedCombos, offsuitCombos } from '../comboCalculator';

// Helpers
function card(rank: string, suit: string): Card {
  return { rank, suit } as Card;
}

describe('pairCombos', () => {
  it('returns 6 with no dead cards', () => {
    expect(pairCombos('A', [])).toBe(6);
  });

  it('returns 3 when one card of the rank is dead (A♠)', () => {
    expect(pairCombos('A', [card('A', 's')])).toBe(3);
  });

  it('returns 1 when two cards of the rank are dead (A♠ A♥)', () => {
    expect(pairCombos('A', [card('A', 's'), card('A', 'h')])).toBe(1);
  });

  it('returns 0 when three cards of the rank are dead', () => {
    expect(pairCombos('A', [card('A', 's'), card('A', 'h'), card('A', 'd')])).toBe(0);
  });

  it('ignores dead cards of other ranks', () => {
    expect(pairCombos('K', [card('A', 's'), card('Q', 'h')])).toBe(6);
  });
});

describe('suitedCombos', () => {
  it('returns 4 with no dead cards (AKs)', () => {
    expect(suitedCombos('A', 'K', [])).toBe(4);
  });

  it('returns 3 when A♠ is dead', () => {
    // ♠ pair is broken, other 3 suits remain
    expect(suitedCombos('A', 'K', [card('A', 's')])).toBe(3);
  });

  it('returns 3 when K♠ is dead', () => {
    expect(suitedCombos('A', 'K', [card('K', 's')])).toBe(3);
  });

  it('returns 3 when both A♠ and K♠ are dead', () => {
    // Only one suit broken regardless
    expect(suitedCombos('A', 'K', [card('A', 's'), card('K', 's')])).toBe(3);
  });

  it('returns 2 when A♠ and A♥ are dead', () => {
    // ♠ and ♥ pairs broken
    expect(suitedCombos('A', 'K', [card('A', 's'), card('A', 'h')])).toBe(2);
  });
});

describe('offsuitCombos', () => {
  it('returns 12 with no dead cards (AKo)', () => {
    expect(offsuitCombos('A', 'K', [])).toBe(12);
  });

  // CLAUDE.md example: board A♠ K♥ 2♦ → AKo = 7
  it('returns 7 with board A♠ K♥ 2♦ (CLAUDE.md example)', () => {
    const board = [card('A', 's'), card('K', 'h'), card('2', 'd')];
    // remaining A: 3, remaining K: 3, total: 9
    // AKs: A♦K♦ and A♣K♣ alive = 2
    // AKo: 9 - 2 = 7
    expect(offsuitCombos('A', 'K', board)).toBe(7);
  });

  it('returns 0 when both ranks are fully dead', () => {
    const deadAll = [
      card('A', 's'), card('A', 'h'), card('A', 'd'), card('A', 'c'),
      card('K', 's'), card('K', 'h'), card('K', 'd'), card('K', 'c'),
    ];
    expect(offsuitCombos('A', 'K', deadAll)).toBe(0);
  });
});
