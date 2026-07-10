## 1. 設定とドメインロジック（UIより先に固める）

- [x] 1.1 `src/config/gameConfig.ts` を難易度別設定に全面改訂する: `Difficulty` 型・`DIFFICULTY_CONFIG`（label / baseTimeSec / streetTimeBonusSec / timeScaleFactor / timeFloorRatio）・上級の答え許容範囲（1〜60）と再抽選上限・`getTimeLimitSec(difficulty, street | null, streak)` を定義。旧 `getLevelType` / `MASTERY_STREAK` / レベル連動スケーリングを削除する
- [x] 1.2 `src/lib/handEvaluator.ts` を新規作成する: `evaluate5`（役カテゴリ+タイブレークの数値エンコード、ホイール対応）と `evaluateBest`（5〜7枚から C(n,5) 全列挙で最強スコア）を実装する
- [x] 1.3 `src/lib/__tests__/handEvaluator.test.ts` を作成する: 全役カテゴリの順序・同カテゴリのタイブレーク（キッカー含む）・ホイール（A-5 は 6 ハイより弱い）・ボードプレイ（チョップ）を検証し `npm run test` を通す
- [x] 1.4 `src/lib/presetRanges.ts` を新規作成する: `{ id, name, hands }` 形式でプリセットレンジを3種類定義（1種類目はデザインファイルの inRange 相当: 55+ / Axs / 大きめAxo / ブロードウェイ / スーテッドコネクター）。ハンド表記→13×13グリッド展開とデッドカード考慮の合計コンボ数計算関数を実装する
- [x] 1.5 `src/lib/__tests__/presetRanges.test.ts` を作成する: 全プリセットの表記正当性・重複なし・グリッド展開の正しさ・合計コンボ数（デッドカードなし/あり）を検証する

## 2. 問題生成の再編

- [x] 2.1 `src/lib/questions.ts` の `Question` 型を再編する: `QuestionType` を `'beginner-range' | 'board-count' | 'range-vs-board'` に変更し、`rangeLabel?`（レンジパネル見出し）を追加。`difficulty` ごとの生成入口 `generateQuestion(difficulty)` に一本化し、SIMPLE_POOL / generateAllSimpleQuestions を削除する
- [x] 2.2 `src/lib/rangeQuestions.ts` を拡張して初級問題を実装する: 単一ハンドパターン（AA/AKs/AKo、ランクランダム）・ハンドグループパターン（AK合計・Ax・スーテッド・オフスート・ペア・全体1326）・プリセットレンジ合計パターンを追加。単一ハンド問題の誤答は 4/6/12/16 の取り違えを優先する
- [x] 2.3 中級問題を接続する: 既存の makePair/makeSuited/makeOffsuit 問題生成を `board-count` タイプとして流用し、ストリート（フロップ/ターン/リバー）をランダム選択にする
- [x] 2.4 上級問題（range-vs-board）を実装する: プリセットレンジ+ボード+ハンドを抽選し、handEvaluator でレンジ内コンボとの勝敗を数えて「負け/勝ち」問題を生成（チョップ除外・答えが許容範囲外なら再抽選・上限で打ち切り）。解説文（レンジ内総コンボ数と勝敗の根拠）も組み立てる
- [x] 2.5 `src/lib/__tests__/` に上級問題生成のテストを追加する: 既知のボード・ハンド・レンジ固定で負け/勝ちコンボ数が手計算と一致すること、デッドカード除外・チョップ除外を検証する

## 3. スコア記録

- [x] 3.1 `src/lib/bestScore.ts` を難易度別記録に変更する: 新キー `poker-drill-best-v2` に `Partial<Record<Difficulty, { score, date }>>` を保存。`loadBestScores()` / `tryUpdateBestScore(difficulty, score)` に改め、旧キーは読み込まず初回保存時に削除する

## 4. 画面の改修

- [x] 4.1 `src/App.tsx` のルートを `/play/:difficulty` に変更し、不正な難易度はトップへリダイレクトする
- [x] 4.2 `src/components/RangeGrid.tsx` をデザインファイルのパネル仕様に合わせて拡張する: カード風パネル（#111a2e 背景・#263252 枠・max-width 330px）、見出し（「レンジ表」/「相手のレンジ」を props で切替）、凡例チップ、13×13 グリッド（ハイライト #f5b83d）
- [x] 4.3 フェルト帯コンポーネントを作成する: デザインファイルの角丸帯（radial-gradient フェルト + 木枠）にボード（42×60px）と自分のハンド（44×62px）を縦仕切り線で並べる。`PlayingCard` にサイズ variant を追加して再利用する
- [x] 4.4 `src/pages/PlayPage.tsx` を全面改修する: ルートパラメータから難易度を取得し、ヘッダー（難易度名+連続正解数）→タイマーバー→問題3要素の出し分け→フィードバック行→2×2選択肢の縦積みに再構成。レベル関連 state（level / progressInLevel / levelUpVisible / debugStartLevel / isDebugRun）を削除し、制限時間を連続正解数連動にする
- [x] 4.5 `src/pages/TopPage.tsx` を改修する: 単一スタートボタンとデバッグボタン群を削除し、初級編/中級編/上級編の3ボタン（各ボタンに出題内容の一言説明とその難易度の自己ベスト）に置き換える
- [x] 4.6 `src/pages/ResultPage.tsx` を改修する: 難易度表示・その難易度の自己ベスト（更新演出）・同じ難易度でのリトライに変更。レベル表示を削除する
- [x] 4.7 `src/pages/HowToPage.tsx` のルール説明を3難易度制（出題内容・時間短縮・一発アウト）に更新する
- [x] 4.8 `src/config/uiConfig.ts` を整理する: `LEVEL_TYPE_LABEL` を難易度ラベルに置き換え、レンジパネル・フェルト帯の追加配色があれば集約する

## 5. ドキュメントと検証

- [x] 5.1 `README.md` を全面更新する: コンセプト・ゲームルール・画面構成（トップの難易度選択）・問題タイプ（3難易度×3要素）・制限時間（連続正解数連動）・自己ベスト（難易度別）のセクションを新仕様に書き換え、レベル進行・デバッグ機能の記述を削除する
- [x] 5.2 `npm run test` / `npm run lint` / `npm run build` がすべて通ることを確認する
- [x] 5.3 開発サーバー（ポート5174で検証）で3難易度を実プレイ確認する: 各難易度の3要素表示・時間短縮・ゲームオーバー→リザルト→同難易度リトライ・難易度別自己ベストの記録、モバイル幅（430px以下）で上級の3要素が1画面に収まること
