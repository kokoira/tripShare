require 'active_support/core_ext/integer/time'

Rails.application.configure do
  # テスト環境では eager_load を無効化
  config.enable_reloading = false
  config.eager_load = false

  # 警告は表示しない
  config.action_dispatch.show_exceptions = :none

  # キャッシュを無効化
  config.action_controller.perform_caching = false
  config.cache_store = :null_store

  # ActiveRecord のトランザクションフィクスチャ
  config.active_support.deprecation = :stderr

  # HTTPS を強制しない
  config.force_ssl = false

  # ログレベル
  config.log_level = :warn
end
