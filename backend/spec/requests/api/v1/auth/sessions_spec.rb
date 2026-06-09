# spec/requests/api/v1/auth/sessions_spec.rb
# TDD Red フェーズ: 認証セッション関連のAPIテスト
# 実装が未完成なため、全テストが失敗（RED）することを確認する
require 'swagger_helper'

RSpec.describe '認証セッション API', type: :request do
  # ===== POST /api/v1/auth/login =====
  path '/api/v1/auth/login' do
    post 'ログイン' do
      tags 'Auth'
      consumes 'application/json'
      produces 'application/json'
      description '正しいメールアドレスとパスワードでログインしてセッションを開始する'

      parameter name: :credentials, in: :body, schema: {
        type: :object,
        properties: {
          email:    { type: :string, example: 'user@example.com' },
          password: { type: :string, example: 'password123' }
        },
        required: %w[email password]
      }

      # --- 正常系 ---

      response '200', 'ログイン成功' do
        schema type: :object,
               properties: {
                 user: { '$ref' => '#/components/schemas/User' }
               },
               required: %w[user]

        let(:user) { create(:user, email: 'login@example.com', password: 'password123') }
        let(:credentials) { { email: 'login@example.com', password: 'password123' } }

        before { user }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['user']).to be_present
          expect(data['user']['email']).to eq('login@example.com')
          # セッションCookieが設定されていること
          expect(response.cookies['session_token'] || response.headers['Set-Cookie']).to be_present
        end
      end

      # --- 認証失敗系 ---

      response '401', 'パスワードが誤っている' do
        schema '$ref' => '#/components/schemas/ApiError'

        let(:user) { create(:user, email: 'fail@example.com', password: 'correctpassword') }
        let(:credentials) { { email: 'fail@example.com', password: 'wrongpassword' } }

        before { user }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to be_present
        end
      end

      response '401', 'メールアドレスが存在しない' do
        schema '$ref' => '#/components/schemas/ApiError'

        let(:credentials) { { email: 'nonexistent@example.com', password: 'password123' } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to be_present
        end
      end

      response '400', 'メールアドレス形式不正（RFC 5322非準拠）' do
        schema '$ref' => '#/components/schemas/ValidationError'

        let(:credentials) { { email: 'not-an-email', password: 'password123' } }

        run_test! do |response|
          data = JSON.parse(response.body)
          # ログイン試行を実行せず、形式エラーを返す（Requirement 2.7）
          expect(data['errors'] || data['error']).to be_present
        end
      end

      response '400', 'パスワードが8文字未満（ログイン試行なし）' do
        schema '$ref' => '#/components/schemas/ValidationError'

        let(:credentials) { { email: 'user@example.com', password: 'short' } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['errors'] || data['error']).to be_present
        end
      end

      response '400', 'パスワードが72文字超（bcryptの切り捨て対策、ログイン試行なし）' do
        schema '$ref' => '#/components/schemas/ValidationError'

        let(:credentials) { { email: 'user@example.com', password: 'a' * 73 } }

        run_test! do |response|
          data = JSON.parse(response.body)
          # Requirement 2.7: 72文字超はログイン試行を実行しない
          expect(data['errors'] || data['error']).to be_present
        end
      end

      # --- アカウントロック系 ---

      response '429', '5分間に10回ログイン失敗でアカウントロック' do
        schema type: :object,
               properties: {
                 error:       { type: :string },
                 retry_after: { type: :integer }
               },
               required: %w[error retry_after]

        let(:user) { create(:user, email: 'locked@example.com', password: 'correctpassword') }
        let(:credentials) { { email: 'locked@example.com', password: 'wrongpassword' } }

        before do
          user
          # 5分以内に10回失敗を記録（Requirement 2.3）
          10.times do
            create(:login_attempt,
                   email:        'locked@example.com',
                   attempted_at: 1.minute.ago,
                   success:      false)
          end
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to be_present
          expect(data['retry_after']).to eq(1800) # 30分 = 1800秒
        end
      end
    end
  end

  # ===== DELETE /api/v1/auth/logout =====
  path '/api/v1/auth/logout' do
    delete 'ログアウト' do
      tags 'Auth'
      produces 'application/json'
      description 'セッションを破棄してログアウトする'
      security [{ cookieAuth: [] }]

      # --- 正常系 ---

      response '200', 'ログアウト成功' do
        schema type: :object,
               properties: {
                 message: { type: :string }
               },
               required: %w[message]

        let(:user)    { create(:user) }
        let(:session) { create(:session, user: user) }

        before do
          session
          # セッションCookieをセット
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['message']).to be_present
          # セッションが削除されていること
          expect(Session.find_by(id: session.id)).to be_nil
        end
      end

      response '200', '未認証状態でのログアウトも200を返す' do
        schema type: :object,
               properties: {
                 message: { type: :string }
               },
               required: %w[message]

        run_test!
      end
    end
  end

  # ===== GET /api/v1/auth/me =====
  path '/api/v1/auth/me' do
    get '現在のユーザー情報取得' do
      tags 'Auth'
      produces 'application/json'
      description '認証済みユーザーの情報を返す'
      security [{ cookieAuth: [] }]

      # --- 認証済み ---

      response '200', '認証済みの場合はユーザー情報を返す' do
        schema type: :object,
               properties: {
                 user: { '$ref' => '#/components/schemas/User' }
               },
               required: %w[user]

        let(:user)    { create(:user) }
        let(:session) { create(:session, user: user) }

        before do
          session
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['user']).to be_present
          expect(data['user']['id']).to eq(user.id)
          expect(data['user']['email']).to eq(user.email)
        end
      end

      # --- 未認証 ---

      response '401', '未認証の場合は401を返す（Requirement 2.5）' do
        schema '$ref' => '#/components/schemas/ApiError'

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to be_present
        end
      end

      response '401', 'セッションが期限切れの場合は401を返す（Requirement 2.6）' do
        schema '$ref' => '#/components/schemas/ApiError'

        let(:user)    { create(:user) }
        let(:session) { create(:session, user: user, expires_at: 25.hours.ago) }

        before do
          session
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to be_present
        end
      end
    end
  end
end
