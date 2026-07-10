import type { RangeCell } from '../lib/rangeQuestions';
import { RANGE_GRID_COLORS } from '../config/uiConfig';

interface RangeGridProps {
  cells: RangeCell[];
  // パネルの見出し（「レンジ表」/「相手のレンジ」）
  label: string;
  // パネルの最大幅（上級は3要素を1画面に収めるため小さめにする）
  maxWidthPx?: number;
}

// 13×13のレンジ表パネル。見出し・凡例付きのカード風パネルに出題エリア（hit）をハイライト表示する
export default function RangeGrid({ cells, label, maxWidthPx = 330 }: RangeGridProps) {
  // 相手のレンジ表示ではセルが「レンジ内」、それ以外は問題の「対象エリア」を意味する
  const legend = label === '相手のレンジ' ? 'レンジ内' : '対象エリア';

  return (
    <div
      className="w-full mx-auto rounded-[14px] p-2"
      style={{
        maxWidth: maxWidthPx,
        background: RANGE_GRID_COLORS.panelBg,
        border: `1px solid ${RANGE_GRID_COLORS.panelBorder}`,
        boxShadow: '0 10px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* 見出しと凡例 */}
      <div className="flex items-center justify-between px-0.5 pb-1.5">
        <div
          className="text-[11px] font-bold tracking-[0.1em]"
          style={{ color: RANGE_GRID_COLORS.headerFg }}
        >
          {label}
        </div>
        <div
          className="flex items-center gap-[5px] text-[11px]"
          style={{ color: RANGE_GRID_COLORS.headerFg }}
        >
          <span
            className="inline-block w-[9px] h-[9px] rounded-[2px]"
            style={{ background: RANGE_GRID_COLORS.highlightBg }}
          />
          {legend}
        </div>
      </div>

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
              fontSize: 'clamp(7px, 2.6vw, 11px)',
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
