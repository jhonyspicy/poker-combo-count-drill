## 1. 設定と型の整理

- [x] 1.1 `src/config/gameConfig.ts` の `INTERMEDIATE_RANGE_ID` を難易度非依存の名前（`HERO_RANGE_ID`）にリネームし、中級・上級の両方の「自分のハンド選出元レンジ」を表す定数として整理する（コメントも更新）
- [x] 1.2 `src/lib/questions.ts` の `Question` 型から `advancedKind` フィールドを削除する

## 2. 上級問題の生成ロジック変更

- [x] 2.1 `makeAdvancedQuestion` の配札を `dealCards(street)` から `dealFromRange(getPresetRange(HERO_RANGE_ID), street)` に変更する
- [x] 2.2 `buildAdvancedQuestion` から `kind` 引数を削除し、答えを `counts.lose` に固定、出題文を「〜あなたは何コンボに負けていますか？」に統一する（解説文の負け/勝ち/引き分け内訳は維持）
- [x] 2.3 再抽選ループを `counts.lose` のみの許容範囲（1〜60）判定に単純化し、打ち切り時のフォールバックは lose ≥ 1 の最新候補を優先して採用する

## 3. UI の追従

- [x] 3.1 `src/pages/PlayPage.tsx` の range-vs-board 出題文から `advancedKind` 分岐を削除し、「何コンボに負けています」（ゴールド強調）に固定する

## 4. テストとドキュメント

- [x] 4.1 `src/lib/__tests__/questions.test.ts` を更新: `advancedKind` の検証を削除し、①出題文が「負けていますか」を含む、②答えが `countRangeVsHero` の lose と一致する、③自分のハンドがオープンレンジ内のハンドタイプに該当する、を検証する
- [x] 4.2 README.md の上級編セクションを更新: 「何コンボに負けて（勝って）いるか」→負けのみに、自分のハンドがオープンレンジから選出される旨を追記
- [x] 4.3 `npm test` と `npm run build` が通ることを確認する
