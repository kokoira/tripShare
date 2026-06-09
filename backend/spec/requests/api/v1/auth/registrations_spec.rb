# spec/requests/api/v1/auth/registrations_spec.rb
# TDD Red フェーズ: POST /api/v1/auth/register のテスト
# 実装が未完成なため、全テストが失敗（RED）することを確認する
require 'swagger_helper'

RSpec.describe 'POST /api/v1/auth/register', type: :request do
  path '/api/v1/auth/register' do
    post 'ユーザー登録' do
      tags 'Auth'
      consumes 'application/json'
      produces 'application/json'
      description 'メールアドレス・パスワード・ユーザー名でアカウントを作成する'

      parameter name: :user_params, in: :body, schema: {
        type: :object,
        properties: {
          email:    { type: :string, example: 'test@example.com' },
          password: { type: :string, example: 'password123' },
          username: { type: :string, example: 'testuser' }
        },
        required: %w[email password username]
      }

      # --- 正常系 ---

      response '201', 'ユーザー登録成功' do
        schema type: :object,
               properties: {
                 user: { '$ref' => '#/components/schemas/User' },
                 token: { type: :string }
               },
               required: %w[user]

        let(:user_params) do
          { email: 'newuser@example.com', password: 'password123', username: 'newuser' }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['user']).to be_present
          expect(data['user']['email']).to eq('newuser@example.com')
          expect(data['user']['username']).to eq('newuser')
          # パスワードは返さない
          expect(data['user']['password']).to be_nil
          expect(data['user']['password_digest']).to be_nil
        end
      end

      # --- バリデーションエラー系 ---

      response '400', 'メールアドレス未入力' do
        schema '$ref' => '#/components/schemas/ValidationError'

        let(:user_params) do
          { email: '', password: 'password123', username: 'testuser' }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['errors']).to be_present
          fields = data['errors'].map { |e| e['field'] }
          expect(fields).to include('email')
        end
      end

      response '400', 'パスワード未入力' do
        schema '$ref' => '#/components/schemas/ValidationError'

        let(:user_params) do
          { email: 'test@example.com', password: '', username: 'testuser' }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['errors']).to be_present
          fields = data['errors'].map { |e| e['field'] }
          expect(fields).to include('password')
        end
      end

      response '400', 'メールアドレス形式不正（RFC 5322非準拠）' do
        schema '$ref' => '#/components/schemas/ValidationError'

        let(:user_params) do
          { email: 'not-an-email', password: 'password123', username: 'testuser' }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['errors']).to be_present
          fields = data['errors'].map { |e| e['field'] }
          expect(fields).to include('email')
        end
      end

      response '400', 'パスワードが8文字未満' do
        schema '$ref' => '#/components/schemas/ValidationError'

        let(:user_params) do
          { email: 'test@example.com', password: 'short', username: 'testuser' }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['errors']).to be_present
          fields = data['errors'].map { |e| e['field'] }
          expect(fields).to include('password')
        end
      end

      response '400', 'パスワードが128文字超' do
        schema '$ref' => '#/components/schemas/ValidationError'

        let(:user_params) do
          { email: 'test@example.com', password: 'a' * 129, username: 'testuser' }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['errors']).to be_present
          fields = data['errors'].map { |e| e['field'] }
          expect(fields).to include('password')
        end
      end

      response '400', 'メールアドレスが既に使用済み' do
        schema '$ref' => '#/components/schemas/ValidationError'

        before { create(:user, email: 'existing@example.com') }

        let(:user_params) do
          { email: 'existing@example.com', password: 'password123', username: 'newuser' }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['errors']).to be_present
          fields = data['errors'].map { |e| e['field'] }
          expect(fields).to include('email')
        end
      end

      response '400', 'ユーザー名が既に使用済み' do
        schema '$ref' => '#/components/schemas/ValidationError'

        before { create(:user, username: 'takenuser') }

        let(:user_params) do
          { email: 'unique@example.com', password: 'password123', username: 'takenuser' }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['errors']).to be_present
          fields = data['errors'].map { |e| e['field'] }
          expect(fields).to include('username')
        end
      end
    end
  end
end
