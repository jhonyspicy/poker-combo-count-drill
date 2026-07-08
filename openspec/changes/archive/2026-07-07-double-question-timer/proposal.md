## Why

現状の制限時間が短すぎてプレイヤーが考える時間を確保しにくい。ゲーム体験を改善するため、各問題タイプの基準時間を現在の2倍に引き上げる。

## What Changes

- `src/config/gameConfig.ts` の `BASE_TIME_SEC` を全タイプで2倍に変更する
  - simple: 8秒 → 16秒
  - flop: 15秒 → 30秒
  - turn: 18秒 → 36秒
  - river: 20秒 → 40秒

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `level-system`: 「制限時間のスケーリング」要件内の基準時間の数値が変わる

## Impact

- `src/config/gameConfig.ts` のみ変更
- `getTimeLimitSec` の計算式・`TIME_SCALE_FACTOR`・`TIME_FLOOR_RATIO` は変更なし
- UI・ロジック・テストへの影響なし
