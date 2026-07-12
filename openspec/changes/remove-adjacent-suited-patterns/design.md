## Context

初級編のエリアパターン問題は `src/lib/rangeQuestions.ts` の `RANGE_PATTERNS` 配列（現在8種）からランダムに選ばれる。答え・解説・ハイライトセルはすべて `buildRangeQuestionData` がパターンの `test` 関数から動的に計算するため、パターン定義以外に答えのハードコードは存在しない。

削除対象:
- `adjacent-suited`（隣接ランクのスーテッド、AKs〜32s、答え48）
- `suited-connectors`（スーテッドコネクター、98s〜54s、答え20）

## Goals / Non-Goals

**Goals:**
- 上記2パターンを出題対象から完全に外す
- 該当パターン前提のテストを整理し、`npm run test` と `npm run build` を通す

**Non-Goals:**
- プリセットレンジ「スーテッド中心のコールレンジ」（`presetRanges.ts` の id: `suited-connectors`）の変更。id が同名だが別物であり、残す
- 出題比率（単一ハンド40% / エリアパターン40% / プリセット20%）の変更
- 残る6パターンの内容変更

## Decisions

- **配列から物理削除する**（フラグで無効化しない）: パターンは静的定義であり、無効化フラグを導入する価値がない。復活させたければ git 履歴から戻せる
- **テストは該当分のみ削除**: `EXPECTED` テーブルは `it.each(RANGE_PATTERNS...)` 駆動なので、配列から消えたパターンのエントリを残すと未使用データになる。エントリ2件と「スーテッドコネクターのエリアは 98s〜54s のみ」のテストを削除する。`expect(EXPECTED[id]).toBeDefined()` の仕組みにより、削除漏れ・過剰削除はテストが検出する

## Risks / Trade-offs

- [リスク] ほぼなし。純粋な定義データの削除で、参照箇所は grep で全件特定済み（rangeQuestions.ts / テスト2箇所のみ） → テストとビルドで確認する
