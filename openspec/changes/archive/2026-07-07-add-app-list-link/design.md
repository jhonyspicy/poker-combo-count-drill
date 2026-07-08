## Context

トップページ（`TopPage.tsx`）にはすでにスタートボタン・遊び方リンクが配置されている。
そこに `https://jhonyspicy.github.io/` へのテキストリンクを追加する。
変更箇所は1ファイル・数行のみ。

## Goals / Non-Goals

**Goals:**
- トップページ下部のリンクエリアに「アプリ一覧」外部リンクを追加する
- 既存の遊び方リンクと視覚的に一貫したスタイルにする

**Non-Goals:**
- 新規コンポーネントの作成
- ルーティング・状態管理への変更
- 他画面への変更

## Decisions

- `<a>` タグを使い `target="_blank" rel="noopener noreferrer"` を付与して外部リンクとして開く
- スタイルは既存の遊び方リンク（`text-slate-400 text-sm underline underline-offset-2`）に合わせる
- 配置は遊び方リンクの下に追加し、`text-center` で中央揃えにする

## Risks / Trade-offs

- 外部リンク追加のみのため、リスクは実質ゼロ
