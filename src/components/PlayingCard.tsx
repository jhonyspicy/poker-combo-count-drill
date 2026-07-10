import type { Card } from '../lib/comboCalculator';
import { SUIT_SYMBOL } from '../lib/comboCalculator';
import { SUIT_COLORS } from '../config/uiConfig';

interface PlayingCardProps {
  card: Card;
  // カードの幅（px）。高さ・フォントサイズは幅から比率で導出する
  widthPx?: number;
  tiltDeg?: number;
}

// トランプ1枚の描画。ランクとスートを縦に並べた白いカード
export default function PlayingCard({ card, widthPx = 42, tiltDeg = 0 }: PlayingCardProps) {
  const color = SUIT_COLORS[card.suit];
  const rankLabel = card.rank === 'T' ? '10' : card.rank;
  const height = Math.round(widthPx * 1.43);
  const rankFont = Math.round(widthPx * 0.46);

  return (
    // 傾きは外側で持ち、内側の出現アニメーション（transform）と干渉させない
    <div style={{ transform: tiltDeg !== 0 ? `rotate(${tiltDeg}deg)` : undefined }}>
      <div
        className="flex flex-col items-center justify-center animate-card-in"
        style={{
          width: widthPx,
          height,
          borderRadius: 6,
          background: 'linear-gradient(180deg, #ffffff 0%, #f0f2f5 100%)',
          boxShadow: '0 3px 7px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="font-extrabold text-center leading-none"
          style={{ fontSize: rankFont, color }}
        >
          {rankLabel}
        </div>
        <div
          className="text-center leading-none"
          style={{ fontSize: rankFont - 1, color }}
        >
          {SUIT_SYMBOL[card.suit]}
        </div>
      </div>
    </div>
  );
}
