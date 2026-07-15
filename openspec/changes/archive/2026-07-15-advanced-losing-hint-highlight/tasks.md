## 1. 設定とデータ構造

- [x] 1.1 `src/config/gameConfig.ts` に `ADVANCED_HINT_QUESTIONS = 10`（上級ヒント有効問題数）を追加する
- [x] 1.2 `src/lib/rangeQuestions.ts` の `RangeCell` に任意プロパティ `lose?: boolean` を追加する
- [x] 1.3 `src/config/uiConfig.ts` の `RANGE_GRID_COLORS` に負けセル用の `loseBg` / `loseFg`（アンバーと区別できる赤系）を追加する

## 2. 負けセル判定ロジック

- [x] 2.1 `src/lib/questions.ts` の `countRangeVsHero` を `preset.hands` ごとの `expandHandCombos` ループに変更し、負けコンボを1つ以上含むハンドタイプの集合 `loseHands` を `RangeVsHeroCount` に追加で返す（lose/win/chop/total の値は従来と同一であること）
- [x] 2.2 `buildAdvancedQuestion` で `loseHands` と `cellLabel` を突き合わせ、レンジ内セルに `lose: true` を付与する
- [x] 2.3 `src/lib/__tests__/` にテストを追加する: 負けセルはすべてレンジ内である / 負けセルごとの負けコンボ数の合計が答えと一致する / 既存の合計値（lose/win/chop/total）が回帰しない

## 3. UI（レンジ表と残りヒント数）

- [x] 3.1 `src/components/RangeGrid.tsx` に `showLoseHint?: boolean` を追加し、true のとき `hit && lose` セルを負けセル色で描画、凡例に「負けあり」を追加する（false のときは従来表示のまま）
- [x] 3.2 `src/pages/PlayPage.tsx` で `question.type === 'range-vs-board' && score < ADVANCED_HINT_QUESTIONS` のとき `showLoseHint` を渡し、レンジ表パネル直下に「ヒント表示中（残り N 問）」を表示する（N = ADVANCED_HINT_QUESTIONS − score）
- [x] 3.3 上級の3要素が1画面に収まることをスマホ幅（375px）で確認する（残りヒント数の一行を足してもレイアウトが崩れない）

## 4. ドキュメント

- [x] 4.1 `src/pages/HowToPage.tsx` の上級編説明に序盤ヒントの説明を追記する（ハイライト＝負けコンボを1つ以上含むセル、全コンボが負けとは限らない）
- [x] 4.2 `README.md` の上級編仕様に序盤ヒント（有効問題数・意味・残りヒント数表示）を追記する

## 5. 検証

- [x] 5.1 `npm run build` と `npx vitest run` が通ることを確認する
- [x] 5.2 開発サーバー（ポート5174）で上級編を実際にプレイし、ヒント表示・凡例・残りヒント数のカウントダウン・11問目でのヒント消滅を目視確認する
- [x] 5.3 初級・中級のレンジ表示に変化がないことを確認する
