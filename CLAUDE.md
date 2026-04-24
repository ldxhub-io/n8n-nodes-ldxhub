# n8n-nodes-ldxhub

## プロジェクト概要
LDX hub API（AI powered ドキュメント処理プラットフォーム）の n8n カスタムノード。
Zuplo 経由で LDX hub API を叩く。

## 設計決定

### ノード構成
- 1つの「LDX hub」ノードに複数アクションを持たせる方式（n8n の Slack ノードと同じ設計）
- 初期アクション: RefineLoop（XLIFF翻訳改善）
- 将来アクション: StructFlow, RenderOCR, CastDoc

### 認証
- n8n の Credentials 統合
- Header Auth 方式: `Authorization: Bearer {apiKey}`
- Credentials 名: LDX hub API

### ポーリング動作（v1.0）
- 同期モード固定（webhook_url パラメータは v1.1 以降で追加）
- ファイルアップロード → ジョブ投入 → ポーリング（5秒間隔） → 完了でファイルダウンロード
- ジョブ失敗（status: failed）は明示的にエラーとして扱う

### Versioned Nodes
- 最初から v1.0 として開発
- 将来のバージョンアップで既存ユーザーに影響が出ないように

### 配布
- 最初は GitHub 公開のみ（npm 未公開でセルフホスト n8n で動作確認）
- 動作確認後に npm 公開
- 最終的に n8n Community Nodes としての verified 申請

## API 情報

### Base URL
https://gw.ldxhub.io

### 主要エンドポイント（RefineLoop 用）
- POST /files (multipart) → file_id 取得
- POST /refineloop/jobs (JSON) → job_id 取得
- GET /refineloop/jobs/{job_id} → ステータス確認
- GET /files/{file_id}/content → ファイルダウンロード

### ジョブステータス
- queued / processing / completed / failed

### 利用可能モデル（RefineLoop）
- openai/gpt-5.4
- openai/gpt-5.4-mini
- azure/gpt-5.4
- azure/gpt-5.4-mini
- google/gemini-3.1-pro-preview
- google/gemini-3-flash-preview
- anthropic/claude-sonnet-4-6
- bedrock/global.amazon.nova-2-lite-v1:0
- xai/grok-4.20-non-reasoning

モデルリストは `GET /refineloop/models` で動的取得可能。
→ n8n の loadOptionsMethod を使って UI 上で動的選択できるようにしたい。

### RefineLoop パラメータ（POST /refineloop/jobs の body）
- file_id (required)
- model (required)
- max_revisions (1-10, default 6)
- domain (optional, string)
- note_language (optional, string) - AIノートの言語
- output_mode (optional, enum: full/translations/none, default full)
- custom_instructions (optional, string)
- remove_hyphenation (optional, boolean, default true)
- exclude_numeric_segments (optional, boolean, default false)

## 次にやること
n8n-nodes-starter テンプレートをベースに、LDX hub 用のスキャフォールドを作成したい。

## 表記ルール

- **本プロジェクト（n8n-nodes-ldxhub）内のユーザー表示文字列**は `LDXhub`（1語）に統一
  - displayName、description、README、keywords など
  - 理由: n8n の lint ルール（title case）との整合、ブランド識別性向上
- **本プロジェクト外（LDX hub 本体、Zuplo、Auth0、Zudoku DevPortal、HubSpot LP 等）**は
  既存の `LDX hub`（2語）表記を維持
  - 変更コストが大きく、現時点では表記統一のメリットを上回らない
  - 将来的に統一する場合の棚卸しリストとしてもこのセクションを参照する
- **TypeScript のクラス名・ファイル名・識別子**は PascalCase の `LdxHub`
  - 例: `LdxHubApi`、`LdxHub.node.ts`、`ldxHubApiRequest`
  - JavaScript/TypeScript の命名慣例に従う

新規コード生成時もこのルールに従うこと。
なお CLAUDE.md 自体は既存の「LDX hub」表記を残したまま、両表記が共存する
ドキュメントとして機能する。

## n8n Cloud 互換性について

### ポーリング方式: HTTP Long Polling via LDXhub `?wait` パラメータ

LDXhub サーバー側（2026-04-23 実装、2026-04-24 本番デプロイ）が以下の挙動:
- `GET /{service}/jobs/{id}?wait=N` → 最大 N 秒（1〜10）サーバー側で待機
- completed / failed になったら即応答（shouldSkipWait フラグで制御）
- queued / processing なら N 秒経過後に現状の状態を返す
- パラメータ未指定 / 0 / 不正値 は wait なし（即応答）
- 10 超は 10 にクリップ
- RefineLoop / StructFlow / RenderOCR / CastDoc 全サービス共通

これを活用し、**クライアント側で `setTimeout` を一切使わずに同期ポーリングを実現**している。
n8n Cloud の `@n8n/community-nodes/no-restricted-globals` ルール（`setTimeout` 禁止）と
`no-restricted-imports` ルール（`node:` imports 禁止）の両方をクリア。

### Polling Settings UI パラメータ（RefineLoop）

| name | default | 範囲 | 意味 |
|---|---|---|---|
| `serverWaitSeconds` | 10 | 1〜10 | サーバー側の待機秒数。?wait= に渡す |
| `pollingMaxAttempts` | 180 | 1〜 | 試行上限。超過時は NodeOperationError |

デフォルト値だと `10s × 180 回 = 約 30 分` まで待機。

### 削除した旧パラメータ（意図的）

- `pollingIntervalSeconds`（旧 default: 5s）
  - **削除理由**: クライアント側 sleep は `setTimeout` を要し、Cloud 互換性ルールと両立しない
  - 機能的には `serverWaitSeconds` で代替可能（サーバー側長ポーリングで十分な間隔制御）
  - 将来クライアント側の追加待機が必要になった場合は、n8n が setTimeout-free な sleep helper
    を提供した段階で再検討。それまではこのパラメータは復活させない
- `pollingTimeoutMinutes`（旧 default: 30min）
  - **削除理由**: `serverWaitSeconds × pollingMaxAttempts` で暗黙的に上限が決まるため重複
  - デフォルト構成で従来と同じ 30 分上限が自然に成立

## 動作確認 TODO

実装完了済み。次は実機テスト:

- [ ] セルフホスト n8n をローカルで起動
- [ ] `npm link` で本パッケージを n8n にリンク
- [ ] 本番 Credentials（`https://gw.ldxhub.io` + API key）で Credentials 作成・
      test エンドポイント (`GET /refineloop/models`) の 200 OK 確認
- [ ] RefineLoop ノードを workflow に配置、model ドロップダウン動的ロード確認
- [ ] 小さめ XLIFF を binary 入力で渡し、`max_revisions=3` で実行
- [ ] ?wait 動作の目視確認（ネットワークタブで 10 秒待機するリクエストを確認）
- [ ] 出力 binary field に refined XLIFF が入ることを確認
- [ ] ジョブ failed パターン（model 未対応等）で NodeOperationError の文言確認
