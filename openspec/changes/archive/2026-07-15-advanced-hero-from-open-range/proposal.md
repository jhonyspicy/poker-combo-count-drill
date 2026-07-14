## Why

上級問題の「あなたのハンド」は現在デッキ52枚から完全ランダムに配られるため、実戦ではまず参加しない 72o のようなゴミハンドで勝敗カウントをさせられることがあり、練習として不自然。また出題文が「負けていますか？」「勝っていますか？」の2種でランダムに切り替わるため、問われている方向の読み取りに認知コストがかかり、コンボカウントの練習という本質から注意が逸れる。

## What Changes

- 上級問題の「あなたのハンド」を、完全ランダム配布からオープンレンジ（`open-range`）内のハンドタイプからの選出＋スートのランダム具体化に変更する（中級問題と同じ方式）
- 上級問題の出題文を「何コンボに負けていますか？」に統一し、「勝っていますか？」の出題を廃止する
  - 答えは常に「レンジ内コンボのうち自分の役より強いコンボ数」になる
  - 再抽選ロジックは lose 側のみを許容範囲（1〜60）で判定する形に単純化される
- `Question.advancedKind`（'lose' | 'win'）フィールドと、それに依存する PlayPage の文言分岐・解説文の分岐を削除・単純化する
- README の上級編セクション（「負けて（勝って）いるか」の記述と例文）を更新する

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `question-engine`: 「上級問題の生成」要件を変更。①自分のハンドはオープンレンジから選出する、②出題は「何コンボに負けていますか？」のみ（勝ちコンボ問題のシナリオを削除）、③再抽選は負けコンボ数のみで判定する

## Impact

- `src/lib/questions.ts` — `makeAdvancedQuestion`（`dealCards` → オープンレンジからの選出）、`buildAdvancedQuestion`（kind 引数と文言分岐の削除）、`Question.advancedKind` の削除
- `src/pages/PlayPage.tsx` — range-vs-board の出題文分岐（`advancedKind` 参照）を「負けています」固定に
- `src/lib/__tests__/questions.test.ts` — `advancedKind` の検証を削除し、ヒーローハンドがオープンレンジ内であること・答えが lose 数と一致することの検証に更新
- `README.md` — 上級編の説明・例文の更新
- 依存・API・保存データへの影響なし（localStorage スキーマ変更なし）
