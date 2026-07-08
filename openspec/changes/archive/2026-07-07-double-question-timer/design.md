## Context

制限時間は `src/config/gameConfig.ts` の `BASE_TIME_SEC` に集約されており、コンポーネントにマジックナンバーは存在しない。変更は設定値を書き換えるだけで完結する。

## Goals / Non-Goals

**Goals:**
- 全問題タイプの基準時間を2倍にしてプレイヤーの思考時間を確保する

**Non-Goals:**
- スケーリング式（`TIME_SCALE_FACTOR`・`TIME_FLOOR_RATIO`）の変更
- タイプ別の個別調整
- UI・ロジックへの変更

## Decisions

- `BASE_TIME_SEC` の各値を一律2倍にする（simple:16, flop:30, turn:36, river:40）
- `TIME_FLOOR_RATIO = 0.5` は維持するため、下限も自動的に2倍になる
- スケーリング式は変えないため、高レベルでの短縮ペースは変わらない

## Risks / Trade-offs

- [ゲームバランス] 時間が長くなると難易度が下がりすぎる可能性 → 必要なら `TIME_SCALE_FACTOR` を下げて調整可能
