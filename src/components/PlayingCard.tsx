import type { Card } from '../lib/comboCalculator';
import { SUIT_SYMBOL } from '../lib/comboCalculator';
import { SUIT_COLORS } from '../config/uiConfig';

interface PlayingCardProps {
  card: Card;
  // board: ボード用（小）/ hero: 自分のハンド用（大・傾きあり・重なり）
  variant?: 'board' | 'hero';
  tiltDeg?: number;
}

// トランプ1枚の描画。ランクとスートを縦に並べた白いカード
export default function PlayingCard({ card, variant = 'board', tiltDeg = 0 }: PlayingCardProps) {
  const isHero = variant === 'hero';
  const color = SUIT_COLORS[card.suit];
  const rankLabel = card.rank === 'T' ? '10' : card.rank;

  return (
    // 傾きは外側で持ち、内側の出現アニメーション（transform）と干渉させない
    <div
      style={{
        margin: isHero ? '0 -4px' : undefined,
        transform: tiltDeg !== 0 ? `rotate(${tiltDeg}deg)` : undefined,
      }}
    >
      <div
        className="flex flex-col items-center justify-center animate-card-in"
        style={{
          width: isHero ? 58 : 54,
          height: isHero ? 82 : 76,
          borderRadius: 7,
          background: 'linear-gradient(180deg, #ffffff 0%, #f0f2f5 100%)',
          boxShadow: isHero ? '0 4px 10px rgba(0,0,0,0.45)' : '0 3px 8px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="font-extrabold text-center leading-none"
          style={{ fontSize: isHero ? 34 : 32, color }}
        >
          {rankLabel}
        </div>
        <div className="text-center leading-none" style={{ fontSize: isHero ? 32 : 30, color }}>
          {SUIT_SYMBOL[card.suit]}
        </div>
      </div>
    </div>
  );
}
