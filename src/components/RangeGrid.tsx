import type { RangeCell } from '../lib/rangeQuestions';
import { RANGE_GRID_COLORS } from '../config/uiConfig';

// 13×13のレンジ表。出題エリア（hit）のセルをハイライト表示する
export default function RangeGrid({ cells }: { cells: RangeCell[] }) {
  return (
    <div
      className="w-full max-w-[380px] mx-auto rounded-2xl p-[10px]"
      style={{
        background: '#111a2e',
        border: '1px solid #263252',
        boxShadow: '0 10px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div
        className="grid gap-[2px] aspect-square"
        style={{
          gridTemplateColumns: 'repeat(13, 1fr)',
          gridTemplateRows: 'repeat(13, 1fr)',
        }}
      >
        {cells.map(cell => (
          <div
            key={cell.label}
            className="flex items-center justify-center rounded-[3px] font-bold"
            style={{
              background: cell.hit ? RANGE_GRID_COLORS.highlightBg : RANGE_GRID_COLORS.cellBg,
              color: cell.hit ? RANGE_GRID_COLORS.highlightFg : RANGE_GRID_COLORS.cellFg,
              // 狭い画面ではセル幅に合わせて縮む
              fontSize: 'clamp(8px, 2.9vw, 12.5px)',
              letterSpacing: '-0.03em',
            }}
          >
            {cell.label}
          </div>
        ))}
      </div>
    </div>
  );
}
