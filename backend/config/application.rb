require_relative 'boot'
require 'rails/all'

# Gemfile に記述されている gem のみをロード
Bundler.require(*Rails.groups)

module TripshareBackend
  class Application < Rails::Application
    # Rails 7.2 のデフォルト設定を適用
    config.load_defaults 7.2

    # API モード: View 関連コンポーネントを除外
    config.api_only = true

    # タイムゾーン設定
    config.time_zone = 'Tokyo'
    config.active_record.default_timezone = :local

    # ロケール設定
    config.i18n.default_locale = :ja

    # ミドルウェア: Cookie セッション管理
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore,
                          key: '_tripshare_session',
                          expire_after: 24.hours,
                          httponly: true,
                          same_site: :lax

    # ログフォーマット（lograge）
    config.lograge.enabled = true
    config.lograge.formatter = Lograge::Formatters::Json.new
    config.lograge.custom_options = lambda do |event|
      {
        request_id: event.payload[:request_id],
        user_id: event.payload[:user_id],
        ip: event.payload[:ip],
      }.compact
    end
  end
end
