## REMOVED Requirements

### Requirement: 開発時のみのデバッグボタン表示
**Reason**: レベル進行の廃止により「任意レベルから開始する」ニーズ自体が消滅する。難易度選択はトップページの標準機能になる。
**Migration**: トップページの難易度選択ボタン（`game-screens` の「トップ画面」）で代替。デバッグボタン群と `DEBUG_LEVELS` を削除する。

### Requirement: 指定レベルからのプレイ開始
**Reason**: 同上。`/play/:difficulty` ルートで任意の難易度から直接開始できる。
**Migration**: `difficulty-modes` の「難易度のルーティング」で代替。`debugStartLevel` の navigation state を削除する。

### Requirement: デバッグランの自己ベスト非記録
**Reason**: デバッグラン自体が消滅する。全難易度が正規プレイであり、常に自己ベストを記録する。
**Migration**: `score-tracker` の難易度別記録に置き換え。`isDebugRun` 判定を削除する。
