# CORS（クロスオリジンリクエスト）設定
# テスト環境ではCORSミドルウェアをスキップする（RSpecのリクエストスペックはOriginヘッダーなしで送信）
unless Rails.env.test?
  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins ENV.fetch('ALLOWED_ORIGINS', 'http://localhost:3000')

      resource '*',
               headers: :any,
               methods: %i[get post put patch delete options head],
               credentials: true, # Cookie 送受信を許可
               expose: ['X-Request-Id']
    end
  end
end
