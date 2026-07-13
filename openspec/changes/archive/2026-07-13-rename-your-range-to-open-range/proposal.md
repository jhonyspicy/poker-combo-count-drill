# Proposal: rename-your-range-to-open-range

## Why

プリセットレンジの表示名「あなたのレンジ」は、レンジの性質（オープンレイズのレンジ）を表しておらず、問題文「相手のレンジ: あなたのレンジ」という表示が自己矛盾して読める。ポーカー用語として一般的な「オープンレンジ」に改名し、問題文の意味を明確にする。

## What Changes

- プリセットレンジの表示名を「あなたのレンジ」から「オープンレンジ」に変更する
- 内部 id `user-range` も一貫性のため `open-range` に変更する（外部永続化なし・内部参照のみのため影響なし）
- レンジの中身（ハンド集合216コンボ）は一切変更しない
- README・テスト記述・spec 中の呼称を新名称に合わせる

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `preset-ranges`: プリセットの呼称を「ユーザー指定レンジ」から「オープンレンジ」に変更（表示名の要件のみ。ハンド集合・コンボ数計算の要件は不変）

## Impact

- `src/lib/presetRanges.ts`: `PRESET_RANGES` の `name`（および `id`）
- `src/lib/__tests__/presetRanges.test.ts`: テスト記述文の呼称
- `README.md`: プリセットレンジの説明文
- `openspec/specs/preset-ranges/spec.md`: 呼称の記載
- UI 表示は `preset.name` を参照しているため（`src/lib/questions.ts` の問題文）、データ変更のみで反映される
