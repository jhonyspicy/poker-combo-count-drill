## MODIFIED Requirements

### Requirement: レベル進行
各レベルに定義された習熟条件を達成したとき、レベルが1上がる SHALL。習熟条件はレベルによって異なる。

#### Scenario: Lv1 クリア（単純問題全問正解）
- **WHEN** Lv1 で SIMPLE_POOL の全問題を1回ずつ正解する
- **THEN** レベルが 2 に上がる

#### Scenario: Lv2 以降のレベルアップ（20問連続正解）
- **WHEN** Lv2 以降で同一レベル内に 20 問連続正解する
- **THEN** レベルが 1 上がり、連続カウンタが 0 にリセットされる

#### Scenario: ゲームオーバー時のレベルリセット
- **WHEN** ゲームオーバーになる
- **THEN** 次のゲーム開始時にレベルは 1 からリスタートする

### Requirement: レベル別出題タイプ構成
各レベルは1種類の問題タイプのみに対応し、それ以外のタイプは出題されない SHALL。

#### Scenario: Lv1 の出題
- **WHEN** レベルが 1 のとき問題を生成する
- **THEN** 単純問題（simple）のみが出題される

#### Scenario: Lv2 の出題
- **WHEN** レベルが 2 のとき問題を生成する
- **THEN** フロップ（flop）問題のみが出題される

#### Scenario: Lv3 の出題
- **WHEN** レベルが 3 のとき問題を生成する
- **THEN** ターン（turn）問題のみが出題される

#### Scenario: Lv4 以降の出題
- **WHEN** レベルが 4 以上のとき問題を生成する
- **THEN** リバー（river）問題のみが出題される

## REMOVED Requirements

### Requirement: レベル別出題タイプ構成（旧）
**Reason**: レベルが上がるほど下位タイプが混在する旧設計を廃止し、1レベル＝1タイプの習熟型設計に移行する。
**Migration**: `LEVEL_TYPE_WEIGHTS` と `pickRandomType` を削除し、`getLevelType(level)` に置き換える。`QUESTIONS_PER_LEVEL` は削除し、レベルごとの習熟条件定数（`MASTERY_STREAK`）に置き換える。
