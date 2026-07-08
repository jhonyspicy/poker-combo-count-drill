## Why

前の変更でコンテンツエリアの左右余白を完全に除去したが、テキストや選択肢が画面端に接近しすぎて読みにくい。コンテンツには適度な余白を設けつつ、プレイ画面のタイマーバーだけは視覚的インパクトのため画面いっぱいに表示する。

## What Changes

- 全4画面のコンテンツエリアに `px-4` を追加し、左右に適度な余白を設ける
- プレイ画面のタイマーバー（`h-2` の横線）は余白なし・全幅のまま維持する
- ヘッダー（Lv・スコア表示）は既存の `px-4` を維持する

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `game-screens`: フルワイドレイアウト要件を「タイマーバーは全幅、コンテンツには内側余白あり」に改訂する

## Impact

- `src/pages/TopPage.tsx`
- `src/pages/PlayPage.tsx`
- `src/pages/ResultPage.tsx`
- `src/pages/HowToPage.tsx`
