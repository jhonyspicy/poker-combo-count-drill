# タスク: 上級4択の「総コンボ数に応じた分散数値」化

## 1. 設定値とゾーン導出ロジック（gameConfig.ts）

- [x] 1.1 `ADVANCED_CHOICE_ZONE_RATIOS = [0.07, 0.27, 0.53]` と `ADVANCED_MIN_RANGE_TOTAL = 20` を追加する（コメントで意図と調整前提を明記）
- [x] 1.2 `advancedChoiceZones(total)` を実装する（4ゾーンの整数区間を返す。重複なし・0〜total の全整数がちょうど1つのゾーンに属する）
- [x] 1.3 `advancedZoneIndex(count, total)` を実装する（負けコンボ数が属するゾーンの index）
- [x] 1.4 旧バケット定義（`ADVANCED_CHOICE_BUCKET_BOUNDS` / `ChoiceBucket` / `ADVANCED_CHOICE_BUCKETS` / `advancedBucketIndex`）を削除する

## 2. 選択肢生成と出題ロジック（questions.ts）

- [x] 2.1 `bucketChoices()` を数値4択の生成に置き換える: 正解（負けコンボ数）+ 正解が属さない3ゾーンからゾーン中央寄り区間（20%〜80%）で1つずつ抽選した誤答、を昇順の `Choice[]` にする
- [x] 2.2 `makeAdvancedQuestion()` の再抽選判定を `advancedZoneIndex(counts.lose, counts.total)` 基準に変更する（目標ゾーンの一様選択・打ち切り時の最終候補採用は維持）
- [x] 2.3 総コンボ数が `ADVANCED_MIN_RANGE_TOTAL` 未満の候補を再抽選対象に加える
- [x] 2.4 バケット前提の日本語コメント（「位置固定の反射訓練」等）を新方式の意図に書き直す

## 3. テスト

- [x] 3.1 `gameConfig.test.ts`: 旧バケットのテストを、ゾーン導出（区間の連続性・網羅性・非重複）とゾーン判定のテストに置き換える
- [x] 3.2 `questions.test.ts`: 上級4択のテストを置き換える — 4値が相異なり昇順であること、正解 = 実際の負けコンボ数が含まれること、誤答3つが正解と異なる3ゾーンに1つずつ属すること、総コンボ数 150 相当で全域に分散すること
- [x] 3.3 負けコンボ数 0 の問題が「正解 0 を含む4択」として成立するテストを追加する
- [x] 3.4 `npx vitest run` と `npm run build` が通ることを確認する

## 4. ドキュメント

- [x] 4.1 README.md の上級編・4択の記述（バケット/固定帯の説明）を新仕様（総コンボ数に応じた分散数値・昇順表示・設定値名）に更新する
- [x] 4.2 プレイ画面のラベル表示が問題データ駆動のまま動くことを確認する（コード変更が不要なら変更しない）
