# 設計: デバッグ用レベル開始ボタン

## Context

- `PlayPage` は初期状態を Lv1 固定で構築している（`useState` の初期化子で `simpleQueue[0]` と `level: 1` を前提）。開始レベルを外部から注入する口がない
- トップ→プレイの遷移は `navigate('/play')` のみで、パラメータを渡していない
- レベルと問題タイプの対応は `gameConfig.ts` の `getLevelType()` に集約済み。Lv2 以降の問題は `generateQuestion(level)` で動的生成できるため、途中レベル開始に技術的な障害はない
- 自己ベストは `tryUpdateBestScore()`（`src/lib/bestScore.ts`）がゲームオーバー時・時間切れ時に呼ばれて更新される

## Goals / Non-Goals

**Goals:**

- 開発時のみ、トップページから Lv1〜Lv5 の任意レベルでプレイを即開始できる
- デバッグ開始（Lv2 以上から開始）したランでは自己ベストを一切更新しない
- 本番ビルド（GitHub Pages）にデバッグ UI を含めない

**Non-Goals:**

- 本番でのレベル選択機能（正規のゲームフローは変更しない）
- デバッグラン専用のスコア表示・記録
- 特定の問題タイプや問題内容を狙って出す機能（レベル指定のみ）

## Decisions

### 1. 開始レベルの受け渡し: React Router の location state

`navigate('/play', { state: { debugStartLevel: n } })` で渡し、`PlayPage` 側は `useLocation().state` から読む。

- 採用理由: HashRouter でも動作し、URL を汚さず、型も局所化できる。state なしの遷移（通常スタート・リトライ）は自動的に従来動作（Lv1 開始）になる
- 代替案: クエリパラメータ（`/play?level=3`）— リロードでも維持される利点はあるが、本番 URL に手打ちでレベル指定できてしまい「開発時のみ」の建前が崩れるため不採用

### 2. デバッグ判定: `debugStartLevel >= 2` のランをデバッグランとする

`PlayPage` 内で `isDebugRun = debugStartLevel >= 2` を保持し、ゲームオーバー時・時間切れ時の `tryUpdateBestScore()` 呼び出しをスキップして `isNewBest: false` としてリザルトへ渡す。

- Lv1 指定のデバッグ開始は正規プレイと完全に同条件なので、通常どおり記録する（判定を単純に保つ）
- レベルアップして進んでも「途中から開始したラン」であることは変わらないため、ラン全体を通してデバッグ扱いにする

### 3. 表示制御: `import.meta.env.DEV` によるレンダリング分岐

`TopPage` で `import.meta.env.DEV && <デバッグボタン群 />` とする。Vite の本番ビルドでは `import.meta.env.DEV` が `false` 定数に置換され、デッドコード除去でバンドルからも消える。

- 代替案: 環境変数やシークレット URL — 静的サイトでは隠蔽にならず複雑化するだけなので不採用

### 4. PlayPage の初期化の一般化

初期レベル `startLevel`（デフォルト 1）を基に初期化する:

- `startLevel === 1`: 従来どおり `simpleQueue[0]` から開始
- `startLevel >= 2`: `generateQuestion(startLevel)` で初回問題を生成

`initQState` や `useState` 初期化子が `simpleQueue[0]` を直接参照している箇所を `startLevel` 対応に書き換える。既存のレベルアップ・出題ロジック（`handleChoice` 内）は変更不要。

### 5. デバッグボタンの表示内容

Lv1〜Lv5 の5ボタンを小さめの横並び（グリッド）で表示し、各ボタンに「Lv.N タイプ名（基礎/レンジ表/フロップ/ターン/リバー）」を示す。タイプ表示名は現在 `PlayPage` にローカル定義されている `levelTypeLabel` を `uiConfig.ts` へ移して共有する。

## Risks / Trade-offs

- [リトライ動線] リザルト画面のリトライは通常の `/play` 遷移なので、デバッグランのリトライは Lv1 通常プレイになる → デバッグ用途では再度トップのボタンを押せば足りるため許容。仕様にもその旨明記する
- [location state はリロードで残る] ブラウザリロード時に history state が残り、デバッグレベルで再開始することがある → 開発時のみの機能であり実害なし
- [デバッグ判定の取り違え] `tryUpdateBestScore` の呼び出し箇所は2箇所（誤答時・時間切れ時）あり、片方だけスキップすると記録が漏れる → 両方を必ず分岐に通すことをタスクで明示し、動作確認する
