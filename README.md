# TripShare - 旅行記録SNSアプリ

X/Twitter のタイムライン形式を参考にした、テキスト＋画像で旅行の思い出を記録・共有できるSNSアプリケーション。学習目的で開発するが、複数ユーザーの利用を想定した本格的な設計で構築する。

## 機能一覧

| 機能 | 概要 |
|------|------|
| ユーザー登録・ログイン | メールアドレス＋パスワードによるアカウント管理（セッションベース認証） |
| タイムライン | 全ユーザー / フォロー中の投稿を時系列で表示（無限スクロール） |
| 投稿 | テキスト（280文字以内）＋画像（最大4枚）の旅行記録を投稿 |
| コメント | 投稿に対してコメントを投稿（200文字以内） |
| いいね | 投稿に対していいねを付与・取消（トグル式） |
| 画像投稿 | JPEG/PNG/GIF対応、5MB以下、S3へ直接アップロード |
| フォロー | ユーザーをフォロー/フォロー解除、タイムラインのフィルタリング |
| ユーザー検索 | ユーザー名の部分一致検索、プロフィール表示 |

## 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js / React / TypeScript / Tailwind CSS | 15 / 19 / 5 / 3 |
| バックエンド | Ruby on Rails（APIモード）/ Ruby | 7.2 / 3.3 |
| データベース | MySQL | 8.0 |
| 画像保存 | AWS S3 | - |
| 実行環境 | Docker Compose | - |
| 本番インフラ（想定） | EC2 + RDS + ALB + CloudFront | AWS |

## アーキテクチャ

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│   ブラウザ   │────▶│  Next.js 15      │────▶│  Rails 7.2 API │
│             │     │  (フロントエンド)  │     │  (バックエンド) │
└─────────────┘     └──────────────────┘     └───────┬────────┘
       │                                              │
       │  画像直接アップロード                          │
       ▼                                              ▼
┌─────────────┐                              ┌────────────────┐
│   AWS S3    │                              │   MySQL 8.0    │
│  (画像保存)  │                              │   (データ)     │
└─────────────┘                              └────────────────┘
```

- フロントエンドとバックエンドを完全分離（SPA + REST API）
- セッションベース認証（HttpOnly Cookie）
- 画像はPresigned URLでクライアントからS3へ直接アップロード
- カーソルベースページネーション（無限スクロール対応）

## ディレクトリ構成

```
tripShare/
├── docker-compose.yml          # Docker Compose設定
├── frontend/                   # Next.js 15 プロジェクト
│   ├── Dockerfile
│   ├── src/
│   │   ├── app/                # App Router（ページ）
│   │   ├── components/         # UIコンポーネント
│   │   ├── hooks/              # カスタムフック
│   │   ├── lib/                # ユーティリティ・APIクライアント
│   │   └── types/              # TypeScript型定義
│   └── package.json
├── backend/                    # Rails 7.2 API プロジェクト
│   ├── Dockerfile
│   ├── app/
│   │   ├── controllers/api/v1/ # APIコントローラー
│   │   ├── models/             # ActiveRecordモデル
│   │   └── services/           # サービスオブジェクト
│   ├── db/
│   │   └── migrate/            # マイグレーションファイル
│   └── Gemfile
├── docs/                       # ドキュメント
│   └── 機能仕様書.md
├── prototype/                  # HTMLプロトタイプモック
└── .kiro/specs/travel-sns-app/ # Spec（要件定義・設計・タスク）
```

## セットアップ手順

### 前提条件

- Docker / Docker Compose がインストール済み
- AWS アカウント（S3バケット作成済み、アクセスキー取得済み）

### 環境変数の設定

プロジェクトルートに `.env` ファイルを作成:

```env
# AWS S3設定
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-northeast-1
S3_BUCKET_NAME=tripshare-images-dev
```

### 起動

```bash
# 全サービスをビルド＆起動
docker compose up --build

# バックグラウンドで起動
docker compose up -d
```

### アクセスURL

| サービス | URL |
|---------|-----|
| フロントエンド | http://localhost:3000 |
| バックエンドAPI | http://localhost:3001 |
| MySQL | localhost:3306 |

### データベースのセットアップ

```bash
# マイグレーション実行
docker compose exec backend rails db:create db:migrate

# シードデータ投入（開発用）
docker compose exec backend rails db:seed
```

## API一覧

### 認証

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| POST | `/api/v1/auth/register` | ユーザー登録 |
| POST | `/api/v1/auth/login` | ログイン |
| DELETE | `/api/v1/auth/logout` | ログアウト |
| GET | `/api/v1/auth/me` | 現在のユーザー情報 |

### 投稿

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/api/v1/posts` | タイムライン取得 |
| POST | `/api/v1/posts` | 投稿作成 |
| GET | `/api/v1/posts/:id` | 投稿詳細 |
| DELETE | `/api/v1/posts/:id` | 投稿削除 |

### コメント

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/api/v1/posts/:post_id/comments` | コメント一覧 |
| POST | `/api/v1/posts/:post_id/comments` | コメント作成 |
| DELETE | `/api/v1/comments/:id` | コメント削除 |

### いいね

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| POST | `/api/v1/posts/:post_id/likes` | いいね付与 |
| DELETE | `/api/v1/posts/:post_id/likes` | いいね取消 |

### フォロー

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| POST | `/api/v1/users/:user_id/follow` | フォロー |
| DELETE | `/api/v1/users/:user_id/follow` | フォロー解除 |
| GET | `/api/v1/users/:user_id/followers` | フォロワー一覧 |
| GET | `/api/v1/users/:user_id/following` | フォロー中一覧 |
| GET | `/api/v1/timeline/following` | フォロー中タイムライン |

### ユーザー

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/api/v1/users/search` | ユーザー検索 |
| GET | `/api/v1/users/:id` | プロフィール取得 |

### 画像

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| POST | `/api/v1/images/presigned_url` | アップロード用URL取得 |

## テスト

```bash
# バックエンドテスト（RSpec）
docker compose exec backend bundle exec rspec

# フロントエンドテスト（Vitest）
docker compose exec frontend npm run test

# E2Eテスト（Playwright）
docker compose exec frontend npm run test:e2e
```

## X/Twitter との違い

| 項目 | X/Twitter | TripShare |
|------|-----------|-----------|
| インプレッション数 | 表示あり | 表示なし |
| リツイート | あり | なし |
| テーマ | 汎用 | 旅行記録特化 |
| 投稿文字数 | 280文字 | 280文字 |
| 画像枚数 | 4枚 | 4枚 |

## ドキュメント

| ドキュメント | パス | 内容 |
|-------------|------|------|
| 機能仕様書 | `docs/機能仕様書.md` | 人間が読みやすい形式の機能仕様 |
| 要件定義書 | `.kiro/specs/travel-sns-app/requirements.md` | EARS形式の正式要件 |
| 技術設計書 | `.kiro/specs/travel-sns-app/design.md` | システム設計・ER図・API設計 |
| タスクリスト | `.kiro/specs/travel-sns-app/tasks.md` | 実装タスク一覧 |
| プロトタイプ | `prototype/index.html` | HTMLモック（ブラウザで直接確認可能） |

## ライセンス

学習目的のプロジェクトのため、ライセンスは未定。
