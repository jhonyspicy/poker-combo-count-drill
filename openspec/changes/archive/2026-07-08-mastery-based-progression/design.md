## Context

現状の `PlayPage.tsx` は「5問正解ごとにレベルアップ」「レベル別の重み付き抽選で出題タイプを混在」という設計になっている。今回はこれを「各レベルが1種類のタイプに対応」「習熟条件を満たしたら次のレベルへ」という設計に全面変更する。

関係するファイル:
- `src/config/gameConfig.ts` — レベル設定の一元管理
- `src/lib/questions.ts` — 問題生成関数
- `src/pages/PlayPage.tsx` — ゲーム本体のロジック

## Goals / Non-Goals

**Goals:**
- 各レベルを1つの問題タイプ（simple/flop/turn/river）に対応させる
- Lv1: SIMPLE_POOL の全8問を1回ずつシャッフルして出題し、全問正解でクリア
- Lv2+: 20問連続正解で次のレベルへ進む
- 間違えたらゲームオーバーの仕様は維持
- レベル内進捗（N/M）をUIに表示する

**Non-Goals:**
- セッションをまたいだレベル進捗の永続化
- Lv1 失敗時の部分的な再開（全問やり直し、現状と同じゲームオーバー）
- 問題タイプの定義変更（simple/flop/turn/river の中身は変えない）

## Decisions

### 1. Lv1の問題キューを PlayPage で管理する

`questions.ts` に `generateAllSimpleQuestions(): Question[]` を追加し、ゲーム開始時に全8問を生成・シャッフルして `PlayPage` の state に保存する。Lv1中はこのキューから順番に問題を取り出す。

**代替案**: SIMPLE_POOL のインデックスをtrackして随時生成 → より複雑になるため却下。

### 2. レベルとタイプのマッピングを `getLevelType(level)` として gameConfig に追加

```
Lv1 → 'simple'
Lv2 → 'flop'
Lv3 → 'turn'
Lv4+ → 'river'
```

`LEVEL_TYPE_WEIGHTS` と `pickRandomType` は削除し、`getLevelType` に一本化する。  
`generateQuestion(level)` はLv2以降のボード問題生成のみに使用する（Lv1はキューから取得するため呼ばれない）。

### 3. 習熟条件の定数を gameConfig で管理

- `SIMPLE_POOL_SIZE` (= 8) または `SIMPLE_POOL` のlengthをLv1の条件として参照
- `MASTERY_STREAK` = 20（Lv2以降の連続正解数）

`QUESTIONS_PER_LEVEL` は削除する。

### 4. PlayPage の state 設計

| state | 型 | 用途 |
|---|---|---|
| `score` | number | 総正解数（現状と同じ） |
| `level` | number | 現在レベル |
| `progressInLevel` | number | 現レベル内の正解数 |
| `simpleQueue` | Question[] | Lv1用キュー（初期化時に生成、以降変更なし） |

`questionsInLevel` は `progressInLevel` に名称変更・意味を統一する。

### 5. 進捗表示の更新

ヘッダーにレベル内進捗（`progressInLevel / masteryRequired`）を追加表示する。総スコアは現状通り表示を維持する。

## Risks / Trade-offs

- [リスク] Lv1でゲームオーバーになると全8問をやり直しになる → 仕様として明確に定義（現状のゲームオーバー動作と同じ）
- [リスク] SIMPLE_POOL の問題が少ない（8問）ため、繰り返しプレイ時に同じ問題順になりにくくなる → シャッフルで緩和
- [トレードオフ] 習熟ストリーク数（20問）はハードコードせず gameConfig に集約することで後からチューニング可能
