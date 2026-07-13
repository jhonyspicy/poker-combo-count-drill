# Tasks: プリセットレンジの全面置き換え

## 1. レンジ定義の置き換え

- [x] 1.1 `src/lib/presetRanges.ts` の `PRESET_RANGES` から旧3プリセット（tight-open / broadway / suited-connectors）を削除し、新プリセット（id: `user-range`、name: 「あなたのレンジ」）を追加する。hands は design.md の表の通り（ペア AA〜77 / A2s+ / K5s+ / Q9s+ / JTs / ATo+ / KQo・KJo）

## 2. テストの更新

- [x] 2.1 `src/lib/__tests__/presetRanges.test.ts` の旧プリセット固有の期待値（tight-open のグリッド展開・合計236コンボなど）を新レンジ基準に更新する。デッドなし合計は 216 を期待値とする
- [x] 2.2 グリッド展開の境界セルテストを追加・更新する（in: K5s, Q9s, JTs, ATo, KJo, 77 / out: K4s, Q8s, J9s, KTo, QJo, 66）
- [x] 2.3 `src/lib/__tests__/questions.test.ts` に旧プリセット前提の箇所がないか確認し、あれば更新する（現状はテスト用の独自レンジを使っており影響なしの見込み）

## 3. ドキュメントの更新

- [x] 3.1 README.md の「プリセットレンジ」節を更新する（「あらかじめ定義した数種類から選ぶ」→ 単一のユーザー定義レンジを使う旨に修正）

## 4. 検証

- [x] 4.1 `npx vitest run` で全テストが通ることを確認する
- [x] 4.2 `npm run build` が通ることを確認する
- [x] 4.3 開発サーバーで初級のプリセットレンジ問題と上級のレンジ×ボード問題を表示し、レンジ表のハイライトが新レンジ（画像）と一致することを確認する
