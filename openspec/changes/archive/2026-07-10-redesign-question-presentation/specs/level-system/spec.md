## REMOVED Requirements

### Requirement: レベル進行
**Reason**: レベル進行型（Lv1→Lv5 の習熟型レベルアップ）を廃止し、トップページで難易度を直接選択する3モード制に置き換えるため。上級者が難しい問題だけを練習できるようにする。
**Migration**: `difficulty-modes` ケイパビリティの「3難易度モードの提供」に置き換え。`MASTERY_STREAK`・レベルアップ処理・レベルアップ演出を削除する。

### Requirement: レベル別出題タイプ構成
**Reason**: レベルと出題タイプの対応を廃止し、難易度モードと出題タイプの固定対応（初級=レンジ表+文章 / 中級=ボード+文章 / 上級=レンジ表+ボード+文章）に置き換えるため。
**Migration**: `difficulty-modes` の「3難易度モードの提供」および `question-engine` の各問題生成要件に置き換え。`getLevelType` を削除する。

### Requirement: 制限時間のスケーリング
**Reason**: レベル連動の時間スケーリングを廃止し、連続正解数に応じた時間短縮に置き換えるため。
**Migration**: `difficulty-modes` の「連続正解数に応じた制限時間の短縮」に置き換え。

### Requirement: 設定値の一元管理
**Reason**: 要件自体は存続するが、管理対象がレベル関連定数から難易度別設定に変わるため、`difficulty-modes` 側で再定義する。
**Migration**: `difficulty-modes` の「難易度設定の一元管理」に置き換え。`src/config/gameConfig.ts` への集約方針は変わらない。
