## 1. comboCalculator.ts のコメント日本語化

- [x] 1.1 `comb2` 関数の英語コメントを削除し、C(n,2) の計算根拠を日本語で補足
- [x] 1.2 `pairCombos` の英語コメントを日本語に変換（残スーツ数から C(n,2) を求める旨）
- [x] 1.3 `suitedCombos` の英語コメントを日本語に変換（両ランクが生きているスーツを数える旨）
- [x] 1.4 `offsuitCombos` の英語コメントを日本語に変換（全体 − スーテッドで求める旨）

## 2. questions.ts のコメント日本語化

- [x] 2.1 セクション区切りコメント（`// ---- Simple questions ----` 等）を日本語に変換
- [x] 2.2 `QUERY_RANKS` の英語コメントを日本語に変換（高いランクを選ぶ理由）
- [x] 2.3 `generateDistractors` 内の英語コメントを日本語に変換（誤答候補の生成ロジックの意図）
- [x] 2.4 `pickHandCategory` 内の英語コメントを日本語に変換（オフスートに重みを置く理由）
- [x] 2.5 `makeBoardQuestion` 内の英語コメントを日本語に変換（フォールバックの理由）

## 3. gameConfig.ts のコメント日本語化

- [x] 3.1 `LEVEL_TYPE_WEIGHTS` の英語コメント（`// Index = level - 1...`）を日本語に変換

## 4. bestScore.ts のコメント日本語化

- [x] 4.1 `tryUpdateBestScore` の英語コメントを日本語に変換

## 5. 確認

- [x] 5.1 `npm run build` が通ることを確認
