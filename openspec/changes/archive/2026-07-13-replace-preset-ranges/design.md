# Design: プリセットレンジの全面置き換え

## Context

`src/lib/presetRanges.ts` の `PRESET_RANGES` に3つのプリセット（tight-open / broadway / suited-connectors）が定義されており、`pickPresetRange()` がランダムに1つを選ぶ。初級のプリセットレンジ問題（`questions.ts` の `makePresetRangeQuestion`）と上級のレンジ×ボード問題（`countRangeVsHero` 系）の両方がこの仕組みを使う。テスト（`presetRanges.test.ts`）にはプリセット固有の期待値（tight-open のグリッド展開、合計236コンボ）がある。

新レンジはユーザー提供のレンジ表画像から読み取った以下の1つ（合計216コンボ = ペア8×6 + スーテッド24×4 + オフスート6×12）:

| 種別 | ハンド |
|---|---|
| ペア | AA, KK, QQ, JJ, TT, 99, 88, 77 |
| スーテッド | A2s+（Ax全て）, K5s+, Q9s+, JTs |
| オフスート | ATo+（AKo/AQo/AJo/ATo）, KJo+（KQo/KJo） |

## Goals / Non-Goals

**Goals:**
- 旧プリセット3種を削除し、新レンジ1種に置き換える
- 型（`PresetRange`）・グリッド展開・コンボ数計算のロジックは一切変更しない
- テストを新レンジ基準に更新し、216コンボであることを検算で担保する

**Non-Goals:**
- レンジ編集UI・複数レンジ切り替え機能の追加
- 問題生成ロジック（`questions.ts`）の変更
- レンジ表の表示コンポーネントの変更

## Decisions

1. **配列構造は維持し、要素を1つにする**: `PRESET_RANGES: PresetRange[]` の型と `pickPresetRange()` のシグネチャは変えない。将来レンジを増やす場合に呼び出し側の変更が不要で、変更範囲が定義データとテストだけに収まる。代替案（単一オブジェクト化してAPIを整理）は呼び出し側の書き換えが必要になるため見送り。
2. **新プリセットの id は `user-range`、表示名は「あなたのレンジ」**: 画像のラベルに合わせる。
3. **hands の記述順は既存の慣例に合わせる**: ペア → Ax スーテッド → Kx/Qx/Jx スーテッド → オフスートの順で、コメント付きでグループ化する（既存定義と同じスタイル）。
4. **テストの期待値はロジックで検算した値を書く**: 合計216（デッドなし）を明記。グリッド展開のスポットチェック（K5s は in / K4s は out、QJo は out、ATo は in、77 は in / 66 は out など境界セル）を新レンジ基準に書き直す。

## Risks / Trade-offs

- [画像の読み取りミスでレンジ内容が意図と違う] → proposal / spec / design にハンド一覧と合計216コンボを明記し、実装前にユーザーが確認できるようにする。境界（K5s/K4s、Q9s/Q8s、JTs/J9s、ATo/KTo、KJo/QJo、77/66）をテストで固定する
- [プリセットが1種になり、問題のバリエーションが減る] → ユーザーの意図通り（覚えるレンジを1つに集中）。仕様として明文化済み
- [README・spec の「複数種類」記述との食い違い] → README と `openspec/specs/preset-ranges` を同時に更新する（spec は delta 経由）
