## Why

現在の出題方式はレベルが上がっても低難易度の問題タイプが混在し続けるため、特定タイプへの習熟感が得られない。各レベルを「そのタイプの問題を集中的に練習し、マスターしたら次へ進む」という習熟型に変更することで、段階的なスキルアップを実現する。

## What Changes

- **BREAKING** レベルアップ条件を変更: 「5問正解ごと」→「レベル固有の習熟条件を達成したとき」
  - Lv1（simple）: SIMPLE_POOL（8問）を1問ずつシャッフル出題し、全問正解でLv2へ
  - Lv2以降（flop/turn/river）: 20問連続正解で次のレベルへ
- **BREAKING** 出題タイプをレベルごとに1種類に固定
  - Lv1: simple のみ
  - Lv2: flop のみ
  - Lv3: turn のみ
  - Lv4+: river のみ（以降は20問連続ごとにレベルアップし続ける）
- Lv1の単純問題をランダム重複ありから「全問を1回ずつシャッフル」に変更
- ゲーム中の進捗表示を「レベル内の残り問題数 / 必要数」に更新
- 間違えたらゲームオーバーの仕様は変更しない

## Capabilities

### New Capabilities
（なし）

### Modified Capabilities
- `level-system`: レベルアップ条件とレベル別出題タイプ構成の要件が変わる
- `question-engine`: Lv1の単純問題をランダムではなく全問1回ずつ順番に出題する要件が加わる

## Impact

- `src/config/gameConfig.ts`: `QUESTIONS_PER_LEVEL`・`LEVEL_TYPE_WEIGHTS` の変更、新定数の追加
- `src/lib/questions.ts`: SIMPLE_POOL をエクスポートし PlayPage から参照できるようにする（または全問シャッフル生成関数を追加）
- `src/pages/PlayPage.tsx`: レベルアップ判定ロジック・問題生成ロジックの全面改修
- `src/pages/ResultPage.tsx`: 表示上の変更なし（状態の型変更があれば追随）
