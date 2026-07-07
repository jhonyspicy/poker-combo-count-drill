## Why

アプリは現在 Hello World の状態であり、READMEに定義されたゲーム仕様（クイズロジック・4画面・レベル進行）が一切実装されていない。MVP を構築してユーザーが実際にコンボ数の練習を行えるようにする。

## What Changes

- HashRouter による4画面構成（トップ・プレイ・リザルト・遊び方）を実装する
- デッドカードを考慮したコンボ数計算ロジックを実装する
- 単純問題（固定データ）とデッドカード問題（動的生成）の出題エンジンを実装する
- 5問ごとにレベルアップし、出題タイプと制限時間が変化する難易度システムを実装する
- 自己ベスト（最高連続正解数・到達レベル・達成日時）を localStorage に保存する
- ポーカールームらしいダーク基調のモバイルファーストUIを実装する

## Capabilities

### New Capabilities

- `game-screens`: トップ・プレイ・リザルト・遊び方の4画面と画面間のルーティング
- `combo-calculator`: デッドカードを考慮したコンボ数の計算ロジック（ポケットペア・スーテッド・オフスートの各計算）
- `question-engine`: 問題生成（単純問題の固定データ・デッドカード問題の動的生成）と4択の誤答生成
- `level-system`: 5問ごとのレベルアップ、出題タイプ構成・制限時間の難易度スケーリング、設定値の一元管理
- `score-tracker`: ゲームセッション中のスコア管理と localStorage への自己ベスト永続化

### Modified Capabilities

（既存のスペックなし）

## Impact

- `src/` 以下の全ファイルを新規作成（現在は Hello World のみ）
- 外部API・サーバー・新規npm依存なし（既存スタック: Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router v7）
- GitHub Pages デプロイ設定（`vite.config.ts` の `base`・HashRouter）は変更しない
