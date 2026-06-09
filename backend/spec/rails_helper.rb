# このファイルは `rails generate rspec:install` で生成され、プロジェクト用に拡張されている
require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
# 本番環境でのテスト実行を防止
abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'rspec/rails'

# テスト補助ライブラリ
require 'factory_bot_rails'
require 'database_cleaner/active_record'

# spec/support/ 以下のファイルを自動ロード
Rails.root.glob('spec/support/**/*.rb').sort_by(&:to_s).each { |f| require f }

# マイグレーション未実行チェック
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  # FactoryBot のショートハンドを有効化（`create(:user)` 等で呼び出せる）
  config.include FactoryBot::Syntax::Methods

  # フィクスチャパス（使用しない場合はそのまま）
  config.fixture_paths = [
    Rails.root.join('spec/fixtures')
  ]

  # DatabaseCleaner の設定
  config.use_transactional_fixtures = false

  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end

  # リクエストスペックはトランケーション方式（トランザクションが効かないケースに対応）
  config.before(:each, type: :request) do
    DatabaseCleaner.strategy = :truncation
  end

  config.after(:each, type: :request) do
    DatabaseCleaner.strategy = :transaction
  end

  # バックトレースからRails gem の行を除外
  config.filter_rails_from_backtrace!
end

# Shoulda Matchers の設定
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
