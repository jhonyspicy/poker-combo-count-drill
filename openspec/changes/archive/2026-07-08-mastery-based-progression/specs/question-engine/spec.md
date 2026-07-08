## MODIFIED Requirements

### Requirement: 単純問題の提供
Lv1 では固定問題セット（SIMPLE_POOL）の全問題を1回ずつシャッフルして提供する SHALL。同一セッション内で同じ問題が重複出題されることはない。

#### Scenario: Lv1 開始時に全単純問題をシャッフル
- **WHEN** ゲームが開始されて Lv1 になる
- **THEN** SIMPLE_POOL の全問題がシャッフルされ、順番に出題されるキューとして準備される

#### Scenario: Lv1 での問題取得
- **WHEN** Lv1 で次の問題を取得する
- **THEN** キューから未出題の問題が1つ取り出され、同一問題の重複はない
