# spec/requests/api/v1/auth/authentication_property_spec.rb
# Property 4: 未認証アクセスの拒否（APIレベルのプロパティテスト）
# 有効なセッションを持たないリクエストは401で拒否されること
# Validates: Requirements 2.5
require 'rails_helper'
require 'rantly/rspec_extensions'

RSpec.describe 'Property 4: 未認証アクセスの拒否', type: :request do
  # 認証が必要なエンドポイント一覧
  PROTECTED_ENDPOINTS = [
    { method: :get,    path: '/api/v1/auth/me' }
  ].freeze

  describe '認証が必要なエンドポイントへの未認証アクセスは401を返す' do
    PROTECTED_ENDPOINTS.each do |endpoint|
      context "#{endpoint[:method].upcase} #{endpoint[:path]}" do
        it '無効なセッショントークン（ランダム文字列）では401が返る' do
          property_of {
            # ランダムなセッショントークン（DBに存在しないもの）
            sized(rand(10..50)) { string(:alpha) }
          }.check(20) { |random_token|
            # セッションDBには存在しないトークン
            cookies['session_token'] = random_token
            send(endpoint[:method], endpoint[:path])
            expect(response.status).to eq(401),
              "無効なセッショントークンでアクセスしたのに#{response.status}が返りました（期待値: 401）"
          }
        end

        it 'セッションCookieなしでは401が返る' do
          send(endpoint[:method], endpoint[:path])
          expect(response.status).to eq(401),
            "セッションCookieなしでアクセスしたのに#{response.status}が返りました（期待値: 401）"
        end

        it '期限切れセッションでは401が返る' do
          property_of {
            # 1時間〜30日前（確実に期限切れ）
            rand(3600..2_592_000).seconds.ago
          }.check(10) { |expired_time|
            user    = create(:user)
            session = create(:session, user: user, expires_at: expired_time)
            cookies['session_token'] = session.session_token
            send(endpoint[:method], endpoint[:path])
            expect(response.status).to eq(401),
              "期限切れセッション（#{expired_time}）でアクセスしたのに#{response.status}が返りました（期待値: 401）"
          }
        end
      end
    end
  end
end
