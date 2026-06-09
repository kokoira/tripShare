#!/bin/bash
set -e

# Rails サーバーの pid ファイルが残っている場合は削除
rm -f /app/tmp/pids/server.pid

# コンテナのメインプロセスを実行
exec "$@"
