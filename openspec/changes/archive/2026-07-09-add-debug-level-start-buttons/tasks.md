# タスク: デバッグ用レベル開始ボタン

## 1. 共有定義の整理

- [x] 1.1 `PlayPage.tsx` にローカル定義されている `levelTypeLabel`（基礎/レンジ表/フロップ/ターン/リバー）を `src/config/uiConfig.ts` へ移動し、`PlayPage` から参照するよう変更する

## 2. PlayPage の開始レベル対応

- [x] 2.1 `useLocation().state` から `debugStartLevel`（数値、省略時は 1）を読み取り、初期レベルとして採用する
- [x] 2.2 初期状態の構築を開始レベル対応にする: Lv1 は従来どおり `simpleQueue[0]`、Lv2 以上は `generateQuestion(startLevel)` で初回問題を生成し、制限時間・タイマー初期値もその問題に合わせる
- [x] 2.3 `isDebugRun`（`debugStartLevel >= 2`）を保持し、誤答時と時間切れ時の**両方**の `tryUpdateBestScore()` 呼び出しをスキップして `isNewBest: false` をリザルトへ渡す

## 3. TopPage のデバッグボタン

- [x] 3.1 `import.meta.env.DEV` が真のときのみ表示するデバッグボタン群（Lv1〜Lv5、レベル番号＋タイプ名表示）を追加し、タップで `navigate('/play', { state: { debugStartLevel: n } })` する。ダーク基調・スマホ縦画面に馴染む控えめなスタイルにする

## 4. 検証

- [x] 4.1 `npm run build` が通ることを確認する（本番ビルドでデバッグ UI がデッドコード除去されることの担保を兼ねる）
- [x] 4.2 開発サーバー（ポート 5174 を使用）で確認: 各デバッグボタンから該当レベル・該当タイプの問題で開始されること、通常スタートが従来どおり Lv1 で始まること
- [x] 4.3 デバッグラン（Lv2 以上開始）でゲームオーバーしても localStorage の自己ベストが変化しないこと、リザルトに更新演出が出ないことを確認する
