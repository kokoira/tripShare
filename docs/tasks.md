# Implementation Plan: TripShare - 旅行記録SNSアプリ（TDD形式）

## Overview

TripShareの実装計画。TDD（テスト駆動開発）アプローチを採用し、各機能について「テスト作成（Red）→ 実装（Green）→ リファクタリング」のサイクルで進める。rswagによるAPI仕様書自動生成、k6パフォーマンステスト、Playwright E2Eテストを統合する。

## Tasks

- [ ] 1. プロジェクト基盤セットアップ
  - [x] 1.1 Docker Compose環境とプロジェクト構造を構築する
    - ルートに`docker-compose.yml`を作成（frontend, backend, db, k6 サービス定義）
    - `frontend/`ディレクトリにNext.js 15プロジェクトを初期化（TypeScript, Tailwind CSS 3, App Router）
    - `backend/`ディレクトリにRails 7.2 APIモードプロジェクトを初期化（MySQL 8.0アダプタ）
    - 各サービスのDockerfileを作成
    - `docker compose up`で全サービスが起動することを確認
    - _Requirements: 全体（技術スタック要件）_

  - [ ] 1.2 テスト基盤・ログ基盤・Swagger基盤をセットアップする
    - バックエンド: RSpec, rswag-specs, rswag-api, rswag-ui, Rantly を追加・設定
    - バックエンド: `spec/swagger_helper.rb` にOpenAPI 3.0基本定義とスキーマを記述
    - バックエンド: lograge gem を追加し、JSON構造化ログ出力を設定（request_id, user_id, duration_ms等）
    - フロントエンド: Vitest, React Testing Library, fast-check を追加・設定
    - フロントエンド: Playwright を追加し、`playwright.config.ts` を作成（chromium + mobile）
    - k6ディレクトリ `k6/` を作成
    - `rake rswag:specs:swaggerize` が空のswagger.yamlを生成することを確認
    - _Requirements: 全体（テスト・ログ基盤）_

  - [ ] 1.3 データベーススキーマとモデルを作成する
    - マイグレーションファイルを作成: users, sessions, login_attempts, posts, post_images, comments, likes, follows テーブル
    - 設計書のインデックス設計に基づきインデックスを追加
    - ActiveRecordモデルを作成し、アソシエーション・バリデーションを定義
    - `rails db:migrate`で正常にスキーマが作成されることを確認
    - _Requirements: 1, 2, 3, 5, 6, 7, 8_

  - [ ] 1.4 フロントエンドの共通レイアウトとAPIクライアント層を構築する
    - `src/lib/api-client.ts`にAPIクライアント（fetch wrapper、エラーハンドリング、Cookie送信、構造化エラーログ）を実装
    - `src/types/`に共通型定義（User, Post, Comment, Like, ApiError等）を作成
    - `src/app/layout.tsx`にルートレイアウトを実装
    - `src/components/ui/`に共通UIコンポーネントを作成
    - _Requirements: 12（UI共通要件）_

- [ ] 2. 認証機能（TDD）
  - [ ] 2.1 認証APIのテストを先に書く（Red）
    - rswag形式のRequest Spec: POST /api/v1/auth/register（正常系・バリデーションエラー系）
    - rswag形式のRequest Spec: POST /api/v1/auth/login（正常系・認証失敗系・アカウントロック系）
    - rswag形式のRequest Spec: DELETE /api/v1/auth/logout
    - rswag形式のRequest Spec: GET /api/v1/auth/me（認証済み・未認証）
    - モデルSpec: Userモデルのバリデーション（メール形式、パスワード長、一意性）
    - プロパティテスト: メールアドレス形式、パスワード長、ハッシュ化不可逆性、未認証拒否
    - 全テストがREDであることを確認
    - _Requirements: 1, 2_

  - [ ] 2.2 認証APIを実装する（Green）
    - `RegistrationsController`: registerアクション
    - `SessionsController`: login, logout, meアクション
    - bcryptパスワードハッシュ化、セッション管理（トークン生成、Cookie設定、24時間有効期限）
    - 認証ミドルウェア（`authenticate_user!`）
    - ログイン試行制限（5分10回で30分ロック）
    - 構造化ログ出力（ログイン成功/失敗、登録、ログアウト）
    - 全テストがGREENになることを確認
    - `rake rswag:specs:swaggerize` でswagger.yamlに認証APIが追加されることを確認
    - _Requirements: 1, 2_

  - [ ] 2.3 フロントエンドの認証テストを先に書く（Red）
    - Vitest + fast-check: メールバリデーション、パスワード長バリデーション
    - Vitest + React Testing Library: ログインフォーム、登録フォームのコンポーネントテスト
    - _Requirements: 1, 2_

  - [ ] 2.4 フロントエンドのログイン・登録画面を実装する（Green）
    - `/login`, `/register` ページ
    - 認証状態管理フック（`useAuth`）、認証ガード
    - 全テストがGREENになることを確認
    - _Requirements: 1, 2_

- [ ] 3. チェックポイント - 認証機能
  - テスト全通過・Swagger UI確認・ログ出力確認

- [ ] 4. 投稿・タイムライン機能（TDD）
  - [ ] 4.1 投稿APIのテストを先に書く（Red）
    - rswag形式Request Spec: GET /api/v1/posts（ページネーション・ソート）
    - rswag形式Request Spec: POST /api/v1/posts（正常系・バリデーション・権限）
    - rswag形式Request Spec: DELETE /api/v1/posts/:id（本人のみ・403）
    - プロパティテスト: 投稿本文バリデーション、メタデータ付与、削除権限制御、ソート・ページネーション
    - _Requirements: 3, 4_

  - [ ] 4.2 投稿APIを実装する（Green）
    - `PostsController`: index, create, show, destroy
    - カーソルベースページネーション、バリデーション、権限チェック
    - 構造化ログ（投稿作成・削除）
    - _Requirements: 3, 4_

  - [ ] 4.3 フロントエンドのタイムライン・投稿テストを先に書く（Red）
    - Vitest: 日時フォーマット関数、文字数カウンターロジック
    - Vitest + fast-check: 投稿本文バリデーション
    - React Testing Library: 投稿カード、投稿フォームコンポーネント
    - _Requirements: 3, 4_

  - [ ] 4.4 フロントエンドのタイムライン・投稿画面を実装する（Green）
    - `/timeline` ページ（無限スクロール、タブ切り替え、投稿作成、削除）
    - `/posts/[id]` 投稿詳細ページ
    - _Requirements: 3, 4_

- [ ] 5. チェックポイント - 投稿・タイムライン機能
  - テスト全通過・Swagger更新確認

- [ ] 6. コメント機能（TDD）
  - [ ] 6.1 コメントAPIのテストを先に書く（Red）
    - rswag形式Request Spec: GET/POST /api/v1/posts/:post_id/comments, DELETE /api/v1/comments/:id
    - プロパティテスト: コメント本文バリデーション、メタデータ付与、ソート・件数制限
    - _Requirements: 5_

  - [ ] 6.2 コメントAPIを実装する（Green）
    - `CommentsController`: index, create, destroy
    - カウンタキャッシュ更新、構造化ログ
    - _Requirements: 5_

  - [ ] 6.3 フロントエンドのコメントテストと実装
    - テスト先行（Vitest + fast-check: コメント本文バリデーション）
    - コメント一覧・入力フォーム・削除機能の実装
    - _Requirements: 5_

- [ ] 7. いいね機能（TDD）
  - [ ] 7.1 いいねAPIのテストを先に書く（Red）
    - rswag形式Request Spec: POST/DELETE /api/v1/posts/:post_id/likes
    - プロパティテスト: トグルラウンドトリップ、一意性制約
    - _Requirements: 6_

  - [ ] 7.2 いいねAPIを実装する（Green）
    - `LikesController`: create, destroy
    - トランザクション + 楽観的ロック、構造化ログ
    - _Requirements: 6_

  - [ ] 7.3 フロントエンドのいいねテストと実装
    - テスト先行（Vitest + fast-check: いいね数フォーマット、トグルロジック）
    - いいねボタンコンポーネント実装
    - _Requirements: 6_

- [ ] 8. チェックポイント - コメント・いいね機能
  - テスト全通過・Swagger更新確認

- [ ] 9. 画像投稿機能（TDD）
  - [ ] 9.1 画像APIのテストを先に書く（Red）
    - rswag形式Request Spec: POST /api/v1/images/presigned_url
    - プロパティテスト: 枚数・形式・サイズ・解像度バリデーション、サムネイルアスペクト比
    - _Requirements: 7_

  - [ ] 9.2 画像APIを実装する（Green）
    - `ImagesController`: presigned_url
    - S3クライアント設定、サムネイル生成ジョブ、構造化ログ
    - _Requirements: 7_

  - [ ] 9.3 フロントエンドの画像テストと実装
    - テスト先行（Vitest + fast-check: 画像バリデーション）
    - 画像選択UI、Presigned URLアップロード、プレビュー
    - _Requirements: 7_

- [ ] 10. フォロー機能（TDD）
  - [ ] 10.1 フォローAPIのテストを先に書く（Red）
    - rswag形式Request Spec: POST/DELETE /api/v1/users/:user_id/follow, GET followers/following, GET /api/v1/timeline/following
    - プロパティテスト: ラウンドトリップ、自己フォロー禁止、ソート・ページネーション、フィルタリング、冪等性、上限
    - _Requirements: 8_

  - [ ] 10.2 フォローAPIを実装する（Green）
    - `FollowsController`: create, destroy, followers, following
    - フォロータイムラインAPI、カウンタ更新、構造化ログ
    - _Requirements: 8_

  - [ ] 10.3 フロントエンドのフォローテストと実装
    - フォロー/解除ボタン、一覧ページ、タイムライン「フォロー中」タブ
    - _Requirements: 8_

- [ ] 11. チェックポイント - 画像・フォロー機能
  - テスト全通過・Swagger更新確認

- [ ] 12. ユーザー検索・プロフィール・ハッシュタグ機能（TDD）
  - [ ] 12.1 検索・プロフィールAPIのテストを先に書く（Red）
    - rswag形式Request Spec: GET /api/v1/users/search, GET /api/v1/users/:id
    - プロパティテスト: 部分一致検索、クエリバリデーション、ページネーション、レスポンス完全性
    - _Requirements: 9, 10, 11_

  - [ ] 12.2 検索・プロフィールAPIを実装する（Green）
    - `UsersController`: search, show, update
    - ハッシュタグ抽出ロジック、構造化ログ
    - _Requirements: 9, 10, 11_

  - [ ] 12.3 フロントエンドの検索・プロフィール・ハッシュタグテストと実装
    - 検索画面（ユーザー/タグタブ）、プロフィール画面（編集モーダル）、タグ別投稿一覧
    - _Requirements: 9, 10, 11_

- [ ] 13. UI/UX共通要件の実装
  - [ ] 13.1 トースト通知・ライトボックス・おすすめユーザー・トレンドタグを実装する
    - トースト通知コンポーネント（成功/エラー/情報、3秒自動消去）
    - 画像ライトボックスコンポーネント（Escで閉じる）
    - 右サイドパネル: おすすめユーザー、トレンドタグ
    - _Requirements: 12_

- [ ] 14. E2Eテスト（Playwright）
  - [ ] 14.1 シナリオテストを作成する
    - ユーザー登録→ログインフロー
    - 投稿作成→タイムライン表示確認
    - 投稿削除→確認ダイアログ→消失確認
    - コメント投稿→表示確認→削除
    - いいねトグル（カウント増減確認）
    - フォロー→フォロー中タイムラインフィルタ確認
    - ユーザー検索→プロフィール遷移
    - 認証ガード（未ログインリダイレクト）
    - バリデーションエラー表示（空投稿、文字数超過等）
    - _Requirements: 全体_

  - [ ] 14.2 ブラウザパフォーマンステストを作成する
    - LCP計測: タイムラインページ（目標 < 2.5s）
    - FID計測: タイムラインページ（目標 < 100ms）
    - CLS計測: 全ページ（目標 < 0.1）
    - ページ読み込み時間: ログイン画面（目標 < 1.5s）
    - スクロール応答: 無限スクロール（目標 < 200ms）
    - いいね反映時間計測（目標 < 300ms）
    - _Requirements: 12（パフォーマンス）_

- [ ] 15. CI/CD パイプライン構築（GitHub Actions）
  - [ ] 15.1 バックエンドCI（backend-ci.yml）を作成する
    - RuboCop による lint チェック
    - Brakeman によるセキュリティスキャン
    - RSpec 実行（単体テスト + 統合テスト + rswag）
    - MySQL 8.0 サービスコンテナの設定
    - テストカバレッジレポートのアップロード
    - _Requirements: 全体（品質保証）_

  - [ ] 15.2 フロントエンドCI（frontend-ci.yml）を作成する
    - ESLint による lint チェック
    - Prettier によるフォーマットチェック
    - `tsc --noEmit` による型チェック
    - Vitest 実行（コンポーネント・ユーティリティ・fast-check）
    - `next build` によるビルド確認
    - _Requirements: 全体（品質保証）_

  - [ ] 15.3 E2E テストCI（e2e-ci.yml）を作成する
    - Docker Compose で全サービス起動（frontend + backend + db）
    - DBマイグレーション + シードデータ投入
    - Playwright テスト実行（chromium + mobile）
    - テスト結果・スクリーンショット・動画のアーティファクト保存
    - backend-ci と frontend-ci の通過を前提条件に設定
    - _Requirements: 全体（品質保証）_

  - [ ] 15.4 デプロイワークフロー（deploy.yml）を作成する
    - main ブランチマージ時にトリガー
    - バックエンド: Docker build → ECR push → ECS サービス更新
    - フロントエンド: `next build` + `next export` → S3 sync → CloudFront invalidation
    - _Requirements: 全体（デプロイ）_

- [ ] 16. インフラ構築（Terraform）
  - [ ] 16.1 Terraform プロジェクト基盤を構築する
    - `terraform/` ディレクトリ作成
    - プロバイダー設定（AWS、ap-northeast-1）
    - tfstate リモートバックエンド設定（S3 + DynamoDB）
    - 変数定義（variables.tf）、出力定義（outputs.tf）
    - _Requirements: 全体（インフラ）_

  - [ ] 16.2 ネットワーク層を構築する（VPC / サブネット / セキュリティグループ）
    - VPC（10.0.0.0/16）
    - Public Subnet × 2 AZ（ALB用）
    - Private Subnet × 2 AZ（ECS用）
    - Private Subnet × 2 AZ（RDS用）
    - Internet Gateway、NAT Gateway
    - ルートテーブル
    - セキュリティグループ（ALB: 80/443、ECS: 3000 from ALB、RDS: 3306 from ECS）
    - _Requirements: 全体（インフラ）_

  - [ ] 16.3 データベース層を構築する（RDS）
    - RDS MySQL 8.0 インスタンス（db.t3.micro、開発用）
    - DB サブネットグループ
    - パラメータグループ（文字コードutf8mb4）
    - シークレットは SSM Parameter Store で管理
    - _Requirements: 全体（インフラ）_

  - [ ] 16.4 コンテナ基盤を構築する（ECR / ECS Fargate / ALB）
    - ECR リポジトリ（tripshare-api）
    - ECS クラスター
    - ECS タスク定義（Rails API、環境変数はSSM参照）
    - ECS サービス（Fargate起動タイプ、desired count: 1）
    - ALB + ターゲットグループ + リスナー（HTTP/HTTPS）
    - IAM ロール（タスク実行ロール、タスクロール）
    - _Requirements: 全体（インフラ）_

  - [ ] 16.5 静的ホスティング・画像ストレージを構築する（S3 / CloudFront）
    - S3 バケット（フロントエンド静的ファイル用）
    - S3 バケット（画像アップロード用）
    - CloudFront ディストリビューション（フロントエンド配信、OAC設定）
    - CloudFront ディストリビューション（画像配信）
    - バケットポリシー（CloudFrontからのみアクセス許可）
    - CORS設定（画像バケット: Presigned URLアップロード対応）
    - _Requirements: 7（画像保存）、全体（インフラ）_

  - [ ] 16.6 シークレット・環境変数管理を構築する（SSM Parameter Store）
    - DATABASE_URL
    - RAILS_MASTER_KEY
    - AWS_ACCESS_KEY_ID / SECRET_ACCESS_KEY（S3アクセス用）
    - S3_BUCKET_NAME
    - SESSION_SECRET
    - _Requirements: 全体（インフラ）_

- [ ] 17. パフォーマンステスト（k6）
  - [ ] 17.1 APIロードテストを作成する
    - タイムライン取得: 同時10ユーザー×60秒（p95 < 500ms）
    - 投稿作成: 同時5ユーザー×30秒（p95 < 1000ms）
    - いいねトグル: 同時20ユーザー×60秒（p95 < 300ms）
    - ユーザー検索: 同時10ユーザー×30秒（p95 < 500ms）
    - 複合シナリオ: ログイン→TL→投稿→いいね→コメント（p95 < 2000ms）
    - _Requirements: 全体（パフォーマンス）_

- [ ] 18. 最終チェックポイント
  - 全テスト通過（RSpec, Vitest, Playwright, k6）
  - Swagger UI でAPI仕様確認
  - 構造化ログの出力確認
  - カバレッジ目標達成確認

## Notes

- 全タスクでTDD（テスト先行）を採用: テストが先、実装が後
- rswagのRequest SpecがAPI仕様書（swagger.yaml）を自動生成する
- 構造化ログはlograge（JSON形式）で全APIリクエストに付与
- k6は`docker compose --profile test run k6`で実行
- Playwrightは`docker compose exec frontend npx playwright test`で実行
- チェックポイントでテストが通らない場合は前のタスクに戻って修正

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.3"] },
    { "id": 3, "tasks": ["2.2", "2.4"] },
    { "id": 4, "tasks": ["4.1", "4.3"] },
    { "id": 5, "tasks": ["4.2", "4.4"] },
    { "id": 6, "tasks": ["6.1", "7.1"] },
    { "id": 7, "tasks": ["6.2", "6.3", "7.2", "7.3"] },
    { "id": 8, "tasks": ["9.1", "10.1"] },
    { "id": 9, "tasks": ["9.2", "9.3", "10.2", "10.3"] },
    { "id": 10, "tasks": ["12.1"] },
    { "id": 11, "tasks": ["12.2", "12.3"] },
    { "id": 12, "tasks": ["13.1"] },
    { "id": 13, "tasks": ["14.1", "14.2"] },
    { "id": 14, "tasks": ["15.1", "15.2", "15.3", "15.4"] },
    { "id": 15, "tasks": ["16.1"] },
    { "id": 16, "tasks": ["16.2"] },
    { "id": 17, "tasks": ["16.3", "16.4", "16.5"] },
    { "id": 18, "tasks": ["16.6"] },
    { "id": 19, "tasks": ["17.1"] },
    { "id": 20, "tasks": ["18"] }
  ]
}
```
