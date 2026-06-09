# lograge: 構造化JSON ログ設定
Rails.application.configure do
  config.lograge.enabled = true
  config.lograge.formatter = Lograge::Formatters::Json.new
  config.lograge.base_controller_class = 'ActionController::API'

  # ログに追加するカスタムフィールド
  config.lograge.custom_options = lambda do |event|
    options = {
      request_id: event.payload[:request_id],
      ip:         event.payload[:ip],
    }

    # 認証済みユーザーの ID を含める
    options[:user_id] = event.payload[:user_id] if event.payload[:user_id]

    # エラー情報を含める
    if event.payload[:exception]
      options[:error]       = event.payload[:exception].first
      options[:error_message] = event.payload[:exception].last
    end

    options.compact
  end
end
