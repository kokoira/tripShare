# スレッド数設定
max_threads_count = ENV.fetch('RAILS_MAX_THREADS', 5)
min_threads_count = ENV.fetch('RAILS_MIN_THREADS') { max_threads_count }
threads min_threads_count, max_threads_count

# ワーカープロセス数（本番環境）
worker_count = Integer(ENV.fetch('WEB_CONCURRENCY', 0))
workers worker_count if worker_count > 1

# ポート設定
port ENV.fetch('PORT', 3000)

# 環境設定
environment ENV.fetch('RAILS_ENV', 'development')

# PID ファイル設定
pidfile ENV.fetch('PIDFILE', 'tmp/pids/server.pid')

# ワーカー起動前フック（開発環境のオートリロード用）
plugin :tmp_restart
