## Why

CLAUDE.md に「ソースコードのコメントは日本語を使う」と定めているが、現状のソースには英語コメントが残っている。日本語に統一することで保守性を高め、ガイドラインとの一貫性を保つ。

## What Changes

- `src/lib/comboCalculator.ts` の英語コメントを日本語に変換し、非自明なロジックに補足コメントを追加
- `src/lib/questions.ts` の英語コメントを日本語に変換し、セクション区切りや distractor 生成ロジックの意図を補足
- `src/config/gameConfig.ts` の英語コメントを日本語に変換
- `src/lib/bestScore.ts` の英語コメントを日本語に変換

## Capabilities

### New Capabilities
（なし）

### Modified Capabilities
（なし — コメントの追加・変換は実装詳細の変更であり、スペックレベルの振る舞い変更を伴わない）

## Impact

- 変更対象: `src/lib/comboCalculator.ts`, `src/lib/questions.ts`, `src/config/gameConfig.ts`, `src/lib/bestScore.ts`
- 動作への影響: なし（コメントのみの変更）
- API・型定義・依存関係への影響: なし
