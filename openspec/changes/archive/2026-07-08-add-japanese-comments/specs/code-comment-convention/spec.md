## ADDED Requirements

### Requirement: ソースコードのコメントは日本語で記述する
ソースコード内のすべてのコメントは日本語で記述しなければならない（SHALL）。コメントを書く基準は「WHY が非自明な場合のみ」とし、コードが何をするかを説明するコメントは書かない。

#### Scenario: 非自明なロジックに日本語コメントが付いている
- **WHEN** コンボ計算式（`comb2`, `pairCombos`, `suitedCombos`, `offsuitCombos`）を読む
- **THEN** 各関数の前提条件・計算根拠が日本語コメントで説明されている

#### Scenario: 英語コメントが残っていない
- **WHEN** `src/lib/` および `src/config/` 以下のファイルを確認する
- **THEN** 英語のコメントが存在しない
