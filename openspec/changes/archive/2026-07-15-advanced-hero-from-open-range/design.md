## Context

上級問題（`makeAdvancedQuestion` @ `src/lib/questions.ts`）は現在:

- 自分のハンドを `dealCards()` でデッキ52枚から完全ランダムに配っている
- 出題の種類を `kind: 'lose' | 'win'` でランダムに選び、`buildAdvancedQuestion(candidate, kind)` が文言・答えを切り替えている
- 域外だった場合は反対側の kind を試す最適化があり、打ち切り時も lose/win の選好ロジックがある
- `Question.advancedKind` を通じて `PlayPage.tsx` の出題文（「負けています/勝っています」）が分岐している

一方、中級問題には `dealFromRange(preset, street)` が既にあり、プリセットレンジのハンドタイプから自分のハンドを選出→スート具体化→残りデッキからボードを配る処理が実装済み。オープンレンジの ID は `INTERMEDIATE_RANGE_ID = 'open-range'`（`src/config/gameConfig.ts`）。

## Goals / Non-Goals

**Goals:**

- 上級の自分のハンドをオープンレンジからの選出にする（中級と同じ方式の再利用）
- 出題を「何コンボに負けていますか？」のみに統一し、win 出題と `advancedKind` を廃止する
- 再抽選ロジックを lose のみの判定に単純化する

**Non-Goals:**

- 相手のレンジの選び方は変えない（引き続き3プリセットからランダム: `pickPresetRange()`）
- 答えの許容範囲（1〜60）・再抽選回数などの設定値は変えない
- 解説文の情報量は変えない（負け/勝ち/引き分けの内訳表示は理解の助けになるため残す）
- 中級・初級の出題ロジックには触れない

## Decisions

### 1. `dealFromRange` をそのまま再利用する

上級用に新しい配札関数は作らず、`dealFromRange(getPresetRange(OPEN_RANGE_ID), street)` を呼ぶ。中級と同一の挙動（レンジ内ハンドタイプを等確率で選出→コンボを等確率で具体化）で十分であり、コードの重複を避ける。

- 代替案: 上級専用の配札関数を新設 → 挙動が同じなので不要。却下

### 2. オープンレンジ ID の定数は共通名にリネームする

`INTERMEDIATE_RANGE_ID` は中級専用の名前だが、上級も同じ 'open-range' を参照することになる。`HERO_RANGE_ID`（自分のハンドの選出元レンジ）のような難易度非依存の名前に変えて両方から参照する。gameConfig への集約方針（CLAUDE.md）に沿い、マジック文字列を questions.ts に直書きしない。

- 代替案: `ADVANCED_RANGE_ID` を別途追加 → 同じ値の定数が2つ並ぶだけ。却下

### 3. `advancedKind` フィールドと kind 分岐を削除する

lose 固定になるため `Question.advancedKind`・`buildAdvancedQuestion` の kind 引数・PlayPage の verb 分岐を削除する。「後で win を復活させるかもしれないから残す」はやらない（YAGNI。復活時は git 履歴から戻せる）。

再抽選ループは `counts.lose` が 1〜60 に入るかだけを判定する。打ち切り時のフォールバックは最後の候補の lose を採用する（lose が 0 でも 4択の1つとして 0 は出せないため、打ち切り時は `answer >= 1` を優先して最後に lose ≥ 1 だった候補を保持する方式にする — 現行の「fallback は最後の候補」から「lose ≥ 1 の最新候補を優先保持」への小変更）。

### 4. 出題文は README の例文に合わせる

PlayPage の表示は「あなたは**何コンボに負けています**か？」（強調部分ゴールド）に固定。`questions.ts` 側の `text`（リザルト画面等で使うプレーン文）も「〜あなたは何コンボに負けていますか？」に統一する。

## Risks / Trade-offs

- [自分のハンドが強めに偏り、lose が小さくなって再抽選が増える] → オープンレンジは216コンボと広く、ボードとの噛み合いは依然ランダムなので影響は軽微。既存の `ADVANCED_RETRY_LIMIT = 40` で十分吸収できる。テストで生成が許容範囲に収まることを検証する
- [lose 固定により「勝ちコンボを数える」練習機会が消える] → ユーザーの明示的な要望による統一。解説文には引き続き勝ち/引き分けの内訳を出すため学習情報は失われない
