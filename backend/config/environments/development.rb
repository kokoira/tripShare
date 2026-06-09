require 'active_support/core_ext/integer/time'

Rails.application.configure do
  # 開発環境では eager_load を無効化
  config.enable_reloading = true
  config.eager_load = false

  # デバッグレベルのログ
  config.log_level = :debug

  # コード変更時にクラスをリロード
  config.cache_classes = false

  # DB の例外を詳細に表示
  config.active_record.verbose_query_logs = true

  # キャッシュを使用しない
  config.action_controller.perform_caching = false

  # HTTPS を強制しない
  config.force_ssl = false

  # メール送信を実際には行わない（ActiveJobキュー）
  # config.action_mailer.delivery_method = :letter_opener_web

  # Active Support のエラー報告
  config.action_dispatch.show_exceptions = :rescuable

  # コンソールに ANSI カラーコードを表示
  config.colorize_logging = true
end
