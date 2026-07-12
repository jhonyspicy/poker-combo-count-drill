## 1. パターン削除

- [x] 1.1 src/lib/rangeQuestions.ts の `RANGE_PATTERNS` から `adjacent-suited`（隣接ランクのスーテッド）のエントリを削除する
- [x] 1.2 src/lib/rangeQuestions.ts の `RANGE_PATTERNS` から `suited-connectors`（スーテッドコネクター 98s〜54s）のエントリを削除する

## 2. テスト整理

- [x] 2.1 src/lib/__tests__/rangeQuestions.test.ts の `EXPECTED` テーブルから `'adjacent-suited': 48` と `'suited-connectors': 20` の2エントリを削除する
- [x] 2.2 同ファイルの「スーテッドコネクターのエリアは 98s〜54s のみ」テストを削除する

## 3. 検証

- [x] 3.1 `npm run test` が通ることを確認する（it.each が残り6パターンのみを検証すること）
- [x] 3.2 `npm run build` が通ることを確認する
- [x] 3.3 プリセットレンジ「スーテッド中心のコールレンジ」（presetRanges.ts の id: `suited-connectors`）が変更されずに残っていることを確認する
