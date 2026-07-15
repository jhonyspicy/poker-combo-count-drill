# Tasks: 上級問題のバケット4択

## 1. 設定とバケット導出

- [x] 1.1 gameConfig.ts: `ADVANCED_ANSWER_MIN` / `ADVANCED_ANSWER_MAX` を削除し、バケット境界 `ADVANCED_CHOICE_BUCKET_BOUNDS = [10, 40, 80]` を追加する（コメントで意図を説明）
- [x] 1.2 境界値から4帯（min / max / ラベル）を導出するヘルパーと、負けコンボ数 → 帯インデックスの判定関数を実装する（最上位帯は「81以上」のオープンエンド、0 は最下位帯に属する）

## 2. 問題生成（questions.ts）

- [x] 2.1 `Choice { label: string; correct: boolean }` 型を導入し、`Question.choices` を `Choice[]` に変更する。初級・中級の選択肢組み立て（シャッフル済み数値）を新型に変換する共通ヘルパーを追加する
- [x] 2.2 `buildAdvancedQuestion`: 選択肢を4帯の昇順固定リストにし、負けコンボ数が属する帯にのみ `correct: true` を立てる。`generateAdvancedDistractors` を削除する
- [x] 2.3 `makeAdvancedQuestion`: 目標バケットを一様ランダムに選び、負けコンボ数が目標帯に落ちるまで再抽選するロジックに差し替える（`ADVANCED_RETRY_LIMIT` で打ち切り、最終候補を採用。lose>=1 の優先保持フォールバックは削除）

## 3. UI（PlayPage）

- [x] 3.1 PlayPage.tsx: 選択肢ボタンの描画を `choice.label` 表示・`choice.correct` 判定に変更する（key は index。正解=緑 / 選んだ誤答=赤の挙動は維持）

## 4. テストとドキュメント

- [x] 4.1 questions.test.ts: 「答えは許容範囲（1〜60）に収まる」テストを削除し、バケット選択肢のテストに差し替える（4帯の昇順固定・正解帯がちょうど1つ・境界値ちょうどの答えの帯判定・多数生成時に正解帯が複数の帯に分布する）
- [x] 4.2 questions.test.ts: 「4択は重複なしで正解を含む」等の共通テストを新しい `Choice[]` 型に追従させる（初級・中級はラベル重複なし・正解を含む / 上級は correct がちょうど1つ）
- [x] 4.3 README.md の上級問題の説明（選択肢形式・答えの許容範囲の記述）を更新する
- [x] 4.4 `npm run build` と `npx vitest run` が通ることを確認する
