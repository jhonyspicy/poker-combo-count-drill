## MODIFIED Requirements

### Requirement: 難易度設定の一元管理
難易度に関わるすべての数値（難易度別の基準時間・ストリート別加算・短縮係数・下限比率・上級の答えの許容範囲・上級のヒント有効問題数）を `src/config/gameConfig.ts` に集約する SHALL。

#### Scenario: 設定変更の反映
- **WHEN** gameConfig の数値を変更する
- **THEN** コンポーネントを変更せずにゲームの難易度が変化する

#### Scenario: ヒント有効問題数の変更
- **WHEN** gameConfig の上級ヒント有効問題数を変更する
- **THEN** コンポーネントを変更せずに、上級序盤の負けセルヒントが表示される問題数が変化する
