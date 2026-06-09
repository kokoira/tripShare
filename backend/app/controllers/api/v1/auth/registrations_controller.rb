module Api
  module V1
    module Auth
      # ユーザー登録コントローラー
      # POST /api/v1/auth/register
      class RegistrationsController < ApplicationController
        def create
          user = User.new(registration_params)

          unless user.valid?
            # バリデーションエラーを { errors: [{ field:, message: }] } 形式で返す
            errors = user.errors.map do |error|
              { field: error.attribute.to_s, message: error.message }
            end
            return render json: { errors: errors }, status: :bad_request
          end

          user.save!

          # セッション生成
          session_record = Session.create_for_user(user)
          cookies[:session_token] = {
            value:     session_record.session_token,
            expires:   session_record.expires_at,
            httponly:  true,
            same_site: :lax,
            secure:    Rails.env.production?
          }

          # 構造化ログ出力
          Rails.logger.info({
            event:    'user_registered',
            user_id:  user.id,
            email:    user.email,
            username: user.username
          }.to_json)

          render json: { user: user_json(user) }, status: :created
        end

        private

        def registration_params
          params.permit(:email, :password, :password_confirmation, :username)
        end

        def user_json(user)
          {
            id:              user.id,
            email:           user.email,
            username:        user.username,
            avatar_key:      user.avatar_key,
            following_count: user.following_count,
            followers_count: user.followers_count,
            created_at:      user.created_at.iso8601
          }
        end
      end
    end
  end
end
