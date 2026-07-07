## Purpose
ゲーム中のセッションスコアをリアルタイムで管理し、自己ベストを localStorage に永続化・表示する。

## Requirements

### Requirement: セッションスコア管理
ゲーム中の連続正解数とレベルをリアルタイムで管理する SHALL。

#### Scenario: 正解時のスコア更新
- **WHEN** ユーザーが正解する
- **THEN** 連続正解数が 1 増加する

#### Scenario: ゲームオーバー時のリザルト受け渡し
- **WHEN** ゲームオーバーになる
- **THEN** セッションスコア・到達レベル・ゲームオーバーになった問題データがリザルト画面に渡される

### Requirement: 自己ベストの localStorage 永続化
最高連続正解数・そのときの到達レベル・達成日時を localStorage に保存・読み込みする SHALL。

#### Scenario: 自己ベスト更新
- **WHEN** セッションスコアが保存済み自己ベストを上回る
- **THEN** 新しい自己ベストを localStorage に書き込む

#### Scenario: 自己ベスト未更新
- **WHEN** セッションスコアが保存済み自己ベスト以下である
- **THEN** localStorage の自己ベストは変更されない

#### Scenario: データ読み込み失敗
- **WHEN** localStorage のデータが破損または不正な形式である
- **THEN** エラーを無視して自己ベストなし状態として扱う

### Requirement: 自己ベストの表示
トップ画面とリザルト画面で自己ベストを表示する SHALL。

#### Scenario: 初回訪問時のトップ画面
- **WHEN** localStorage に自己ベストが存在しない
- **THEN** トップ画面は自己ベストカードの代わりに案内文を表示する

#### Scenario: リザルト画面での自己ベスト更新演出
- **WHEN** 今回のスコアで自己ベストが更新された
- **THEN** リザルト画面で更新演出を表示する
