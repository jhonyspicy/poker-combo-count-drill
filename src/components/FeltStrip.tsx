import type { Card } from '../lib/comboCalculator';
import { FELT_COLORS } from '../config/uiConfig';
import PlayingCard from './PlayingCard';

interface FeltStripProps {
  board: Card[];
  hero: Card[];
}

// ポーカーテーブル風のフェルト帯。ボードと自分のハンドを縦仕切り線で横に並べる
export default function FeltStrip({ board, hero }: FeltStripProps) {
  // リバー（5枚）でも狭い画面に収まるよう、ボード枚数に応じてカード幅を落とす
  const boardCardW = board.length >= 5 ? 34 : board.length === 4 ? 38 : 42;
  const heroCardW = boardCardW + 2;

  return (
    <div
      className="flex items-center justify-center gap-3 px-3 pt-3.5 pb-2.5 rounded-[18px]"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${FELT_COLORS.light} 0%, ${FELT_COLORS.base} 65%, ${FELT_COLORS.dark} 100%)`,
        border: '5px solid #3a2a1c',
        boxShadow: '0 0 0 1px #59422c, inset 0 2px 12px rgba(0,0,0,0.4)',
      }}
    >
      {/* ボード */}
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="text-[10px] font-bold tracking-[0.14em]"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          ボード
        </div>
        <div className="flex gap-1">
          {board.map(card => (
            <PlayingCard key={`${card.rank}${card.suit}`} card={card} widthPx={boardCardW} />
          ))}
        </div>
      </div>

      {/* 仕切り線 */}
      <div className="w-px h-15 shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }} />

      {/* 自分のハンド */}
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="text-[10px] font-bold tracking-[0.14em]"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          あなた
        </div>
        <div className="flex gap-1">
          {hero.map(card => (
            <PlayingCard key={`${card.rank}${card.suit}`} card={card} widthPx={heroCardW} />
          ))}
        </div>
      </div>
    </div>
  );
}
