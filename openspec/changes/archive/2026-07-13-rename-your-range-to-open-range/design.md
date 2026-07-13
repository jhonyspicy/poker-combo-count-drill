# Design: rename-your-range-to-open-range

## Context

プリセットレンジは `src/lib/presetRanges.ts` の `PRESET_RANGES` に単一定義されており、表示名 `name: 'あなたのレンジ'`・内部 id `'user-range'` を持つ。問題文は `src/lib/questions.ts` で `preset.name` を埋め込んで生成するため、UI 側にハードコードはない。id は localStorage 等に永続化されておらず、内部参照のみ。

## Goals / Non-Goals

**Goals:**
- 表示名を「オープンレンジ」に変更し、問題文・README・spec・テスト記述の呼称を統一する

**Non-Goals:**
- レンジの中身（ハンド集合・216コンボ）の変更
- 複数プリセット対応などの機能追加

## Decisions

- **表示名と同時に id も `open-range` に変更する**: id は永続化・外部参照がなく安全に変えられる。名前と id が食い違うと将来の読み手が混乱するため揃える。代替案（id を据え置く）は差分が小さいが、`user-range` という語が残り続けるデメリットの方が大きい。
- **答えやレンジ定義には触れない**: 呼称のみの変更であることをテスト（216コンボ検証）が引き続き保証する。

## Risks / Trade-offs

- [呼称の変え漏れで新旧名称が混在する] → `grep -rn "あなたのレンジ\|user-range"` で src・README・openspec/specs に残存がないことを確認する（archive 済みの過去の変更ディレクトリは歴史記録なので触れない）
