## Why

モバイルブラウザでは `100vh`（Tailwind の `min-h-screen`）がアドレスバーを含んだ高さで計算されるため、トップ・遊び方・リザルトの各画面でコンテンツが収まっているのにアドレスバーの高さ分だけ縦スクロールできてしまっていた。スマホ縦画面を基準とするアプリとして、不要なスクロールをなくす。

## What Changes

- 全画面のルート要素の最小高さを `min-h-screen`（100vh）から `min-h-dvh`（100dvh = 実際に見えているビューポート高さ）に統一する
- 対象はトップ・遊び方・リザルトの3画面（プレイ画面は実装済みの `min-h-dvh` を維持）
- コンテンツがビューポートに収まる画面では縦スクロールが発生しなくなる（コンテンツが長い遊び方画面などは従来どおりスクロール可能）

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `game-screens`: 画面の最小高さの基準を追加。全画面が動的ビューポート高さ（dvh）を基準とし、コンテンツが収まる場合にアドレスバー分の余分なスクロールが発生しないことを要件化する

## Impact

- `src/pages/TopPage.tsx` / `src/pages/HowToPage.tsx` / `src/pages/ResultPage.tsx`: ルート要素のクラスを `min-h-screen` → `min-h-dvh` に変更（実装済み）
- `src/pages/PlayPage.tsx`: 変更なし（既に `min-h-dvh`）
- 依存関係・API・ビルド設定への影響なし
