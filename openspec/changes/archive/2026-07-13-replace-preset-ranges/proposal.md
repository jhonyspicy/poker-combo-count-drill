# Proposal: プリセットレンジの全面置き換え

## Why

現在のプリセットレンジ3種（タイトなオープンレンジ・ブロードウェイ中心・スーテッド中心）は、ユーザーが実際に練習したいレンジと一致していない。ユーザーが指定した1つのレンジ（レンジ表画像で提供）に置き換え、覚えるべきレンジを1つに集中して練習できるようにする。

## What Changes

- **BREAKING**: 既存のプリセットレンジ3種（`tight-open` / `broadway` / `suited-connectors`）を全て削除する
- ユーザー指定の新レンジ1種を追加する。内容（画像から読み取り、合計216コンボ）:
  - ペア: AA〜77（AA, KK, QQ, JJ, TT, 99, 88, 77）
  - スーテッド: A2s+ 全て / K5s+ / Q9s+ / JTs
  - オフスート: ATo+（AKo, AQo, AJo, ATo）/ KJo+（KQo, KJo）
- プリセットが1種になるため、`pickPresetRange()` は常にこのレンジを返す
- 既存テストのプリセット固有の期待値（tight-open の 236 コンボ等）を新レンジに合わせて更新する
- README のプリセットレンジ記述（「数種類から選ぶ」）を実態に合わせて更新する

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `preset-ranges`: 「複数種類のプリセットから選択する」という要件を「単一のユーザー定義レンジを使用する」に変更。定義・グリッド展開・コンボ数計算・検証テストの要件自体は維持

## Impact

- `src/lib/presetRanges.ts` — `PRESET_RANGES` の定義を置き換え（型・計算ロジックは変更なし）
- `src/lib/__tests__/presetRanges.test.ts` — プリセット固有の期待値（グリッド展開・合計コンボ数 236 など）を新レンジ基準に更新
- `src/lib/questions.ts` — 変更不要の見込み（`pickPresetRange()` 経由で参照しているだけ）
- `README.md` — プリセットレンジの説明を更新
- UI にプリセット名を表示している箇所があれば表示名が変わる（機能影響なし）
