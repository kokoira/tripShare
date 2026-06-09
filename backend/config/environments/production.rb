require 'active_support/core_ext/integer/time'

Rails.application.configure do
  # 本番環境では eager_load を有効化
  config.enable_reloading = false
  config.eager_load = true

  # HTTPS を強制
  config.force_ssl = true

  # ログレベル
  config.log_level = :info

  # キャッシュを有効化
  config.action_controller.perform_caching = true

  # 例外を表示しない（適切なエラーページを表示）
  config.action_dispatch.show_exceptions = :all

  # 静的ファイルを配信しない（nginx/CDN が配信する）
  config.public_file_server.enabled = ENV['RAILS_SERVE_STATIC_FILES'].present?

  # ヘルスチェックのリクエストログを抑制
  config.silence_healthcheck_path = '/up'
end
