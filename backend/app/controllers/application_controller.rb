class ApplicationController < ActionController::API
  include ActionController::Cookies

  # 全コントローラーで使用する共通エラーハンドリング
  rescue_from ActiveRecord::RecordNotFound,       with: :not_found
  rescue_from ActiveRecord::RecordInvalid,        with: :unprocessable_entity
  rescue_from ActionController::ParameterMissing, with: :bad_request

  private

  # ==============================
  # 認証ヘルパー
  # ==============================

  # 認証済みユーザーを取得（nilの場合は未認証）
  def current_user
    return @current_user if defined?(@current_user)

    token = cookies[:session_token]
    return @current_user = nil if token.blank?

    session_record = Session.find_by(session_token: token)
    return @current_user = nil if session_record.nil? || session_record.expired?

    @current_user = session_record.user
  end

  # 認証必須フィルター
  def authenticate_user!
    return if current_user

    render json: { error: '認証が必要です' }, status: :unauthorized
  end

  # ==============================
  # ログ用ペイロード追加
  # ==============================

  # lograge に user_id と request_id を追加
  def append_info_to_payload(payload)
    super
    payload[:user_id]   = current_user&.id
    payload[:request_id] = request.request_id
    payload[:ip]         = request.remote_ip
  end

  # ==============================
  # エラーレスポンス
  # ==============================

  def not_found(exception)
    render json: { error: 'リソースが見つかりません' }, status: :not_found
  end

  def unprocessable_entity(exception)
    render json: {
      errors: exception.record.errors.map do |error|
        { field: error.attribute.to_s, message: error.message }
      end,
    }, status: :unprocessable_entity
  end

  def bad_request(exception)
    render json: { error: exception.message }, status: :bad_request
  end
end
