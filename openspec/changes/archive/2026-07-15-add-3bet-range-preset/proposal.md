## Why

プリセットレンジは現在「オープンレンジ」「コールレンジ」の2種のみで、練習できる相手レンジのバリエーションが限られている。実戦で頻出する3ベット局面のレンジを追加し、コンボカウント練習の幅を広げる。

## What Changes

- `src/lib/presetRanges.ts` の `PRESET_RANGES` に3つ目のプリセット「3ベットレンジ」（id: `three-bet-range`）を追加する
- レンジ内容（ユーザー提供のレンジ表から読み取り、計160コンボ）:
  - ペア: AA, KK, QQ, JJ（4種）
  - スーテッド: AKs, A7s〜A2s, K9s〜K4s, QJs, QTs, Q9s（16種）
  - オフスート: AKo, AQo, AJo, KQo, KJo, QJo（6種）
- README.md のプリセットレンジ表に「3ベットレンジ」の行を追加する
- Vitest のプリセット検証テストに3ベットレンジの内容・合計コンボ数（160）の検証を追加する

既存のレンジ選択ロジック（`pickPresetRange` のランダム選択）・グリッド展開・コンボ計算は配列駆動なので変更不要。破壊的変更なし。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `preset-ranges`: プリセットレンジの定義要件を2種から3種に拡張し、「3ベットレンジ」のハンド集合と合計コンボ数（160）のシナリオを追加する

## Impact

- `src/lib/presetRanges.ts`: プリセット定義の追加のみ
- `src/lib/__tests__/presetRanges.test.ts`: 3ベットレンジの検証テスト追加
- `README.md`: プリセットレンジ表の更新
- 問題生成（`questions.ts` / `rangeQuestions.ts`）・UI は既存の仕組みで自動対応するため変更不要
