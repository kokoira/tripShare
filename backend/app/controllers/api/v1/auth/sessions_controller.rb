module Api
  module V1
    module Auth
      # セッション管理コントローラー
      # POST   /api/v1/auth/login
      # DELETE /api/v1/auth/logout
      # GET    /api/v1/auth/me
      class SessionsController < ApplicationController
        before_action :authenticate_user!, only: [:me]

        # POST /api/v1/auth/login
        def create
          email    = params[:email].to_s.strip.downcase
          password = params[:password].to_s

          # Requirement 2.7: 形式バリデーション（DBへのアクセス前に弾く）
          if email.blank? || !valid_email_format?(email)
            return render json: {
              errors: [{ field: 'email', message: 'メールアドレスの形式が正しくありません' }]
            }, status: :bad_request
          end

          if password.length < 8 || password.length > 72
            return render json: {
              errors: [{ field: 'password', message: 'パスワードは8文字以上72文字以内で入力してください' }]
            }, status: :bad_request
          end

          # アカウントロックチェック（Requirement 2.3）
          if LoginAttempt.locked?(email)
            Rails.logger.warn({
              event:  'login_blocked',
              email:  email
            }.to_json)
            return render json: {
              error:       'アカウントがロックされています。30分後に再試行してください',
              retry_after: 1800
            }, status: :too_many_requests
          end

          # ユーザー認証
          user = User.find_by(email: email)
          if user.nil? || !user.authenticate(password)
            # 失敗ログを記録
            LoginAttempt.create!(
              email:        email,
              attempted_at: Time.current,
              success:      false
            )
            Rails.logger.warn({
              event: 'login_failed',
              email: email
            }.to_json)
            return render json: { error: 'メールアドレスまたはパスワードが正しくありません' }, status: :unauthorized
          end

          # 成功ログを記録
          LoginAttempt.create!(
            email:        email,
            attempted_at: Time.current,
            success:      true
          )

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
            event:    'login_success',
            user_id:  user.id,
            email:    user.email
          }.to_json)

          render json: { user: user_json(user) }, status: :ok
        end

        # DELETE /api/v1/auth/logout
        def destroy
          token = cookies[:session_token]

          if token.present?
            session_record = Session.find_by(session_token: token)
            if session_record
              user_id = session_record.user_id
              session_record.destroy
              Rails.logger.info({
                event:   'logout',
                user_id: user_id
              }.to_json)
            end
            cookies.delete(:session_token)
          end

          render json: { message: 'ログアウトしました' }, status: :ok
        end

        # GET /api/v1/auth/me
        def me
          render json: { user: user_json(current_user) }, status: :ok
        end

        private

        def valid_email_format?(email)
          URI::MailTo::EMAIL_REGEXP.match?(email)
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
