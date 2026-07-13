# Delta Spec: preset-ranges

## MODIFIED Requirements

### Requirement: プリセットレンジの定義
相手のレンジはあらかじめ定義された単一のプリセット（ユーザー指定レンジ）を使用する SHALL。問題ごとにレンジを動的生成してはならない SHALL NOT。プリセットは id・表示名・ハンド表記の列挙（"AA" / "AKs" / "AKo" 形式）で `src/lib/presetRanges.ts` に定義する SHALL。

プリセットの内容は以下のハンド集合とする SHALL（合計216コンボ）:

- ペア: AA, KK, QQ, JJ, TT, 99, 88, 77
- スーテッド: AKs, AQs, AJs, ATs, A9s, A8s, A7s, A6s, A5s, A4s, A3s, A2s, KQs, KJs, KTs, K9s, K8s, K7s, K6s, K5s, QJs, QTs, Q9s, JTs
- オフスート: AKo, AQo, AJo, ATo, KQo, KJo

#### Scenario: プリセットからの選択
- **WHEN** プリセットレンジを使う問題が生成される
- **THEN** 定義済みプリセットが選ばれ、その内容は上記のハンド集合と完全に一致する

#### Scenario: 表記からグリッドへの展開
- **WHEN** プリセットのハンド表記列を 13×13 グリッドに展開する
- **THEN** ペアは対角セル、スーテッドは右上セル、オフスートは左下セルに正しくマップされる

#### Scenario: デッドカードなしの合計コンボ数
- **WHEN** デッドカードなしでプリセットの合計コンボ数を計算する
- **THEN** ペア8種×6 + スーテッド24種×4 + オフスート6種×12 = 216 となる

## REMOVED Requirements

（削除する要件はなし。「プリセットレンジのコンボ数計算」「プリセット定義の検証テスト」の要件は変更なく維持される。旧プリセット3種〔tight-open / broadway / suited-connectors〕の廃止は上記 MODIFIED に含まれる）
