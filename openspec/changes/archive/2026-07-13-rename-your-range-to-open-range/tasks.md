# Tasks: rename-your-range-to-open-range

## 1. コードの改名

- [x] 1.1 `src/lib/presetRanges.ts` の `PRESET_RANGES` で `name` を「オープンレンジ」、`id` を `open-range` に変更する
- [x] 1.2 `src/lib/__tests__/presetRanges.test.ts` のテスト記述文の「あなたのレンジ」を「オープンレンジ」に変更する

## 2. ドキュメントの改名

- [x] 2.1 `README.md` のプリセットレンジの説明（「あなたのレンジ」の記載）を「オープンレンジ」に変更する

## 3. 検証

- [x] 3.1 `grep -rn "あなたのレンジ\|user-range" src README.md openspec/specs` で残存がないことを確認する（archive ディレクトリは対象外）
- [x] 3.2 `npx vitest run` でテストが通ることを確認する
- [x] 3.3 `npm run build` が通ることを確認する
