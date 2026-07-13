# Proposal: add-call-range-preset

## Why

現在プリセットレンジは「オープンレンジ」1種のみで、プリセットレンジ問題・レンジ×ボード問題が常に同じレンジになり練習の幅が狭い。ユーザー提供のレンジ表に基づく「コールレンジ」を追加し、出題バリエーションを増やす。

## What Changes

- `PRESET_RANGES` に2つ目のプリセット「コールレンジ」（id: `call-range`）を追加する
- コールレンジの内容（レンジ表の緑セル、合計118コンボ）:
  - ペア（7種）: TT, 99, 88, 77, 66, 55, 44
  - スーテッド（16種）: AQs, AJs, ATs, A9s, A8s, A7s, A5s, A4s, KQs, KJs, KTs, K9s, QJs, QTs, JTs, T9s
  - オフスート（1種）: AJo
- `pickPresetRange()` がランダム選択のため、追加したプリセットは自動的に出題ローテーションに入る（コード変更不要）
- プリセット定義テスト・README の記述を更新する

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `preset-ranges`: 「単一プリセット（オープンレンジ）」の要件を「複数プリセット（オープンレンジ・コールレンジ）からのランダム選択」に変更し、コールレンジのハンド集合と合計コンボ数（118）を定義に追加する

## Impact

- `src/lib/presetRanges.ts`: `PRESET_RANGES` へのエントリ追加のみ
- `src/lib/__tests__/presetRanges.test.ts`: コールレンジの検証テスト追加（表記の正当性・重複なし・合計118コンボ）
- `README.md`: プリセットレンジの説明を更新（仕様の正はREADME）
- `openspec/specs/preset-ranges/spec.md`: 要件更新（デルタスペック経由）
- 問題生成ロジック（`questions.ts`）は `pickPresetRange()` 経由のため変更不要
