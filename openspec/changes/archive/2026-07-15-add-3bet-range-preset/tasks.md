## 1. レンジ定義の追加

- [x] 1.1 `src/lib/presetRanges.ts` の `PRESET_RANGES` に「3ベットレンジ」（id: `three-bet-range`）を追加する。hands は design.md の集合（ペア AA/KK/QQ/JJ、スーテッド AKs・A7s〜A2s・K9s〜K4s・QJs/QTs/Q9s、オフスート AKo/AQo/AJo/KQo/KJo/QJo）を既存レンジと同じグルーピング・コメント様式で記述する

## 2. テスト

- [x] 2.1 `src/lib/__tests__/presetRanges.test.ts` に3ベットレンジのテストを追加する: ハンドタイプ数（ペア4・スーテッド16・オフスート6）、デッドカードなし合計コンボ数が160であること、既存の全プリセット共通検証（表記の正当性・重複なし）が新レンジも通ること
- [x] 2.2 `npx vitest run` で全テストが通ることを確認する

## 3. ドキュメント

- [x] 3.1 README.md のプリセットレンジ表に「3ベットレンジ | ペア JJ+ / AKs / A7s-A2s / K9s-K4s / Q9s+ / AJo+ / KJo+ / QJo | 160」の行を追加する（表記は既存行の様式に合わせる）

## 4. 検証

- [x] 4.1 `npm run build` と `npm run lint` が通ることを確認する
- [x] 4.2 開発サーバーで初級プリセットレンジ問題・上級問題に「3ベットレンジ」が出題され、レンジ表ハイライトが添付画像と一致することを確認する
