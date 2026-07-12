## Why

初級編のエリアパターン問題のうち「隣接ランクのスーテッドは何コンボ？」（adjacent-suited、答え48）と「スーテッドコネクター（98s〜54s）は何コンボ？」（suited-connectors、答え20）は出題として不要と判断したため、出題パターンから削除する。

## What Changes

- `RANGE_PATTERNS`（src/lib/rangeQuestions.ts）から `adjacent-suited` と `suited-connectors` の2パターンを削除し、エリアパターンを8種から6種にする
- 該当パターンのテスト（期待値テーブルの2エントリと、スーテッドコネクターのエリア検証テスト）を削除する
- プリセットレンジの「スーテッド中心のコールレンジ」（presetRanges.ts の id: `suited-connectors`）は**対象外**。削除するのはエリアパターンのみ

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `question-engine`: 初級問題の出題パターンから「隣接ランクのスーテッド」「スーテッドコネクター」のエリアパターンを除外する（出題してはならないことを明記）

## Impact

- src/lib/rangeQuestions.ts — `RANGE_PATTERNS` の2エントリ削除
- src/lib/__tests__/rangeQuestions.test.ts — `EXPECTED` の2エントリと専用テスト1件を削除
- README.md — ハンドグループの例示は「など」表記で該当2パターンを明示していないため変更不要
- プリセットレンジ・中級・上級の出題ロジックには影響なし
