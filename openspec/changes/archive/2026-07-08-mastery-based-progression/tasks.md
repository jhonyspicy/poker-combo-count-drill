## 1. gameConfig.ts の更新

- [x] 1.1 `QUESTIONS_PER_LEVEL` と `LEVEL_TYPE_WEIGHTS` を削除する
- [x] 1.2 `MASTERY_STREAK = 20`（Lv2以降の連続正解数）を追加する
- [x] 1.3 `getLevelType(level: number): QuestionType` を追加する（Lv1→simple, Lv2→flop, Lv3→turn, Lv4+→river）
- [x] 1.4 `pickRandomType` を削除し、呼び出し元を `getLevelType` に更新する

## 2. questions.ts の更新

- [x] 2.1 `SIMPLE_POOL` をエクスポートに変更するか、`generateAllSimpleQuestions(): Question[]` 関数を追加する（全8問をシャッフルして返す）
- [x] 2.2 `generateQuestion(level)` を更新し、Lv2以降は `getLevelType(level)` で得たタイプのボード問題を生成するようにする

## 3. PlayPage.tsx の更新

- [x] 3.1 state に `simpleQueue: Question[]` を追加し、初期化時（ゲーム開始時）に全単純問題をシャッフルして生成する
- [x] 3.2 `questionsInLevel` を `progressInLevel` に改名し、レベル内正解カウンタとして使う
- [x] 3.3 Lv1 の初期問題を `simpleQueue[0]` から取得するよう `initQuestion` を修正する
- [x] 3.4 `handleChoice` のレベルアップ判定を更新する（Lv1: `progressInLevel >= simpleQueue.length`、Lv2+: `progressInLevel >= MASTERY_STREAK`）
- [x] 3.5 `handleChoice` の次問題取得ロジックを更新する（Lv1中: `simpleQueue[nextProgress]`、Lv2以降: `generateQuestion(nextLevel)`）
- [x] 3.6 ヘッダーにレベル内進捗（`progressInLevel / masteryRequired` 形式）を追加表示する

## 4. 確認

- [x] 4.1 `npm run build` が通ることを確認する
- [ ] 4.2 Lv1 で8問全問正解すると Lv2（フロップ問題）に移行することを動作確認する
- [ ] 4.3 Lv2 で20問連続正解すると Lv3 に移行することを動作確認する
- [x] 4.4 間違えると即ゲームオーバーになることを確認する
