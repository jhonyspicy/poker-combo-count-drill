## Why

現在の全画面に `max-w-lg` と `px-6` が適用されており、スマホでは左右に余白が生まれてしまっている。モバイルファーストのコンセプトに合わせ、画面幅を最大限に使うフルワイドレイアウトに変更する。

## What Changes

- トップ・プレイ・リザルト・遊び方の全4画面から横方向の余白制限（`px-6`・`max-w-lg mx-auto`）を除去する
- コンテンツは画面端まで広がるレイアウトになる
- ボタンや問題文など各要素の内側パディングは維持し、読みやすさは損なわない

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `game-screens`: 全画面にフルワイドレイアウト要件を追加する

## Impact

- `src/pages/TopPage.tsx`
- `src/pages/PlayPage.tsx`
- `src/pages/ResultPage.tsx`
- `src/pages/HowToPage.tsx`
